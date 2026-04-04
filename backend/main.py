from __future__ import annotations

import calendar
import json
import pickle
import re
from datetime import date, datetime, timedelta
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error
from sklearn.model_selection import train_test_split

from generate_dataset import (
    ROOM_BASE_PRICES,
    ROOM_TYPES,
    CalendarContext,
    build_calendar_maps,
    generate_dataset,
    get_calendar_context,
)

DATA_FILE = Path("data/data.csv")
PRICE_MODEL_FILE = Path("data/price_model.pkl")
OCCUPANCY_MODEL_FILE = Path("data/occupancy_model.pkl")
METRICS_FILE = Path("data/metrics.json")
DEFAULT_DATA_START = "2024-01-01"
DEFAULT_DATA_END = "2028-12-31"
EXPECTED_ROOM_TYPES = set(ROOM_TYPES.values())

FEATURES = [
    "day_of_week",
    "day_of_month",
    "week_of_year",
    "month",
    "quarter",
    "is_weekend",
    "is_holiday",
    "is_christian_holiday",
    "is_muslim_holiday",
    "holiday_count",
    "event_nearby",
    "days_until_booking",
    "room_type_code",
    "base_room_price",
    "competitor_price_index",
]

PRICE_TARGET = "recommended_price"
OCCUPANCY_TARGET = "occupancy_rate"

ROOM_TYPE_TO_CODE = {name: code for code, name in ROOM_TYPES.items()}
VALID_ROOM_TYPES = list(ROOM_TYPE_TO_CODE.keys())
ROOM_TYPE_LOOKUP = {room_type.lower(): room_type for room_type in VALID_ROOM_TYPES}
ISO_DATE_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def parse_iso_date(raw_date: str, *, label: str) -> date:
    normalized = raw_date.strip()
    if not ISO_DATE_PATTERN.fullmatch(normalized):
        raise ValueError(f"Invalid {label} format '{raw_date}'. Expected YYYY-MM-DD.")

    try:
        return date.fromisoformat(normalized)
    except ValueError as exc:
        raise ValueError(f"Invalid {label} '{normalized}'. It is not a real calendar date.") from exc


def parse_date_query(dates_input: str | tuple[str, str] | list[str]) -> list[date]:
    if isinstance(dates_input, str):
        return [parse_iso_date(dates_input, label="date")]

    if isinstance(dates_input, tuple) and len(dates_input) == 2:
        start = parse_iso_date(dates_input[0], label="start date")
        end = parse_iso_date(dates_input[1], label="end date")
        if end < start:
            raise ValueError("End date cannot be earlier than start date")
        return [start + timedelta(days=delta) for delta in range((end - start).days + 1)]

    if isinstance(dates_input, list):
        if not dates_input:
            raise ValueError("At least one date is required")

        parsed_dates: list[date] = []
        for index, raw_date in enumerate(dates_input, start=1):
            parsed_dates.append(parse_iso_date(raw_date, label=f"date at position {index}"))
        return parsed_dates

    raise ValueError("Invalid input format")


def ensure_dataset_ready() -> pd.DataFrame:
    required_columns = set(FEATURES + [PRICE_TARGET, OCCUPANCY_TARGET])
    expected_room_types = EXPECTED_ROOM_TYPES

    if DATA_FILE.exists():
        existing_df = pd.read_csv(DATA_FILE)
        existing_room_types = set(existing_df["room_type"].dropna().astype(str).unique()) if "room_type" in existing_df else set()
        if required_columns.issubset(set(existing_df.columns)) and existing_room_types == expected_room_types:
            return existing_df

        print("Existing dataset schema or room catalog is outdated. Regenerating with calendar-aware features...")
    else:
        print("Dataset not found. Generating synthetic dataset...")

    generated_df = generate_dataset(
        start_date=DEFAULT_DATA_START,
        end_date=DEFAULT_DATA_END,
        output_path=DATA_FILE,
        seed=42,
        samples_per_room=2,
    )
    return generated_df


def train_models(df: pd.DataFrame, force_retrain: bool = False) -> tuple[RandomForestRegressor, RandomForestRegressor, float, float]:
    if not force_retrain and PRICE_MODEL_FILE.exists() and OCCUPANCY_MODEL_FILE.exists() and METRICS_FILE.exists():
        print("Loading pre-trained models from disk...")
        with open(PRICE_MODEL_FILE, "rb") as f:
            price_model = pickle.load(f)
        with open(OCCUPANCY_MODEL_FILE, "rb") as f:
            occupancy_model = pickle.load(f)
        with open(METRICS_FILE, "r") as f:
            metrics = json.load(f)
        return price_model, occupancy_model, float(metrics["price_mae"]), float(metrics["occupancy_rmse"])

    print("Training new models...")
    X = df[FEATURES]
    y_price = df[PRICE_TARGET]
    y_occupancy = df[OCCUPANCY_TARGET]

    X_train, X_test, y_price_train, y_price_test, y_occ_train, y_occ_test = train_test_split(
        X,
        y_price,
        y_occupancy,
        test_size=0.2,
        random_state=42,
    )

    price_model = RandomForestRegressor(
        n_estimators=140,
        max_depth=16,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )
    occupancy_model = RandomForestRegressor(
        n_estimators=120,
        max_depth=14,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1,
    )

    price_model.fit(X_train, y_price_train)
    occupancy_model.fit(X_train, y_occ_train)

    price_predictions = price_model.predict(X_test)
    occupancy_predictions = occupancy_model.predict(X_test)

    price_mae = mean_absolute_error(y_price_test, price_predictions)
    occupancy_rmse = float(np.sqrt(mean_squared_error(y_occ_test, occupancy_predictions)))

    print(f"Price model trained. Test MAE: {price_mae:.2f}")
    print(f"Occupancy model trained. Test RMSE: {occupancy_rmse:.4f}")

    PRICE_MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(PRICE_MODEL_FILE, "wb") as f:
        pickle.dump(price_model, f)
    with open(OCCUPANCY_MODEL_FILE, "wb") as f:
        pickle.dump(occupancy_model, f)
    with open(METRICS_FILE, "w") as f:
        json.dump({"price_mae": float(price_mae), "occupancy_rmse": float(occupancy_rmse)}, f)

    return price_model, occupancy_model, float(price_mae), occupancy_rmse


def build_reasoning(
    target_date: date,
    calendar_ctx: CalendarContext,
    room_type: str,
    days_until_booking: int,
    advised_price: float,
    baseline_price: float,
) -> list[str]:
    day_name = calendar.day_name[target_date.weekday()]
    reasons = [f"{day_name} ({'weekend' if target_date.weekday() >= 5 else 'weekday'})"]

    holiday_names = calendar_ctx["holiday_names"]
    if holiday_names:
        reasons.append(f"Holiday signals: {', '.join(holiday_names)}")
    else:
        reasons.append("No major holiday signal")

    if calendar_ctx["is_christian_holiday"]:
        reasons.append("Christian holiday impact included")
    if calendar_ctx["is_muslim_holiday"]:
        reasons.append("Muslim holiday impact included")

    if calendar_ctx["event_nearby"]:
        event_name = calendar_ctx["event_name"] or "local event"
        reasons.append(f"Nearby demand event: {event_name}")
    else:
        reasons.append("No nearby demand-driving event")

    reasons.append(f"Room type: {room_type} | Booking lead time: {days_until_booking} day(s)")

    reasons.append("Pricing recommendation is based on calendar demand and booking context")

    return reasons


def predict_revenue_advice(
    dates_input: str | tuple[str, str] | list[str],
    room_type: str,
    days_until_booking: int,
    df: pd.DataFrame,
    price_model: RandomForestRegressor,
    occupancy_model: RandomForestRegressor,
    competitor_price_index_override: float | None = None,
) -> list[dict[str, object]]:
    dates = parse_date_query(dates_input)

    min_year = min(input_date.year for input_date in dates) - 1
    max_year = max(input_date.year for input_date in dates) + 1
    calendar_maps = build_calendar_maps(min_year, max_year)

    room_type_code = ROOM_TYPE_TO_CODE[room_type]
    base_room_price = float(ROOM_BASE_PRICES[room_type])
    if competitor_price_index_override is None:
        competitor_price_index = float(df["competitor_price_index"].median())
    else:
        competitor_price_index = float(np.clip(competitor_price_index_override, 0.05, 3.0))

    feature_rows: list[dict[str, float | int]] = []
    contexts: list[CalendarContext] = []

    for target_date in dates:
        calendar_ctx = get_calendar_context(target_date, calendar_maps)
        contexts.append(calendar_ctx)

        feature_rows.append(
            {
                "day_of_week": target_date.weekday(),
                "day_of_month": target_date.day,
                "week_of_year": int(target_date.isocalendar().week),
                "month": target_date.month,
                "quarter": (target_date.month - 1) // 3 + 1,
                "is_weekend": int(target_date.weekday() >= 5),
                "is_holiday": calendar_ctx["is_holiday"],
                "is_christian_holiday": calendar_ctx["is_christian_holiday"],
                "is_muslim_holiday": calendar_ctx["is_muslim_holiday"],
                "holiday_count": calendar_ctx["holiday_count"],
                "event_nearby": calendar_ctx["event_nearby"],
                "days_until_booking": days_until_booking,
                "room_type_code": room_type_code,
                "base_room_price": base_room_price,
                "competitor_price_index": competitor_price_index,
            }
        )

    prediction_frame = pd.DataFrame(feature_rows)[FEATURES]
    predicted_prices = price_model.predict(prediction_frame)
    predicted_occupancy = occupancy_model.predict(prediction_frame)

    results: list[dict[str, object]] = []
    for index, target_date in enumerate(dates):
        advised_price = float(np.clip(predicted_prices[index], base_room_price * 0.6, base_room_price * 2.5))
        occupancy = float(np.clip(predicted_occupancy[index], 0.05, 0.99))
        revpar = advised_price * occupancy

        results.append(
            {
                "date": target_date.isoformat(),
                "room_type": room_type,
                "advised_room_price": round(advised_price, 2),
                "expected_occupancy_pct": round(occupancy * 100, 1),
                "expected_revenue_per_available_room": round(revpar, 2),
                "holiday_tags": contexts[index]["holiday_names"] if contexts[index]["holiday_names"] else ["None"],
                "reason": build_reasoning(
                    target_date=target_date,
                    calendar_ctx=contexts[index],
                    room_type=room_type,
                    days_until_booking=days_until_booking,
                    advised_price=advised_price,
                    baseline_price=base_room_price,
                ),
            }
        )

    return results


def parse_input_dates(raw_input: str) -> str | tuple[str, str] | list[str]:
    if ":" in raw_input:
        start, end = raw_input.split(":", maxsplit=1)
        return start.strip(), end.strip()

    if "," in raw_input:
        return [date_input.strip() for date_input in raw_input.split(",") if date_input.strip()]

    return raw_input.strip()


def main() -> None:
    df = ensure_dataset_ready()
    price_model, occupancy_model, _, _ = train_models(df)

    print("\n--- PricePilot Revenue Advisory (Ethiopia Calendar-Aware) ---")
    raw_dates = input(
        "Enter date 'YYYY-MM-DD', range 'YYYY-MM-DD:YYYY-MM-DD', or list 'YYYY-MM-DD,YYYY-MM-DD': "
    )

    room_type_input = input(
        f"Enter room type {VALID_ROOM_TYPES} (default: Deluxe Suite King): "
    ).strip().lower()
    room_type = ROOM_TYPE_LOOKUP.get(room_type_input, "Deluxe Suite King")

    dates_input = parse_input_dates(raw_dates)
    dates_for_lead_time = parse_date_query(dates_input)
    days_until_booking = max(1, (min(dates_for_lead_time) - date.today()).days)
    predictions = predict_revenue_advice(
        dates_input=dates_input,
        room_type=room_type,
        days_until_booking=days_until_booking,
        df=df,
        price_model=price_model,
        occupancy_model=occupancy_model,
    )

    print(json.dumps(predictions, indent=4))


if __name__ == "__main__":
    main()