from __future__ import annotations

import argparse
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import TypedDict

import holidays
import numpy as np
import pandas as pd
from dateutil.easter import EASTER_ORTHODOX, easter
from hijridate.convert import Hijri


ROOM_TYPES = {
    0: "Presidential Suite",
    1: "Junior Suite King",
    2: "Deluxe Suite King",
    3: "Water Park Suites King",
    4: "Water Park Suites Twin",
    5: "Water Park Suites Loft Family",
    6: "Deluxe Standards King",
    7: "Deluxe Standards Twin",
    8: "Deluxe Standards Family",
    9: "Deluxe Suite Twin",
    10: "Deluxe Suite Family",
}
ROOM_BASE_PRICES = {
    "Presidential Suite": 357.82,
    "Junior Suite King": 169.21,
    "Deluxe Suite King": 145.44,
    "Water Park Suites King": 136.89,
    "Water Park Suites Twin": 153.14,
    "Water Park Suites Loft Family": 242.40,
    "Deluxe Standards King": 126.12,
    "Deluxe Standards Twin": 142.36,
    "Deluxe Standards Family": 277.02,
    "Deluxe Suite Twin": 153.14,
    "Deluxe Suite Family": 298.57,
}

# Synthetic monthly demand pattern for Ethiopian resort seasonality.
MONTH_DEMAND_FACTORS = {
    1: 0.13,
    2: 0.08,
    3: 0.06,
    4: 0.02,
    5: 0.03,
    6: -0.02,
    7: -0.05,
    8: -0.06,
    9: 0.09,
    10: 0.07,
    11: 0.11,
    12: 0.16,
}

ISLAMIC_HOLIDAY_RULES = [
    (10, 1, "Eid al-Fitr"),
    (12, 10, "Eid al-Adha"),
    (3, 12, "Mawlid"),
]


HolidayMap = dict[date, list[str]]
EventMap = dict[date, str]


class CalendarMaps(TypedDict):
    public_holidays: HolidayMap
    christian_holidays: HolidayMap
    muslim_holidays: HolidayMap
    event_calendar: EventMap
    event_window: set[date]


class CalendarContext(TypedDict):
    holiday_names: list[str]
    is_holiday: int
    holiday_count: int
    is_christian_holiday: int
    is_muslim_holiday: int
    event_name: str | None
    event_nearby: int


def last_weekday_of_month(year: int, month: int, weekday: int) -> date:
    """Return the last weekday (0=Mon .. 6=Sun) for a month."""
    cursor = date(year, month + 1, 1) - timedelta(days=1) if month < 12 else date(year, 12, 31)
    while cursor.weekday() != weekday:
        cursor -= timedelta(days=1)
    return cursor


def add_holiday_entry(mapping: HolidayMap, when: date, label: str) -> None:
    mapping.setdefault(when, []).append(label)


def build_public_holidays(start_year: int, end_year: int) -> HolidayMap:
    holiday_map: HolidayMap = {}
    et_holidays = holidays.country_holidays("ET", years=range(start_year, end_year + 1))
    for holiday_date, holiday_name in et_holidays.items():
        add_holiday_entry(holiday_map, holiday_date, str(holiday_name))
    return holiday_map


def build_christian_holidays(start_year: int, end_year: int) -> HolidayMap:
    holiday_map: HolidayMap = {}
    for year in range(start_year, end_year + 1):
        add_holiday_entry(holiday_map, date(year, 1, 7), "Genna")
        add_holiday_entry(holiday_map, date(year, 1, 19), "Timket")
        add_holiday_entry(holiday_map, date(year, 9, 27), "Meskel")

        orthodox_easter = easter(year, method=EASTER_ORTHODOX)
        add_holiday_entry(holiday_map, orthodox_easter - timedelta(days=2), "Good Friday (Orthodox)")
        add_holiday_entry(holiday_map, orthodox_easter, "Fasika (Orthodox Easter)")
    return holiday_map


def build_muslim_holidays(start_year: int, end_year: int) -> HolidayMap:
    holiday_map: HolidayMap = {}

    # Hijri year is roughly Gregorian year - 579.
    hijri_start = start_year - 581
    hijri_end = end_year - 575

    for hijri_year in range(hijri_start, hijri_end + 1):
        for hijri_month, hijri_day, holiday_name in ISLAMIC_HOLIDAY_RULES:
            try:
                g_date = Hijri(hijri_year, hijri_month, hijri_day).to_gregorian()
            except ValueError:
                continue

            g_day = date(g_date.year, g_date.month, g_date.day)
            if start_year <= g_day.year <= end_year:
                add_holiday_entry(holiday_map, g_day, holiday_name)

    return holiday_map


def build_event_calendar(start_year: int, end_year: int) -> EventMap:
    event_map: EventMap = {}
    for year in range(start_year, end_year + 1):
        event_map[last_weekday_of_month(year, 11, 6)] = "Great Ethiopian Run"
        event_map[date(year, 9, 11)] = "Enkutatash Festival"
        event_map[date(year, 1, 18)] = "Timket Eve Gatherings"
        event_map[date(year, 5, 15)] = "Coffee and Tourism Expo"
    return event_map


def build_event_window(event_map: EventMap, radius_days: int = 1) -> set[date]:
    window: set[date] = set()
    for event_date in event_map:
        for offset in range(-radius_days, radius_days + 1):
            window.add(event_date + timedelta(days=offset))
    return window


def deduplicate(values: list[str]) -> list[str]:
    seen: set[str] = set()
    unique_values: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            unique_values.append(value)
    return unique_values


def build_calendar_maps(start_year: int, end_year: int) -> CalendarMaps:
    public_holidays = build_public_holidays(start_year, end_year)
    christian_holidays = build_christian_holidays(start_year, end_year)
    muslim_holidays = build_muslim_holidays(start_year, end_year)
    event_calendar = build_event_calendar(start_year, end_year)
    event_window = build_event_window(event_calendar, radius_days=1)

    return {
        "public_holidays": public_holidays,
        "christian_holidays": christian_holidays,
        "muslim_holidays": muslim_holidays,
        "event_calendar": event_calendar,
        "event_window": event_window,
    }


def get_calendar_context(target_date: date, calendar_maps: CalendarMaps) -> CalendarContext:
    public_holidays = calendar_maps["public_holidays"]
    christian_holidays = calendar_maps["christian_holidays"]
    muslim_holidays = calendar_maps["muslim_holidays"]
    event_calendar = calendar_maps["event_calendar"]
    event_window = calendar_maps["event_window"]

    holiday_names = deduplicate(
        public_holidays.get(target_date, [])
        + christian_holidays.get(target_date, [])
        + muslim_holidays.get(target_date, [])
    )

    return {
        "holiday_names": holiday_names,
        "is_holiday": int(bool(holiday_names)),
        "holiday_count": len(holiday_names),
        "is_christian_holiday": int(target_date in christian_holidays),
        "is_muslim_holiday": int(target_date in muslim_holidays),
        "event_name": event_calendar.get(target_date),
        "event_nearby": int(target_date in event_window),
    }


def generate_dataset(
    start_date: str,
    end_date: str,
    output_path: Path,
    seed: int = 42,
    samples_per_room: int = 2,
) -> pd.DataFrame:
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    if end < start:
        raise ValueError("end_date must be on or after start_date")

    rng = np.random.default_rng(seed)
    calendar_maps = build_calendar_maps(start.year, end.year)

    rows: list[dict[str, object]] = []
    for timestamp in pd.date_range(start=start, end=end, freq="D"):
        current_date = timestamp.date()
        weekday = current_date.weekday()
        is_weekend = int(weekday >= 5)
        week_of_year = int(current_date.isocalendar().week)
        month_factor = MONTH_DEMAND_FACTORS[current_date.month]

        calendar_ctx = get_calendar_context(current_date, calendar_maps)
        holiday_names = calendar_ctx["holiday_names"]

        min_base_price = min(ROOM_BASE_PRICES.values())
        max_base_price = max(ROOM_BASE_PRICES.values())

        for room_type_code, room_type in ROOM_TYPES.items():
            base_price = ROOM_BASE_PRICES[room_type]

            for _ in range(samples_per_room):
                days_until_booking = int(rng.integers(1, 121))
                competitor_index = float(np.clip(rng.normal(1.0, 0.07), 0.8, 1.25))

                lead_time_factor = float(np.interp(days_until_booking, [1, 120], [0.09, -0.06]))
                room_factor = float(np.interp(base_price, [min_base_price, max_base_price], [-0.02, 0.18]))
                holiday_factor = (
                    0.16 * calendar_ctx["is_holiday"]
                    + 0.05 * calendar_ctx["is_christian_holiday"]
                    + 0.06 * calendar_ctx["is_muslim_holiday"]
                    + 0.03 * max(calendar_ctx["holiday_count"] - 1, 0)
                )
                event_factor = 0.11 * calendar_ctx["event_nearby"]

                noise = float(rng.normal(0, 0.02))
                price_multiplier = (
                    1.0
                    + month_factor
                    + 0.07 * is_weekend
                    + holiday_factor
                    + event_factor
                    + lead_time_factor
                    + room_factor
                    + 0.18 * (competitor_index - 1.0)
                    + noise
                )

                recommended_price = float(np.clip(base_price * price_multiplier, base_price * 0.7, base_price * 2.4))

                occupancy_signal = (
                    0.53
                    + 0.85 * month_factor
                    + 0.08 * is_weekend
                    + 0.17 * calendar_ctx["is_holiday"]
                    + 0.06 * calendar_ctx["is_christian_holiday"]
                    + 0.07 * calendar_ctx["is_muslim_holiday"]
                    + 0.08 * calendar_ctx["event_nearby"]
                    - 0.00007 * max(recommended_price - base_price, 0)
                    + 0.00003 * max(base_price - recommended_price, 0)
                    + float(rng.normal(0, 0.03))
                )
                occupancy_rate = float(np.clip(occupancy_signal, 0.18, 0.98))

                rows.append(
                    {
                        "date": current_date.isoformat(),
                        "day_of_week": weekday,
                        "day_of_month": current_date.day,
                        "week_of_year": week_of_year,
                        "month": current_date.month,
                        "quarter": (current_date.month - 1) // 3 + 1,
                        "is_weekend": is_weekend,
                        "is_holiday": calendar_ctx["is_holiday"],
                        "is_christian_holiday": calendar_ctx["is_christian_holiday"],
                        "is_muslim_holiday": calendar_ctx["is_muslim_holiday"],
                        "holiday_count": calendar_ctx["holiday_count"],
                        "event_nearby": calendar_ctx["event_nearby"],
                        "days_until_booking": days_until_booking,
                        "room_type": room_type,
                        "room_type_code": room_type_code,
                        "base_room_price": round(base_price, 2),
                        "competitor_price_index": round(competitor_index, 4),
                        "holiday_names": ", ".join(holiday_names) if holiday_names else "None",
                        "event_name": calendar_ctx["event_name"] or "None",
                        "recommended_price": round(recommended_price, 2),
                        "occupancy_rate": round(occupancy_rate, 4),
                        "expected_revenue": round(recommended_price * occupancy_rate, 2),
                    }
                )

    dataframe = pd.DataFrame(rows)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    dataframe.to_csv(output_path, index=False)
    return dataframe


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate realistic synthetic resort pricing dataset with Ethiopian-aware calendars."
    )
    parser.add_argument("--start-date", default="2024-01-01", help="Start date in YYYY-MM-DD format")
    parser.add_argument("--end-date", default="2028-12-31", help="End date in YYYY-MM-DD format")
    parser.add_argument("--output", default="data/data.csv", help="Output CSV path")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--samples-per-room", type=int, default=2, help="Rows per room type per date")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    df = generate_dataset(
        start_date=args.start_date,
        end_date=args.end_date,
        output_path=Path(args.output),
        seed=args.seed,
        samples_per_room=args.samples_per_room,
    )

    print(
        "Generated dataset with "
        f"{len(df):,} rows from {df['date'].min()} to {df['date'].max()} "
        f"at {args.output}"
    )


if __name__ == "__main__":
    main()