"""
================================================================================
STEP 04: FEATURE ENGINEERING & MULTIDIMENSIONAL 2-PL/3-PL IRT CALIBRATION
================================================================================
Goal:
  - Engineer student state features (cumulative history, rolling accuracy).
  - Fit 2-PL / 3-PL Item Response Theory model:
      P(correct | theta, alpha, beta, c) = c + (1 - c) / (1 + exp(-alpha * (theta - beta)))
  - Estimate skill discrimination (alpha) and difficulty (beta).
  - Discretize skill difficulties into 5 standardized pedagogical tiers (1 to 5).
================================================================================
"""

import os
import sys
import pandas as pd
import numpy as np

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
PROCESSED_DATA_PATH = os.path.join(DATA_DIR, "assistments_processed.csv")
FEAT_DATA_PATH = os.path.join(DATA_DIR, "assistments_features.csv")

def feature_engineering_and_irt():
    print("=" * 65)
    print("STEP 04: FEATURE ENGINEERING & 2-PL/3-PL IRT CALIBRATION")
    print("=" * 65)
    
    if not os.path.exists(PROCESSED_DATA_PATH):
        print("Processed data not found! Running Step 03 first...")
        from step03_data_cleaning_and_preprocessing import clean_and_preprocess
        df = clean_and_preprocess()
    else:
        df = pd.read_csv(PROCESSED_DATA_PATH)

    print(f"Loaded {len(df):,} clean interaction rows.")

    # 1. Engineer Student Sequential Features
    print("\n[1] Computing Student Sequential Historical Features...")
    df["cumulative_attempts"] = df.groupby(["user_id", "skill_name"]).cumcount() + 1
    df["cum_correct"] = df.groupby(["user_id", "skill_name"])["correct"].cumsum() - df["correct"]
    df["prior_accuracy"] = (df["cum_correct"] / np.maximum(1, df["cumulative_attempts"] - 1)).round(3)
    df.loc[df["cumulative_attempts"] == 1, "prior_accuracy"] = 0.50

    # 2. Fit 2-PL / 3-PL IRT per Skill
    print("\n[2] Estimating 2-PL / 3-PL IRT Discrimination (alpha) & Difficulty (beta) Parameters...")

    skills = df["skill_name"].dropna().unique().tolist()
    skill_map = {s: i for i, s in enumerate(skills)}
    user_ids = df["user_id"].unique()
    user_map = {u: i for i, u in enumerate(user_ids)}
    
    n_users = len(user_ids)
    n_skills = len(skills)
    
    theta = np.zeros(n_users)
    beta = np.zeros(n_skills)
    alpha = np.ones(n_skills)
    c_guess = 0.18
    
    u_idx = df["user_id"].map(user_map).values
    s_idx = df["skill_name"].map(skill_map).values
    y = df["correct"].values
    
    lr = 0.04
    epochs = 15
    for epoch in range(epochs):
        logits = alpha[s_idx] * (theta[u_idx] - beta[s_idx])
        logits = np.clip(logits, -15.0, 15.0)
        q = 1.0 / (1.0 + np.exp(-logits))
        p = c_guess + (1.0 - c_guess) * q
        
        p_safe = np.clip(p, 1e-6, 1.0 - 1e-6)
        error = ((p - y) / (p_safe * (1.0 - p_safe))) * (1.0 - c_guess) * q * (1.0 - q)
        error = np.clip(error, -2.5, 2.5)
        
        grad_theta = np.zeros(n_users)
        np.add.at(grad_theta, u_idx, error * alpha[s_idx])
        theta -= lr * (grad_theta + 0.015 * theta)
        
        grad_beta = np.zeros(n_skills)
        np.add.at(grad_beta, s_idx, -error * alpha[s_idx])
        beta -= lr * (grad_beta + 0.015 * beta)
        
        grad_alpha = np.zeros(n_skills)
        np.add.at(grad_alpha, s_idx, error * (theta[u_idx] - beta[s_idx]))
        alpha -= (lr * 0.5) * (grad_alpha + 0.01 * (alpha - 1.0))
        alpha = np.clip(alpha, 0.3, 2.5)
        
    skill_df_params = []
    b_min, b_max = np.min(beta), np.max(beta)
    for s, idx in skill_map.items():
        b_val = float(beta[idx])
        a_val = float(alpha[idx])
        tier = int(1 + np.round(4.0 * (b_val - b_min) / max(1e-4, b_max - b_min)))
        skill_df_params.append({
            "skill_name": s,
            "irt_difficulty_b": round(b_val, 4),
            "irt_discrimination_a": round(a_val, 4),
            "difficulty_tier": int(np.clip(tier, 1, 5))
        })
        
    skill_agg = pd.DataFrame(skill_df_params)
    print("\nCalibrated 2-PL/3-PL IRT Parameters Sample:")
    print(skill_agg.head(8))

    # 4. Merge IRT parameters back to dataset
    df = df.merge(skill_agg, on="skill_name", how="left")
    df.to_csv(FEAT_DATA_PATH, index=False)
    print(f"\n[OK] Feature-engineered dataset saved to:\n   {FEAT_DATA_PATH}")

    # 5. Plot 3-PL Item Characteristic Curves (ICC)
    try:
        import matplotlib.pyplot as plt
        plots_dir = os.path.join(DATA_DIR, "output_plots")
        os.makedirs(plots_dir, exist_ok=True)

        theta_range = np.linspace(-3.0, 3.0, 100)
        plt.figure(figsize=(10, 6))

        for idx, row in skill_agg.head(8).iterrows():
            b = row["irt_difficulty_b"]
            a = row["irt_discrimination_a"]
            q_theta = 1.0 / (1.0 + np.exp(-a * (theta_range - b)))
            p_theta = c_guess + (1.0 - c_guess) * q_theta
            plt.plot(theta_range, p_theta, lw=2, label=f"{row['skill_name'][:22]} (a={a:.2f}, b={b:.2f})")

        plt.axhline(0.5, color='gray', linestyle='--', alpha=0.6, label="50% Probability Reference")
        plt.title("3-PL Item Response Theory (IRT) - Item Characteristic Curves (ICC)", fontsize=13, fontweight="bold")
        plt.xlabel("Student Latent Ability (Theta)", fontsize=11)
        plt.ylabel("Probability of Correct Response P(Theta)", fontsize=11)
        plt.grid(True, linestyle="--", alpha=0.5)
        plt.legend(loc="lower right", fontsize=9)
        plt.tight_layout()


        plot_path = os.path.join(plots_dir, "step04_irt_item_characteristic_curves.png")
        plt.savefig(plot_path, dpi=150)
        print(f"[OK] 3-PL IRT Characteristic Curves saved to:\n   {plot_path}")
        plt.close()
    except Exception as e:
        print(f"[NOTE] Plot generation skipped: {e}")
    
    return df, skill_agg

if __name__ == "__main__":
    feature_engineering_and_irt()