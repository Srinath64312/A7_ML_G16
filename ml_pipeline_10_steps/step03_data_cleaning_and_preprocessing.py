"""
================================================================================
STEP 03: DATA CLEANING & PREPROCESSING
================================================================================
Goal:
  - Clean missing and malformed records.
  - Standardize response values into binary correctness {0, 1}.
  - Filter out sparse skills and anomalies.
  - Sort interactions chronologically per student.
  - Save preprocessed dataset to `data/assistments_processed.csv`.
================================================================================
"""

import os
import pandas as pd
import numpy as np

import os
import sys

# Robust path detection for both standalone scripts and Jupyter Notebook
try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    cur = os.path.abspath(".")
    BASE_DIR = cur if os.path.exists(os.path.join(cur, "data")) else os.path.dirname(cur)

PIPELINE_DIR = os.path.join(BASE_DIR, "ml_pipeline_10_steps")
for p in [BASE_DIR, PIPELINE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

DATA_DIR = os.path.join(BASE_DIR, "data")
RAW_DATA_PATH = os.path.join(DATA_DIR, "skill_builder_data_corrected.csv")
PROCESSED_DATA_PATH = os.path.join(DATA_DIR, "assistments_processed.csv")

def clean_and_preprocess():
    print("=" * 65)
    print("STEP 03: DATA CLEANING & PREPROCESSING")
    print("=" * 65)
    
    if not os.path.exists(RAW_DATA_PATH):
        print("Dataset not found! Running Step 01...")
        from step01_data_acquisition import acquire_data
        df_raw = acquire_data()
    else:
        df_raw = pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')

    initial_len = len(df_raw)
    print(f"[INFO] Loaded Raw Records: {initial_len:,}")

    # 1. Standardize Required Column Names
    col_mapping = {
        "user_id": "user_id",
        "order_id": "order_id",
        "skill_name": "skill_name",
        "correct": "correct",
        "ms_first_response": "ms_first_response",
        "hint_count": "hint_count",
        "attempt_count": "attempt_count"
    }
    
    available_cols = [c for c in col_mapping if c in df_raw.columns]
    df = df_raw[available_cols].copy()

    # 2. Filter Missing Target and Skill Values
    df = df.dropna(subset=["skill_name", "correct"])
    print(f"[INFO] Removed {initial_len - len(df):,} rows with null skills or target labels.")

    # 3. Ensure Binary Correctness & Clean Outliers
    df["correct"] = df["correct"].astype(float).round().astype(int)
    df = df[df["correct"].isin([0, 1])]

    # Response time cleaning: clip between 2s and 300s
    if "ms_first_response" in df.columns:
        df["response_time_sec"] = (df["ms_first_response"] / 1000.0).clip(lower=2.0, upper=300.0)
    else:
        df["response_time_sec"] = 20.0

    if "hint_count" in df.columns:
        df["hint_count"] = df["hint_count"].fillna(0).astype(int).clip(0, 10)
    else:
        df["hint_count"] = 0

    # 4. Filter Sparse Skills (< 20 interactions)
    skill_counts = df["skill_name"].value_counts()
    frequent_skills = skill_counts[skill_counts >= 20].index
    df = df[df["skill_name"].isin(frequent_skills)]
    print(f"[INFO] Retained {len(frequent_skills)} active skills with adequate interaction density.")

    # 5. Chronological Sorting by User and Sequence
    sort_cols = ["user_id"]
    if "order_id" in df.columns:
        sort_cols.append("order_id")
    df = df.sort_values(by=sort_cols).reset_index(drop=True)

    # 6. Save Processed Dataset
    os.makedirs(DATA_DIR, exist_ok=True)
    df.to_csv(PROCESSED_DATA_PATH, index=False)
    print(f"\n[OK] Preprocessed data saved successfully to:\n   {PROCESSED_DATA_PATH}")
    print(f"   Final Shape: {df.shape[0]:,} rows, {df.shape[1]} columns")
    
    return df

if __name__ == "__main__":
    clean_and_preprocess()