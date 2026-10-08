"""
================================================================================
STEP 05: BAYESIAN KNOWLEDGE TRACING (BKT) MODEL
================================================================================
Goal:
  - Estimate skill-level empirical BKT parameters (P_init, P_transit, P_slip, P_guess).
  - Implement recursive Bayesian belief state update formulas.
  - Track posterior mastery probability P(L_t) sequentially for individual students.
  - Export statistical parameters to `data/assistments_stats.json`.
================================================================================
"""

import os
import json
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
FEAT_DATA_PATH = os.path.join(DATA_DIR, "assistments_features.csv")
STATS_PATH = os.path.join(DATA_DIR, "assistments_stats.json")

class BKTTracker:
    """Bayesian Knowledge Tracing Tracker for a student with dynamic difficulty conditioning."""
    def __init__(self, p_init=0.25, p_transit=0.15, p_slip=0.10, p_guess=0.20, p_forget=0.0):
        self.p_init = p_init
        self.p_transit = p_transit
        self.p_slip_base = p_slip
        self.p_guess_base = p_guess
        self.p_forget = p_forget
        self.p_l = p_init  # Current belief P(L_t)

    def update(self, correct: int, difficulty_tier: int = 3) -> float:
        """
        Applies Bayes' theorem to update mastery belief given student answer correctness (1 or 0)
        and question difficulty tier (1 to 5).
        """
        d = max(1, min(5, int(difficulty_tier)))
        p_slip = float(np.clip(self.p_slip_base * (1.0 + 0.15 * (d - 1)), 0.04, 0.28))
        p_guess = float(np.clip(self.p_guess_base * np.exp(-0.20 * (d - 1)), 0.05, 0.25))

        if correct == 1:
            # P(L | correct) = P(L) * (1 - P(slip)) / [P(L)*(1 - P(slip)) + (1 - P(L))*P(guess)]
            numerator = self.p_l * (1.0 - p_slip)
            denominator = numerator + (1.0 - self.p_l) * p_guess
        else:
            # P(L | incorrect) = P(L) * P(slip) / [P(L)*P(slip) + (1 - P(L))*(1 - P(guess))]
            numerator = self.p_l * p_slip
            denominator = numerator + (1.0 - self.p_l) * (1.0 - p_guess)

        posterior = numerator / max(1e-7, denominator)
        # Knowledge acquisition transition step: P(L_{t+1}) = Posterior + (1 - Posterior) * P(transit)
        p_next = posterior + (1.0 - posterior) * self.p_transit
        if self.p_forget > 0.0:
            p_next = (1.0 - self.p_forget) * p_next + self.p_forget * self.p_init
            
        self.p_l = float(np.clip(p_next, 0.01, 0.99))
        return self.p_l

def calibrate_empirical_bkt():
    print("=" * 65)
    print("STEP 05: BAYESIAN KNOWLEDGE TRACING (BKT) CALIBRATION")
    print("=" * 65)

    if not os.path.exists(FEAT_DATA_PATH):
        print("Feature dataset not found! Running Step 04 first...")
        from step04_feature_engineering_and_irt import feature_engineering_and_irt
        df, _ = feature_engineering_and_irt()
    else:
        df = pd.read_csv(FEAT_DATA_PATH)

    bkt_params = {}
    skills = df["skill_name"].dropna().unique().tolist()
    print(f"Calibrating BKT empirical parameters for {len(skills)} skills...")

    for skill in skills:
        skill_df = df[df["skill_name"] == skill]
        
        # 1. P_init: correctness rate on student's first attempt on this skill
        first_attempts = skill_df.groupby("user_id").first()
        p_init_raw = float(first_attempts["correct"].mean()) if len(first_attempts) > 0 else 0.30
        p_init = float(np.clip(p_init_raw * 0.7 + 0.05, 0.10, 0.55))

        # 2. P_transit: P(correct_{t+1} | incorrect_t)
        transitions = []
        for _, group in skill_df.groupby("user_id"):
            arr = group["correct"].values
            for t in range(len(arr) - 1):
                if arr[t] == 0:
                    transitions.append(arr[t + 1])
        p_transit = float(np.mean(transitions)) if transitions else 0.15
        p_transit = float(np.clip(p_transit, 0.05, 0.30))

        # 3. P_guess: estimated from difficult problems (Level 4/5)
        hard_df = skill_df[skill_df.get("difficulty_tier", 3) >= 4]
        p_guess = float(np.clip(hard_df["correct"].mean() * 0.55, 0.08, 0.25)) if len(hard_df) > 0 else 0.18

        # 4. P_slip: estimated from easy problems (Level 1/2)
        easy_df = skill_df[skill_df.get("difficulty_tier", 3) <= 2]
        p_slip = float(np.clip((1.0 - easy_df["correct"].mean()) * 0.5, 0.05, 0.18)) if len(easy_df) > 0 else 0.10

        bkt_params[skill] = {
            "p_init": round(p_init, 4),
            "p_transit": round(p_transit, 4),
            "p_slip": round(p_slip, 4),
            "p_guess": round(p_guess, 4),
            "avg_response_sec": round(float(skill_df["response_time_sec"].mean()), 1) if "response_time_sec" in skill_df.columns else 20.0,
            "avg_hints": round(float(skill_df["hint_count"].mean()), 2) if "hint_count" in skill_df.columns else 0.4
        }

    # Save to JSON
    stats_payload = {
        "dataset_name": "ASSISTments Skill Builder",
        "total_records": len(df),
        "num_skills": len(skills),
        "empirical_bkt_params": bkt_params
    }
    
    # Generate BKT Learning Progression Plot
    try:
        import matplotlib.pyplot as plt
        plots_dir = os.path.join(DATA_DIR, "output_plots")
        os.makedirs(plots_dir, exist_ok=True)

        # Simulate 2 synthetic student trajectories (Fast learner vs Struggling learner)
        t_fast = BKTTracker(p_init=0.25, p_transit=0.20, p_slip=0.08, p_guess=0.20)
        t_slow = BKTTracker(p_init=0.15, p_transit=0.08, p_slip=0.15, p_guess=0.25)
        
        # Fast learner answers: [1, 1, 1, 0, 1, 1, 1, 1, 1, 1]
        fast_seq = [1, 1, 1, 0, 1, 1, 1, 1, 1, 1]
        slow_seq = [0, 0, 1, 0, 1, 0, 1, 1, 1, 1]

        fast_curve = [0.25] + [t_fast.update(ans) for ans in fast_seq]
        slow_curve = [0.15] + [t_slow.update(ans) for ans in slow_seq]

        plt.figure(figsize=(9, 5))
        plt.plot(fast_curve, marker='o', lw=2.5, color='#10b981', label='Fast Learner Sequence (P_transit=0.20)')
        plt.plot(slow_curve, marker='s', lw=2.5, color='#f59e0b', label='Struggling Learner Sequence (P_transit=0.08)')
        plt.axhline(0.95, color='#6366f1', linestyle='--', alpha=0.7, label='Mastery Threshold (95%)')
        
        plt.title('Bayesian Knowledge Tracing (BKT) - Posterior Belief Update P(L_t)', fontsize=13, fontweight='bold')
        plt.xlabel('Question Sequence Step (t)', fontsize=11)
        plt.ylabel('Mastery Probability P(L_t)', fontsize=11)
        plt.ylim(0, 1.05)
        plt.grid(True, linestyle='--', alpha=0.5)
        plt.legend(loc='lower right', fontsize=9)
        plt.tight_layout()

        plot_path = os.path.join(plots_dir, "step05_bkt_mastery_trajectories.png")
        plt.savefig(plot_path, dpi=150)
        print(f"[OK] BKT Learning Trajectory plot saved to:\n   {plot_path}")
        plt.close()
    except Exception as e:
        print(f"[NOTE] Plot generation skipped: {e}")

    return bkt_params

if __name__ == "__main__":
    calibrate_empirical_bkt()