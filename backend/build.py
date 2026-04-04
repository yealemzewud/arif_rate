 from pathlib import Path
from main import ensure_dataset_ready, train_models, DATA_FILE

if __name__ == "__main__":
    print("Pre-building models for production deployment...")
    
    # Optional: If you always want fresh data at build time, uncomment below
    # if DATA_FILE.exists():
    #     DATA_FILE.unlink()

    df = ensure_dataset_ready()
    
    # Force retrain to guarantee fresh models during build
    train_models(df, force_retrain=True)
    
    print("Build complete! Models and dataset serialized successfully.")
