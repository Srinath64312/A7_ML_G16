"""
================================================================================
STEP 01: DATA ACQUISITION & DATASET LOADING
================================================================================
Goal: 
  - Download the official ASSISTments Skill Builder benchmark dataset.
  - If offline or unreachable, generate a standardized synthetic benchmark dataset.
  - Save raw dataset to `data/` directory for subsequent pipeline steps.
================================================================================
"""

import os
import urllib.request
import pandas as pd
import numpy as np

# Configuration paths
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

DATA_URL = "https://raw.githubusercontent.com/GaoSida/DKT/master/Assistments/skill_builder_data_corrected.csv"

TOPICS_MATH = [
    "Linear Equations Graphs",
    "Properties of Exponents",
    "Addition and Subtraction Fractions",
    "Area of Circles",
    "Probability of Independent Events",
    "Multiplication and Division Integers",
    "Venn Diagram",
    "Equation Solving Two Steps"
]

def acquire_data():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    if os.path.exists(RAW_DATA_PATH):
        print(f"[OK] Raw dataset already exists at: {RAW_DATA_PATH}")
        df = pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')
        print(f"Loaded {len(df):,} student interaction records.")
        return df

    print(f"[INFO] Attempting download from official repository:\n   {DATA_URL}")
    try:
        req = urllib.request.Request(
            DATA_URL, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=15) as response, open(RAW_DATA_PATH, 'wb') as out_file:
            data = response.read()
            out_file.write(data)
        print(f"[OK] Download complete! Saved to {RAW_DATA_PATH}")
        df = pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')
        print(f"Dataset shape: {df.shape}")
        return df
    except Exception as e:
        print(f"[WARNING] Remote download failed ({e}). Generating high-fidelity synthetic benchmark dataset...")
        df = generate_synthetic_dataset(num_students=350, trials_per_student=30)
        df.to_csv(RAW_DATA_PATH, index=False)
        print(f"[OK] Synthetic benchmark dataset generated and saved to {RAW_DATA_PATH}")
        return df

def generate_synthetic_dataset(num_students=350, trials_per_student=30):
    """Generates synthetic student interaction dataset calibrated with IRT parameters."""
    rows = []
    order_id = 1
    
    for user_id in range(1, num_students + 1):
        # Latent student ability theta ~ Normal(0, 1)
        student_ability = np.random.normal(0, 1.0)
        
        for _ in range(trials_per_student):
            skill = np.random.choice(TOPICS_MATH)
            problem_id = np.random.randint(100, 999)
            # Item difficulty b_i ~ Normal(0, 1)
            item_difficulty = np.random.normal(0, 1.0)
            
            # 1-PL IRT probability: P(correct) = 1 / (1 + exp(-(theta - b)))
            prob = 1.0 / (1.0 + np.exp(-(student_ability - item_difficulty)))
            
            # Incorporate slip and guess
            p_guess = 0.18
            p_slip = 0.10
            p_correct = p_guess * (1.0 - prob) + (1.0 - p_slip) * prob
            correct = int(np.random.rand() < p_correct)
            
            # Response time (in seconds)
            response_time = max(5, int(np.random.exponential(scale=20) + (1 - prob) * 10))
            hint_count = int(np.random.poisson(lam=0.4 if correct else 1.2))
            
            rows.append({
                "order_id": order_id,
                "user_id": user_id,
                "problem_id": problem_id,
                "skill_name": skill,
                "correct": correct,
                "ms_first_response": response_time * 1000,
                "hint_count": hint_count,
                "attempt_count": 1 if correct else np.random.randint(2, 4)
            })
            order_id += 1
            # Learning gain over time
            student_ability += 0.03
            
    df = pd.DataFrame(rows)
    return df

if __name__ == "__main__":
    print("=" * 60)
    print("STEP 01: DATA ACQUISITION & LOADING")
    print("=" * 60)
    df = acquire_data()
    print("\nDataset Sample Preview:")
    print(df.head())