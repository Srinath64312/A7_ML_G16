"""
================================================================================
STEP 02: DATA UNDERSTANDING & EXPLORATORY DATA ANALYSIS (EDA)
================================================================================
Goal:
  - Inspect raw dataset structure, schemas, and missing value distributions.
  - Calculate psychometric key performance indicators (KPIs).
  - Analyze skill-wise success rates, student learning trajectories, and response times.
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

def perform_eda():
    if not os.path.exists(RAW_DATA_PATH):
        print("[ERROR] Dataset not found! Running Step 01 first...")
        from step01_data_acquisition import acquire_data
        df = acquire_data()
    else:
        df = pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')
        
    print("=" * 65)
    print("STEP 02: EXPLORATORY DATA ANALYSIS (EDA) & UNDERSTANDING")
    print("=" * 65)
    
    # 1. Dataset Dimensions & Basic Info
    print(f"\n[1] DATASET OVERVIEW:")
    print(f"   * Total Interaction Records: {len(df):,}")
    print(f"   * Total Columns: {len(df.columns)}")
    print(f"   * Memory Usage: {df.memory_usage().sum() / (1024*1024):.2f} MB")
    
    # 2. Key Educational Entities
    user_col = "user_id" if "user_id" in df.columns else df.columns[1]
    skill_col = "skill_name" if "skill_name" in df.columns else "skill_id"
    correct_col = "correct" if "correct" in df.columns else "correctness"
    
    unique_users = df[user_col].nunique()
    unique_skills = df[skill_col].dropna().nunique() if skill_col in df.columns else 0
    overall_acc = df[correct_col].mean() if correct_col in df.columns else 0.0
    
    print(f"\n[2] EDUCATIONAL COHORT METRICS:")
    print(f"   * Unique Students: {unique_users:,}")
    print(f"   * Unique Knowledge Components (Skills): {unique_skills}")
    print(f"   * Overall Population Correctness Rate: {overall_acc * 100:.2f}%")
    print(f"   * Average Interactions per Student: {len(df) / max(1, unique_users):.1f} questions")

    # 3. Missing Value Analysis
    print(f"\n[3] MISSING VALUE PROFILE:")
    missing = df.isnull().sum()
    missing_pct = (missing / len(df)) * 100
    missing_summary = pd.DataFrame({"Missing Rows": missing, "Percentage (%)": missing_pct.round(2)})
    print(missing_summary[missing_summary["Missing Rows"] > 0].head(10))

    # 4. Top Skills by Student Activity & Success Rate
    if skill_col in df.columns and correct_col in df.columns:
        print(f"\n[4] TOP SKILLS & ACCURACY BREAKDOWN:")
        skill_stats = df.groupby(skill_col).agg(
            total_attempts=(correct_col, "count"),
            correctness_rate=(correct_col, "mean")
        ).sort_values(by="total_attempts", ascending=False)
        
        skill_stats["correctness_rate"] = (skill_stats["correctness_rate"] * 100).round(2).astype(str) + "%"
        print(skill_stats.head(8))

    # 5. Response Time & Hint Correlation
    if "ms_first_response" in df.columns and "hint_count" in df.columns:
        print(f"\n[5] BEHAVIORAL PATTERNS:")
        avg_resp_sec = (df["ms_first_response"] / 1000.0).clip(0, 180).mean()
        avg_hints = df["hint_count"].mean()
        print(f"   * Mean First Response Time: {avg_resp_sec:.1f} seconds")
        print(f"   * Mean Hints Requested: {avg_hints:.2f} per problem")
        
    # 6. Generate & Save Visual EDA Plots
    try:
        import matplotlib.pyplot as plt
        plots_dir = os.path.join(DATA_DIR, "output_plots")
        os.makedirs(plots_dir, exist_ok=True)
        
        fig, axes = plt.subplots(1, 3, figsize=(16, 5))
        
        # Subplot 1: Skill Correctness Rates
        top_skills = df.groupby(skill_col)[correct_col].mean().sort_values().tail(8)
        axes[0].barh(top_skills.index, top_skills.values * 100, color="#4f46e5", alpha=0.85)
        axes[0].set_title("Correctness Rate by Skill Topic (%)", fontsize=12, fontweight="bold")
        axes[0].set_xlabel("Accuracy (%)")
        axes[0].grid(axis="x", linestyle="--", alpha=0.5)

        # Subplot 2: Interaction Volume Distribution
        skill_counts = df[skill_col].value_counts().head(8)
        axes[1].bar(range(len(skill_counts)), skill_counts.values, color="#06b6d4", alpha=0.85)
        axes[1].set_xticks(range(len(skill_counts)))
        axes[1].set_xticklabels([f"S{i+1}" for i in range(len(skill_counts))], rotation=0)
        axes[1].set_title("Student Interaction Density per Skill", fontsize=12, fontweight="bold")
        axes[1].set_ylabel("Interaction Count")
        axes[1].grid(axis="y", linestyle="--", alpha=0.5)

        # Subplot 3: Target Class Balance
        class_counts = df[correct_col].value_counts()
        labels = ["Incorrect (0)", "Correct (1)"]
        axes[2].pie(class_counts, labels=labels, autopct="%1.1f%%", colors=["#f43f5e", "#10b981"], startangle=140, explode=(0.04, 0))
        axes[2].set_title("Overall Response Correctness Ratio", fontsize=12, fontweight="bold")

        plt.tight_layout()
        plot_path = os.path.join(plots_dir, "step02_eda_distributions.png")
        plt.savefig(plot_path, dpi=150)
        print(f"\n[OK] EDA Visual Charts saved to:\n   {plot_path}")
        plt.close()
    except Exception as e:
        print(f"[NOTE] Plot generation skipped: {e}")

    print("\n[OK] Exploratory Data Analysis complete.")
    return df

if __name__ == "__main__":
    perform_eda()