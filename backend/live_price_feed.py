from __future__ import annotations

import os
import json
from dataclasses import dataclass
from datetime import date, timedelta
from functools import lru_cache
from statistics import mean
from typing import Any
from urllib import error, parse, request

from dotenv import load_dotenv


load_dotenv()


@dataclass(frozen=True)
class LivePriceFeedConfig:
    url: str
    host: str
    key: str
    default_hotel_key: str
    default_currency: str
    default_no_of_adults: int
    default_age_of_children: str
    timeout_seconds: int
    default_blend_weight: float
    max_past_days: int
    max_future_days: int


@lru_cache(maxsize=1)
def get_live_price_config() -> LivePriceFeedConfig:
    url = os.getenv("RAPIDAPI_URL", "https://xotelo-hotel-prices.p.rapidapi.com/api/rates")
    host = os.getenv("RAPIDAPI_HOST", "xotelo-hotel-prices.p.rapidapi.com")
    key = os.getenv("RAPIDAPI_KEY", "")

    if not key:
        raise ValueError("Missing RAPIDAPI_KEY in environment")

    timeout_raw = os.getenv("PRICE_FEED_TIMEOUT_SECONDS", "12")
    blend_weight_raw = os.getenv("PRICE_FEED_BLEND_WEIGHT", "0.35")
    max_past_days_raw = os.getenv("PRICE_FEED_MAX_PAST_DAYS", "0")
    max_future_days_raw = os.getenv("PRICE_FEED_MAX_FUTURE_DAYS", "31")

    try:
        timeout_seconds = max(3, int(timeout_raw))
    except ValueError as exc:
        raise ValueError("PRICE_FEED_TIMEOUT_SECONDS must be an integer") from exc

    try:
        default_blend_weight = float(blend_weight_raw)
    except ValueError as exc:
        raise ValueError("PRICE_FEED_BLEND_WEIGHT must be a float") from exc

    if not 0 <= default_blend_weight <= 1:
        raise ValueError("PRICE_FEED_BLEND_WEIGHT must be between 0 and 1")

    try:
        max_past_days = max(0, int(max_past_days_raw))
    except ValueError as exc:
        raise ValueError("PRICE_FEED_MAX_PAST_DAYS must be an integer") from exc

    try:
        max_future_days = max(1, int(max_future_days_raw))
    except ValueError as exc:
        raise ValueError("PRICE_FEED_MAX_FUTURE_DAYS must be an integer") from exc

    return LivePriceFeedConfig(
        url=url,
        host=host,
        key=key,
        default_hotel_key=os.getenv("PRICE_FEED_DEFAULT_HOTEL_KEY", "g297930-d305178"),
        default_currency=os.getenv("PRICE_FEED_DEFAULT_CURRENCY", "EUR"),
        default_no_of_adults=max(1, int(os.getenv("PRICE_FEED_DEFAULT_NO_OF_ADULTS", "2"))),
        default_age_of_children=os.getenv("PRICE_FEED_DEFAULT_AGE_OF_CHILDREN", "0,1,3"),
        timeout_seconds=timeout_seconds,
        default_blend_weight=default_blend_weight,
        max_past_days=max_past_days,
        max_future_days=max_future_days,
    )


def get_live_allowed_date_window(reference_date: date | None = None) -> tuple[date, date]:
    config = get_live_price_config()
    today = reference_date or date.today()
    return today - timedelta(days=config.max_past_days), today + timedelta(days=config.max_future_days)


def infer_checkout(chk_in: str) -> str:
    check_in_date = date.fromisoformat(chk_in)
    return (check_in_date + timedelta(days=1)).isoformat()


def fetch_live_market_snapshot(
    *,
    hotel_key: str,
    currency: str,
    chk_in: str,
    chk_out: str,
    no_of_adults: int,
    childrens: list[dict[str, int]] | None,
    default_age_of_children: str,
) -> dict[str, Any]:
    config = get_live_price_config()

    childrens = childrens or []
    if childrens:
        children_ages = [str(int(child["age_of_children"])) for child in childrens]
        age_of_children = ",".join(children_ages)
    else:
        age_of_children = default_age_of_children

    provider_no_of_adults = max(2, int(no_of_adults))

    query = {
        "hotel_key": hotel_key,
        "currency": currency,
        "chk_in": chk_in,
        "chk_out": chk_out,
        "adults": provider_no_of_adults,
    }
    
    if childrens or age_of_children != "":
        query["age_of_children"] = age_of_children
    headers = {
        "x-rapidapi-key": config.key,
        "x-rapidapi-host": config.host,
        "Content-Type": "application/json",
    }

    encoded_query = parse.urlencode(query)
    http_request = request.Request(
        url=f"{config.url}?{encoded_query}",
        headers=headers,
        method="GET",
    )

    try:
        with request.urlopen(http_request, timeout=config.timeout_seconds) as http_response:
            body_text = http_response.read().decode("utf-8", errors="replace")
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")[:200]
        raise RuntimeError(f"Live price feed returned HTTP {exc.code}: {body}") from exc
    except error.URLError as exc:
        raise RuntimeError(f"Unable to reach live price feed: {exc}") from exc

    try:
        payload = json.loads(body_text)
    except ValueError as exc:
        raise RuntimeError("Live price feed returned invalid JSON") from exc

    if payload.get("error"):
        error_info = payload["error"]
        error_msg = str(error_info)
        
        if isinstance(error_info, dict) and "message" in error_info:
            raw_msg = str(error_info["message"]).lower()
            if "no_of_adults" in raw_msg and "invalid" in raw_msg:
                error_msg = "The number of adults specified exceeds the live market provider's maximum allowed capacity."
            elif "no_of_childrens" in raw_msg and "invalid" in raw_msg:
                error_msg = "The number of children specified exceeds the live market provider's maximum allowed capacity."
            else:
                error_msg = str(error_info["message"])
                
        raise RuntimeError(error_msg)

    result = payload.get("result") or {}
    rates_raw = result.get("rates") or []
    if not rates_raw:
        raise RuntimeError("Live price feed returned no rates for the requested stay")

    normalized_rates: list[dict[str, Any]] = []
    for rate_item in rates_raw:
        try:
            base_rate = float(rate_item.get("rate", 0) or 0)
            tax = float(rate_item.get("tax", 0) or 0)
        except (TypeError, ValueError):
            continue

        normalized_rates.append(
            {
                "code": str(rate_item.get("code", "unknown")),
                "name": str(rate_item.get("name", "unknown")),
                "rate": round(base_rate, 2),
                "tax": round(tax, 2),
                "total": round(base_rate + tax, 2),
            }
        )

    if not normalized_rates:
        raise RuntimeError("Live price feed returned unusable rates")

    totals = [entry["total"] for entry in normalized_rates]

    return {
        "chk_in": result.get("chk_in", chk_in),
        "chk_out": result.get("chk_out", chk_out),
        "currency": result.get("currency", currency),
        "rates": normalized_rates,
        "sources": len(normalized_rates),
        "market_average_total": round(float(mean(totals)), 2),
        "market_min_total": round(float(min(totals)), 2),
        "market_max_total": round(float(max(totals)), 2),
        "timestamp": payload.get("timestamp"),
    }
