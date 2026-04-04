# PricePilot

PricePilot is a Python-based room pricing advisory service for hotel and resort use cases. It combines synthetic demand data, machine learning predictions, and optional live market rates to produce date-level pricing and occupancy guidance.

Room prices in this backend are treated as nightly rates. The API also calculates stay totals using the number of nights between `chk_in` and `chk_out`.
Lead time is calculated automatically from the check-in date, so users do not need to provide `days_until_booking`.

## Features

- Calendar-aware pricing signals, including Ethiopian public holidays, Christian holidays, and Muslim holidays.
- Room-type-aware price and occupancy predictions.
- Optional live market anchoring through RapidAPI hotel rates.
- FastAPI endpoints for frontend and system integration.
- CLI mode for quick local experimentation.

## Project Structure

- `api.py`: FastAPI service with advice, health, and admin endpoints.
- `main.py`: Local CLI prediction flow.
- `generate_dataset.py`: Synthetic dataset generation with calendar and event features.
- `live_price_feed.py`: External market snapshot integration.
- `data/data.csv`: Generated or refreshed training dataset.

## Requirements

- Python 3.11+
- `pip` or `uv` for dependency installation
- RapidAPI key (only required when live market feed is enabled)

## Setup

### Option A: pip + virtual environment

```bash
python -m venv .venv
source .venv/Scripts/activate
pip install -e .
```

### Option B: uv

```bash
uv sync
```

## Environment Variables

Create a `.env` file in the project root when using live market feed features.

Required for live feed:

```env
RAPIDAPI_KEY=your_rapidapi_key
```

Optional settings:

```env
RAPIDAPI_URL=https://xotelo-hotel-prices.p.rapidapi.com/api/rates
RAPIDAPI_HOST=xotelo-hotel-prices.p.rapidapi.com
PRICE_FEED_DEFAULT_HOTEL_KEY=g297930-d305178
PRICE_FEED_DEFAULT_CURRENCY=EUR
PRICE_FEED_DEFAULT_NO_OF_ADULTS=2
PRICE_FEED_DEFAULT_AGE_OF_CHILDREN=0,1,3
PRICE_FEED_TIMEOUT_SECONDS=12
PRICE_FEED_BLEND_WEIGHT=0.35
PRICE_FEED_MAX_PAST_DAYS=0
PRICE_FEED_MAX_FUTURE_DAYS=31
```

## Run the Project

### Run API server

```bash
uvicorn api:app --reload --host 0.0.0.0 --port 8000
```

Then open:

- Swagger docs: `http://localhost:8000/docs`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

### Run CLI flow

```bash
python main.py
```

### Regenerate dataset manually

```bash
python generate_dataset.py --start-date 2024-01-01 --end-date 2028-12-31 --output data/data.csv
```

## API Summary

- `GET /health`: model and dataset health status.
- `GET /v1/room-types`: supported room types and base prices.
- `GET /v1/advice`: advice through query parameters.
- `POST /v1/advice`: advice through JSON payload.
- `GET /v1/live-rates`: raw live market rate snapshot.
- `GET /v1/date-window`: valid check-in and check-out date windows.
- `POST /v1/admin/reload-model`: retrain from cached dataset.
- `POST /v1/admin/regenerate-dataset`: regenerate dataset and retrain.

## Frontend Integration

Frontend-specific integration guidance is documented in `docs/README.md`.
