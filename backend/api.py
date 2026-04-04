from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta
from functools import lru_cache
from typing import Any, Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

import main as predictor
from generate_dataset import generate_dataset
from live_price_feed import (
    fetch_live_market_snapshot,
    get_live_allowed_date_window,
    get_live_price_config,
)


MAX_PAST_DAYS = 0
MAX_FUTURE_DAYS = 31
LIVE_FEED_CURRENCY = "USD"
PRICING_INCLUSION_NOTE = "All prices include VAT and bed & breakfast."

RoomType = Literal[
    "Presidential Suite",
    "Junior Suite King",
    "Deluxe Suite King",
    "Water Park Suites King",
    "Water Park Suites Twin",
    "Water Park Suites Loft Family",
    "Deluxe Standards King",
    "Deluxe Standards Twin",
    "Deluxe Standards Family",
    "Deluxe Suite Twin",
    "Deluxe Suite Family",
]


class ChildInfo(BaseModel):
    age_of_children: int = Field(..., ge=0, le=10)


class AdviceRequest(BaseModel):
    chk_in: str = Field(..., description="Check-in date in YYYY-MM-DD format")
    chk_out: str = Field(..., description="Checkout date in YYYY-MM-DD format")
    room_type: RoomType = "Deluxe Suite King"
    use_live_feed: bool = True
    hotel_key: str | None = None
    currency: str | None = None
    no_of_adults: int = Field(default=2, ge=1)
    childrens: list[ChildInfo] = Field(default_factory=list)
    live_blend_weight: float | None = Field(default=None, ge=0, le=1)

    @field_validator("chk_in", "chk_out")
    @classmethod
    def validate_stay_date_format(cls, value: str, info: Any) -> str:
        predictor.parse_iso_date(value, label=info.field_name)
        return value


class DatasetRegenerateRequest(BaseModel):
    start_date: str = predictor.DEFAULT_DATA_START
    end_date: str = predictor.DEFAULT_DATA_END
    seed: int = 42
    samples_per_room: int = Field(default=2, ge=1, le=10)

    @field_validator("start_date", "end_date")
    @classmethod
    def validate_date_format(cls, value: str) -> str:
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as exc:
            raise ValueError("Date must be in YYYY-MM-DD format") from exc
        return value


def _train_runtime() -> dict[str, Any]:
    df = predictor.ensure_dataset_ready()
    price_model, occupancy_model, price_mae, occupancy_rmse = predictor.train_models(df)
    return {
        "df": df,
        "price_model": price_model,
        "occupancy_model": occupancy_model,
        "price_mae": float(price_mae),
        "occupancy_rmse": float(occupancy_rmse),
    }


@lru_cache(maxsize=1)
def get_runtime() -> dict[str, Any]:
    return _train_runtime()


def reload_runtime() -> dict[str, Any]:
    get_runtime.cache_clear()
    return get_runtime()


def run_prediction(dates: str, room_type: str, days_until_booking: int) -> list[dict[str, Any]]:
    return run_prediction_with_market(
        dates=dates,
        room_type=room_type,
        days_until_booking=days_until_booking,
        competitor_price_index_override=None,
    )


def run_prediction_with_market(
    dates: str,
    room_type: str,
    days_until_booking: int,
    competitor_price_index_override: float | None,
) -> list[dict[str, Any]]:
    runtime = get_runtime()
    dates_input = predictor.parse_input_dates(dates)
    return predictor.predict_revenue_advice(
        dates_input=dates_input,
        room_type=room_type,
        days_until_booking=days_until_booking,
        df=runtime["df"],
        price_model=runtime["price_model"],
        occupancy_model=runtime["occupancy_model"],
        competitor_price_index_override=competitor_price_index_override,
    )


def get_allowed_date_window(reference_date: date | None = None) -> tuple[date, date]:
    today = reference_date or date.today()
    return today - timedelta(days=MAX_PAST_DAYS), today + timedelta(days=MAX_FUTURE_DAYS)


def enforce_date_window(parsed_dates: list[date], *, label: str) -> None:
    if not parsed_dates:
        raise ValueError(f"{label} must include at least one date")

    today = date.today()
    min_allowed, max_allowed = get_allowed_date_window(today)

    for parsed_date in parsed_dates:
        if parsed_date < min_allowed or parsed_date > max_allowed:
            rule_text = "today or future dates only"
            if MAX_FUTURE_DAYS > 0:
                rule_text = f"today through {max_allowed.isoformat()}"

            raise ValueError(
                f"{label} includes '{parsed_date.isoformat()}', which is outside the allowed window "
                f"{min_allowed.isoformat()} to {max_allowed.isoformat()} "
                f"(today {today.isoformat()}, allowed: {rule_text})."
            )


def resolve_stay_input(chk_in: str, chk_out: str) -> tuple[date, date, str]:
    check_in_date = predictor.parse_iso_date(chk_in, label="chk_in")
    check_out_date = predictor.parse_iso_date(chk_out, label="chk_out")

    today = date.today()
    if check_in_date < today:
        raise ValueError(f"chk_in '{check_in_date.isoformat()}' cannot be in the past (today {today.isoformat()}).")
    if check_out_date <= check_in_date:
        raise ValueError("chk_out must be after chk_in. Same-day stays are not allowed.")

    min_allowed, max_allowed = get_allowed_date_window(today)
    last_night_date = check_out_date - timedelta(days=1)
    enforce_date_window([check_in_date, last_night_date], label="stay nights")

    if check_out_date > max_allowed + timedelta(days=1):
        raise ValueError(
            f"chk_out '{check_out_date.isoformat()}' is too far in the future. "
            f"For one-night stays, latest checkout is {(max_allowed + timedelta(days=1)).isoformat()}."
        )

    prediction_dates = (
        check_in_date.isoformat()
        if last_night_date == check_in_date
        else f"{check_in_date.isoformat()}:{last_night_date.isoformat()}"
    )

    return check_in_date, check_out_date, prediction_dates


def calculate_days_until_booking(check_in_date: date, reference_date: date | None = None) -> int:
    today = reference_date or date.today()
    return max(1, (check_in_date - today).days)


def normalize_live_currency(currency: str | None) -> tuple[str, str | None]:
    if currency and currency.upper() != LIVE_FEED_CURRENCY:
        return LIVE_FEED_CURRENCY, (
            f"Currency '{currency}' ignored. Live feed is fixed to {LIVE_FEED_CURRENCY}."
        )

    return LIVE_FEED_CURRENCY, None


def get_live_feed_window_warning(check_in_date: date, check_out_date: date) -> str | None:
    min_live_date, max_live_date = get_live_allowed_date_window()
    if (check_in_date < min_live_date or check_in_date > max_live_date or
            check_out_date < min_live_date or check_out_date > max_live_date):
        return (
            "Live feed skipped: requested stay is outside provider-supported window "
            f"{min_live_date.isoformat()} to {max_live_date.isoformat()}."
        )
    return None


def resolve_live_market_context(
    *,
    check_in_date: date,
    check_out_date: date,
    room_type: str,
    hotel_key: str | None,
    currency: str,
    no_of_adults: int | None,
    childrens: list[dict[str, int]] | None,
    live_blend_weight: float | None,
) -> tuple[dict[str, Any], float, float, float]:
    config = get_live_price_config()

    snapshot = fetch_live_market_snapshot(
        hotel_key=hotel_key or config.default_hotel_key,
        currency=currency or config.default_currency,
        chk_in=check_in_date.isoformat(),
        chk_out=check_out_date.isoformat(),
        no_of_adults=no_of_adults or config.default_no_of_adults,
        childrens=childrens,
        default_age_of_children=config.default_age_of_children,
    )

    base_room_price = float(predictor.ROOM_BASE_PRICES[room_type])
    competitor_price_index = float(snapshot["market_average_total"]) / base_room_price if base_room_price > 0 else 1.0
    blend_weight = live_blend_weight if live_blend_weight is not None else config.default_blend_weight

    return snapshot, competitor_price_index, base_room_price, float(blend_weight)


def apply_live_market_adjustment(
    predictions: list[dict[str, Any]],
    market_snapshot: dict[str, Any],
    base_room_price: float,
    blend_weight: float,
    stay_nights: int,
) -> None:
    stay_nights = max(1, stay_nights)
    market_average_total = float(market_snapshot["market_average_total"])
    market_min_total = float(market_snapshot["market_min_total"])
    market_max_total = float(market_snapshot["market_max_total"])
    market_average_nightly = market_average_total / stay_nights
    market_min_nightly = market_min_total / stay_nights
    market_max_nightly = market_max_total / stay_nights
    currency = str(market_snapshot.get("currency", "EUR"))
    source_count = int(market_snapshot.get("sources", 0))

    for prediction in predictions:
        model_price = float(prediction["advised_room_price"])
        model_ratio = (model_price / base_room_price) if base_room_price > 0 else 1.0

        # Keep model seasonality signal but anchor final recommendation around live market prices.
        anchored_multiplier = 1.0 + ((model_ratio - 1.0) * blend_weight)
        anchored_price = market_average_nightly * anchored_multiplier

        lower_bound = max(market_min_nightly * 0.90, market_average_nightly * 0.75)
        upper_bound = market_max_nightly * 1.35
        bounded_price = max(lower_bound, min(anchored_price, upper_bound))

        occupancy_pct = float(prediction["expected_occupancy_pct"])
        prediction["advised_room_price"] = round(bounded_price, 2)
        prediction["expected_revenue_per_available_room"] = round(bounded_price * (occupancy_pct / 100.0), 2)
        prediction["stay_total_price"] = round(bounded_price * stay_nights, 2)
        prediction["stay_total_revenue_per_available_room"] = round(
            bounded_price * stay_nights * (occupancy_pct / 100.0),
            2,
        )

        reason = prediction.get("reason", [])
        reason.append(
            f"Live USD market anchor applied ({blend_weight:.2f}) using average total "
            f"{market_average_total:.2f} {currency} from {source_count} source(s) across {stay_nights} night(s)"
        )
        prediction["reason"] = reason


def apply_party_size_adjustment(
    predictions: list[dict[str, Any]],
    *,
    no_of_adults: int,
    childrens: list[dict[str, int]],
) -> None:
    adults = max(1, no_of_adults)
    child_count = len(childrens)
    weighted_children = sum(0.35 + (min(10, max(0, child["age_of_children"])) * 0.04) for child in childrens)
    weighted_guests = adults + weighted_children

    # Baseline demand assumes 2 adults and no children.
    occupancy_pressure = weighted_guests - 2.0
    multiplier = float(min(1.60, max(0.85, 1.0 + (0.06 * occupancy_pressure))))

    for prediction in predictions:
        current_price = float(prediction["advised_room_price"])
        adjusted_price = current_price * multiplier
        occupancy_pct = float(prediction["expected_occupancy_pct"])

        prediction["advised_room_price"] = round(adjusted_price, 2)
        prediction["expected_revenue_per_available_room"] = round(adjusted_price * (occupancy_pct / 100.0), 2)

        reason = prediction.get("reason", [])
        reason.append(
            f"Party-size adjustment applied (x{multiplier:.2f}) for {adults} adult(s) and "
            f"{child_count} child(ren)"
        )
        prediction["reason"] = reason


def calculate_party_size_factor(*, no_of_adults: int, childrens: list[dict[str, int]]) -> float:
    adult_units = max(1, no_of_adults)
    child_units = sum(0.55 + (min(10, max(0, child["age_of_children"])) * 0.02) for child in childrens)

    total_units = adult_units + child_units
    reference_units = 1.69

    factor = 1.0 + ((total_units - reference_units) * 0.03)
    return float(min(1.10, max(0.90, factor)))


def build_final_pricing(
    predictions: list[dict[str, Any]],
    stay_nights: int,
    *,
    base_room_price: float,
    live_feed_used: bool,
    no_of_adults: int,
    childrens: list[dict[str, int]],
) -> dict[str, Any]:
    if not predictions:
        return {
            "advised_nightly_price": 0.0,
            "total_stay_price": 0.0,
            "avg_expected_occupancy_pct": 0.0,
            "expected_stay_revenue_per_available_room": 0.0,
            "nightly_price_min": 0.0,
            "nightly_price_max": 0.0,
            "pricing_note": PRICING_INCLUSION_NOTE,
            "reason": [],
        }

    nightly_prices = [float(prediction["advised_room_price"]) for prediction in predictions]
    occupancy_weights = [max(0.01, float(prediction["expected_occupancy_pct"]) / 100.0) for prediction in predictions]

    weighted_price_numerator = sum(price * weight for price, weight in zip(nightly_prices, occupancy_weights))
    weighted_price_denominator = sum(occupancy_weights)
    advised_nightly_price = weighted_price_numerator / weighted_price_denominator

    party_size_factor = calculate_party_size_factor(no_of_adults=no_of_adults, childrens=childrens)
    # Keep the final recommendation close to the room's base nightly rate, while still allowing
    # a small, predictable adjustment from demand signals and party size.
    if live_feed_used:
        market_signal_factor = advised_nightly_price / base_room_price if base_room_price > 0 else 1.0
        market_signal_factor = min(1.05, max(0.95, market_signal_factor))
        lower_bound = base_room_price * 0.92
        upper_bound = base_room_price * 1.08
    else:
        market_signal_factor = 1.0
        lower_bound = base_room_price * 0.98
        upper_bound = base_room_price * 1.02

    advised_nightly_price = base_room_price * market_signal_factor * party_size_factor
    advised_nightly_price = max(lower_bound, min(advised_nightly_price, upper_bound))

    avg_occupancy_pct = sum(float(prediction["expected_occupancy_pct"]) for prediction in predictions) / len(predictions)
    expected_stay_revpar = sum(float(prediction["expected_revenue_per_available_room"]) for prediction in predictions)

    consolidated_reasons: list[str] = []
    for prediction in predictions:
        for reason in prediction.get("reason", []):
            if reason not in consolidated_reasons:
                consolidated_reasons.append(reason)

    return {
        "advised_nightly_price": round(advised_nightly_price, 2),
        "total_stay_price": round(advised_nightly_price * stay_nights, 2),
        "avg_expected_occupancy_pct": round(avg_occupancy_pct, 1),
        "expected_stay_revenue_per_available_room": round(expected_stay_revpar, 2),
        "nightly_price_min": round(min(nightly_prices), 2),
        "nightly_price_max": round(max(nightly_prices), 2),
        "pricing_note": PRICING_INCLUSION_NOTE,
        "reason": consolidated_reasons,
    }


def build_advice_response(
    *,
    chk_in: str,
    chk_out: str,
    room_type: str,
    use_live_feed: bool,
    hotel_key: str | None,
    currency: str | None,
    no_of_adults: int,
    childrens: list[dict[str, int]] | None,
    live_blend_weight: float | None,
) -> dict[str, Any]:
    check_in_date, check_out_date, prediction_dates = resolve_stay_input(chk_in, chk_out)
    days_until_booking = calculate_days_until_booking(check_in_date)
    stay_nights = (check_out_date - check_in_date).days
    childrens = childrens or []
    no_of_childrens = len(childrens)

    live_market_context: dict[str, Any] | None = None
    competitor_price_index_override: float | None = None
    base_room_price = float(predictor.ROOM_BASE_PRICES[room_type])
    resolved_blend_weight = 0.0
    warnings: list[str] = []
    live_feed_used = False
    resolved_currency = currency

    if use_live_feed:
        live_window_warning = get_live_feed_window_warning(check_in_date, check_out_date)
        resolved_currency, currency_warning = normalize_live_currency(currency)

        if currency_warning:
            warnings.append(currency_warning)

        if live_window_warning:
            warnings.append(live_window_warning)
        else:
            try:
                live_market_context, competitor_price_index_override, base_room_price, resolved_blend_weight = (
                    resolve_live_market_context(
                        check_in_date=check_in_date,
                        check_out_date=check_out_date,
                        room_type=room_type,
                        hotel_key=hotel_key,
                        currency=resolved_currency,
                        no_of_adults=no_of_adults,
                        childrens=childrens,
                        live_blend_weight=live_blend_weight,
                    )
                )
                live_feed_used = True
            except RuntimeError as exc:
                warnings.append(f"Live feed skipped due to provider error: {exc}")

    predictions = run_prediction_with_market(
        dates=prediction_dates,
        room_type=room_type,
        days_until_booking=days_until_booking,
        competitor_price_index_override=competitor_price_index_override,
    )

    if live_market_context is not None:
        apply_live_market_adjustment(
            predictions=predictions,
            market_snapshot=live_market_context,
            base_room_price=base_room_price,
            blend_weight=resolved_blend_weight,
            stay_nights=stay_nights,
        )

    apply_party_size_adjustment(
        predictions=predictions,
        no_of_adults=no_of_adults,
        childrens=childrens,
    )

    final_pricing = build_final_pricing(
        predictions,
        stay_nights,
        base_room_price=base_room_price,
        live_feed_used=live_feed_used,
        no_of_adults=no_of_adults,
        childrens=childrens,
    )

    response: dict[str, Any] = {
        "input": {
            "chk_in": check_in_date.isoformat(),
            "chk_out": check_out_date.isoformat(),
            "room_type": room_type,
            "days_until_booking": days_until_booking,
            "stay_nights": stay_nights,
            "use_live_feed": use_live_feed,
            "hotel_key": hotel_key,
            "currency": resolved_currency,
            "no_of_adults": no_of_adults,
            "no_of_childrens": no_of_childrens,
            "childrens": childrens,
            "live_blend_weight": live_blend_weight,
        },
        "live_feed_used": live_feed_used,
        "stay_nights": stay_nights,
        "final_pricing": final_pricing,
    }

    if live_market_context is not None:
        response["live_market_context"] = live_market_context
    if warnings:
        response["warnings"] = warnings

    return response


@asynccontextmanager
async def lifespan(_: FastAPI):
    get_runtime()
    yield


app = FastAPI(
    title="PricePilot Revenue Advisory API",
    version="1.0.0",
    description="Calendar-aware Ethiopian-context resort pricing and revenue advisory API.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root() -> dict[str, str]:
    return {
        "service": "PricePilot Revenue Advisory API",
        "docs": "/docs",
        "openapi": "/openapi.json",
    }


@app.get("/health")
def health() -> dict[str, Any]:
    runtime = get_runtime()
    df = runtime["df"]
    return {
        "status": "ok",
        "dataset_rows": int(len(df)),
        "dataset_date_start": str(df["date"].min()),
        "dataset_date_end": str(df["date"].max()),
        "price_model_test_mae": round(runtime["price_mae"], 2),
        "occupancy_model_test_rmse": round(runtime["occupancy_rmse"], 4),
    }


@app.get("/v1/room-types")
def room_types() -> dict[str, Any]:
    return {
        "room_types": predictor.VALID_ROOM_TYPES,
        "base_room_prices": predictor.ROOM_BASE_PRICES,
        "room_catalog": [
            {"name": room_type, "base_price_per_night_usd": predictor.ROOM_BASE_PRICES[room_type]}
            for room_type in predictor.VALID_ROOM_TYPES
        ],
    }


@app.get("/v1/advice")
def get_advice(
    chk_in: str = Query(..., description="Check-in date in YYYY-MM-DD format"),
    chk_out: str = Query(..., description="Checkout date in YYYY-MM-DD format"),
    room_type: RoomType = Query(default="Deluxe Suite King"),
    use_live_feed: bool = Query(default=True),
    hotel_key: str | None = Query(default=None),
    currency: str | None = Query(default=None),
    no_of_adults: int = Query(default=2, ge=1),
    childrens_ages: list[int] | None = Query(default=None, description="Repeat this param for each child age, max 10"),
    live_blend_weight: float | None = Query(default=None, ge=0, le=1),
) -> dict[str, Any]:
    try:
        childrens = [{"age_of_children": age} for age in (childrens_ages or [])]
        for child in childrens:
            if child["age_of_children"] > 10 or child["age_of_children"] < 0:
                raise ValueError("Each age_of_children must be between 0 and 10")

        return build_advice_response(
            chk_in=chk_in,
            chk_out=chk_out,
            room_type=room_type,
            use_live_feed=use_live_feed,
            hotel_key=hotel_key,
            currency=currency,
            no_of_adults=no_of_adults,
            childrens=childrens,
            live_blend_weight=live_blend_weight,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.post("/v1/advice")
def post_advice(payload: AdviceRequest) -> dict[str, Any]:
    try:
        childrens = [child.model_dump() for child in payload.childrens]
        return build_advice_response(
            chk_in=payload.chk_in,
            chk_out=payload.chk_out,
            room_type=payload.room_type,
            use_live_feed=payload.use_live_feed,
            hotel_key=payload.hotel_key,
            currency=payload.currency,
            no_of_adults=payload.no_of_adults,
            childrens=childrens,
            live_blend_weight=payload.live_blend_weight,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/v1/live-rates")
def get_live_rates(
    chk_in: str = Query(..., description="Check-in date in YYYY-MM-DD format"),
    chk_out: str = Query(..., description="Checkout date in YYYY-MM-DD format"),
    hotel_key: str | None = Query(default=None),
    currency: str | None = Query(default=None),
    no_of_adults: int = Query(default=2, ge=1),
    childrens_ages: list[int] | None = Query(default=None, description="Repeat this param for each child age, max 10"),
) -> dict[str, Any]:
    try:
        config = get_live_price_config()
        resolved_currency, currency_warning = normalize_live_currency(currency)
        check_in_date, check_out_date, _ = resolve_stay_input(chk_in, chk_out)
        check_out_value = check_out_date.isoformat()
        childrens = [{"age_of_children": age} for age in (childrens_ages or [])]
        for child in childrens:
            if child["age_of_children"] > 10 or child["age_of_children"] < 0:
                raise ValueError("Each age_of_children must be between 0 and 10")

        live_window_warning = get_live_feed_window_warning(check_in_date, check_out_date)
        if live_window_warning:
            raise ValueError(live_window_warning)

        snapshot = fetch_live_market_snapshot(
            hotel_key=hotel_key or config.default_hotel_key,
            currency=resolved_currency,
            chk_in=check_in_date.isoformat(),
            chk_out=check_out_value,
            no_of_adults=no_of_adults,
            childrens=childrens,
            default_age_of_children=config.default_age_of_children,
        )
        if currency_warning:
            snapshot["warning"] = currency_warning
        return snapshot
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc


@app.get("/v1/date-window")
def date_window() -> dict[str, Any]:
    today = date.today()
    min_allowed, max_allowed = get_allowed_date_window(today)
    live_min_allowed, live_max_allowed = get_live_allowed_date_window(today)

    return {
        "today": today.isoformat(),
        "min_allowed_date": min_allowed.isoformat(),
        "max_allowed_date": max_allowed.isoformat(),
        "max_past_days": MAX_PAST_DAYS,
        "max_future_days": MAX_FUTURE_DAYS,
        "same_day_stays_allowed": False,
        "requires_check_in_and_check_out": True,
        "live_feed_min_allowed_date": live_min_allowed.isoformat(),
        "live_feed_max_allowed_date": live_max_allowed.isoformat(),
    }


@app.post("/v1/admin/reload-model")
def reload_model() -> dict[str, Any]:
    runtime = reload_runtime()
    return {
        "message": "Model cache cleared and retrained successfully.",
        "price_model_test_mae": round(runtime["price_mae"], 2),
        "occupancy_model_test_rmse": round(runtime["occupancy_rmse"], 4),
    }


@app.post("/v1/admin/regenerate-dataset")
def regenerate_dataset_route(payload: DatasetRegenerateRequest) -> dict[str, Any]:
    start = datetime.strptime(payload.start_date, "%Y-%m-%d").date()
    end = datetime.strptime(payload.end_date, "%Y-%m-%d").date()
    if end < start:
        raise HTTPException(status_code=400, detail="end_date must be on or after start_date")

    dataset = generate_dataset(
        start_date=payload.start_date,
        end_date=payload.end_date,
        output_path=predictor.DATA_FILE,
        seed=payload.seed,
        samples_per_room=payload.samples_per_room,
    )
    runtime = reload_runtime()

    return {
        "message": "Dataset regenerated and models retrained.",
        "rows_generated": int(len(dataset)),
        "date_start": str(dataset["date"].min()),
        "date_end": str(dataset["date"].max()),
        "price_model_test_mae": round(runtime["price_mae"], 2),
        "occupancy_model_test_rmse": round(runtime["occupancy_rmse"], 4),
    }