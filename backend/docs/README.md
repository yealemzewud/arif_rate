# Frontend Usage Guide

This guide explains how a web or mobile frontend should integrate with the PricePilot API.

## Backend Base URL

Local default:

```text
http://localhost:8000
```

Start the backend first:

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

## Integration Flow

Use this order for best UX:

1. Call `GET /v1/date-window` to configure date-picker limits.
2. Call `GET /v1/room-types` to populate room type options.
3. Submit user inputs to `POST /v1/advice` for pricing guidance.
4. Optionally call `GET /v1/live-rates` to display raw market context.

## Main Request: POST /v1/advice

Room rates returned by the API are nightly rates. The response also includes `stay_nights` and per-stay totals so the frontend can show the full booking cost.
`days_until_booking` is calculated automatically from the check-in date and the current date.
All prices include VAT and bed & breakfast.

### Example payload

```json
{
  "chk_in": "2026-04-10",
  "chk_out": "2026-04-13",
  "room_type": "Deluxe Suite King",
  "use_live_feed": true,
  "hotel_key": null,
  "currency": "USD",
  "no_of_adults": 2,
  "childrens": [
    { "age_of_children": 4 },
    { "age_of_children": 7 }
  ],
  "live_blend_weight": 0.35
}
```

### JavaScript fetch example

```javascript
const response = await fetch("http://localhost:8000/v1/advice", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    chk_in: "2026-04-10",
    chk_out: "2026-04-13",
    room_type: "Deluxe Suite King",
    no_of_adults: 2,
    childrens: [{ age_of_children: 4 }, { age_of_children: 7 }],
    use_live_feed: true,
    currency: "USD"
  })
});

if (!response.ok) {
  const errorBody = await response.json();
  throw new Error(errorBody.detail || "Request failed");
}

const data = await response.json();
console.log(data);
```

## Response Fields to Render

Top-level fields commonly used in UI:

- `input`: normalized request values.
- `live_feed_used`: whether live market anchor was applied.
- `warnings`: optional warnings (for example unsupported currency or unavailable live window).
- `final_pricing`: single aggregated pricing output for the stay.
- `live_market_context`: optional market snapshot details when live feed succeeds.

`final_pricing` includes:

- `advised_nightly_price`
- `total_stay_price`
- `avg_expected_occupancy_pct`
- `expected_stay_revenue_per_available_room`
- `nightly_price_min`
- `nightly_price_max`
- `reason` (deduplicated list of explainability messages)

Occupancy fields:

- `no_of_adults`: required for occupancy context (default `2` in GET flow).
- `childrens`: list of objects, each with `age_of_children` between `0` and `10`.

## UI Mapping Suggestions

- Date picker limits: use `GET /v1/date-window` bounds.
- Room selector: use values from `GET /v1/room-types`.
- Results view: show one summary card from `final_pricing`.
- Explainability: render `reason` as bullet points below each date.
- Warning banner: show `warnings` at top of results when present.

## Error Handling

- `400`: validation or date-window errors. Show user-friendly input guidance.
- `502`: external live provider failure. You can retry or continue with `use_live_feed=false`.

## Notes for Frontend Teams

- CORS is enabled for all origins in the current backend configuration.
- Date format must be `YYYY-MM-DD`.
- `chk_out` must be after `chk_in`.
- For predictable behavior in production, store API base URL in frontend environment config.