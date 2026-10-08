"""
================================================================================
STEP 09: MODEL EVALUATION & MULTI-POLICY BENCHMARKING
================================================================================
Goal:
  - Benchmark the trained RL Agent against 3 pedagogical baselines:
      1. Reinforcement Learning (Q-Learning Policy)
      2. Rule-Based Heuristic Policy
      3. Fixed-Difficulty Policy (Medium Level 3)
      4. Random Selection Baseline
  - Evaluate across 250 simulated student episodes.
  - Compute Net Skill Gain, Average Episode Reward, and ZPD alignment.
================================================================================
"""

import os
import sys
import numpy as np
import pandas as pd

try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    cur = os.path.abspath(".")
    BASE_DIR = cur if os.path.exists(os.path.join(cur, "data")) else os.path.dirname(cur)

PIPELINE_DIR = os.path.join(BASE_DIR, "ml_pipeline_10_steps")
for p in [BASE_DIR, PIPELINE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

class RuleBasedAgent:
    """Baseline: Pedagogical heuristic matching mastery bracket to difficulty."""
    def select_action(self, mastery_prob: float) -> int:
        if mastery_prob < 0.40:
            return np.random.choice([0, 1])  # Difficulty 1 or 2
        elif mastery_prob <= 0.70:
            return 2                         # Difficulty 3
        else:
            return np.random.choice([3, 4])  # Difficulty 4 or 5

class FixedDifficultyAgent:
    """Baseline: Static medium difficulty (Level 3)."""
    def select_action(self) -> int:
        return 2

class RandomAgent:
    """Baseline: Uniformly random difficulty."""
    def select_action(self) -> int:
        return np.random.randint(0, 5)

def run_benchmarking():
    print("=" * 65)
    print("STEP 09: POLICY EVALUATION & BENCHMARK COMPARISON")
    print("=" * 65)

    from step07_student_environment_simulation import StudentSimulator
    from step08_rl_agent_training import train_rl_agents

    # Train RL agent
    rl_agent = train_rl_agents()

    # Define Policy Map
    policies = {
        "RL Policy (Q-Learning)": lambda s: rl_agent.select_action(s, evaluation=True),
        "Rule-Based Heuristic": lambda s: RuleBasedAgent().select_action(s),
        "Fixed Difficulty (Lvl 3)": lambda s: FixedDifficultyAgent().select_action(),
        "Random Policy Baseline": lambda s: RandomAgent().select_action()
    }

    num_eval_episodes = 250
    steps_per_episode = 20
    results = {name: {"rewards": [], "skill_gains": [], "final_skills": [], "zpd_hits": []} for name in policies}

    print(f"\nSimulating {num_eval_episodes} student episodes for each of the 4 policies...")
    
    for name, policy_fn in policies.items():
        for _ in range(num_eval_episodes):
            student = StudentSimulator()
            initial_skill = student.skill
            bkt_state = 0.25
            
            ep_reward = 0.0
            zpd_count = 0
            
            for _ in range(steps_per_episode):
                action = policy_fn(bkt_state)
                diff_level = action + 1
                
                # Check ZPD
                norm_diff = (diff_level - 1) / 4.0
                if abs(student.skill - norm_diff) < 0.25:
                    zpd_count += 1
                    
                correct, gain, eng, reward = student.step(diff_level)
                ep_reward += reward
                
                # Difficulty-conditioned BKT belief update
                d = diff_level
                p_slip = float(np.clip(0.10 * (1.0 + 0.15 * (d - 1)), 0.04, 0.28))
                p_guess = float(np.clip(0.20 * np.exp(-0.20 * (d - 1)), 0.05, 0.25))
                p_transit = 0.15
                
                if correct == 1:
                    num = bkt_state * (1.0 - p_slip)
                    den = num + (1.0 - bkt_state) * p_guess
                else:
                    num = bkt_state * p_slip
                    den = num + (1.0 - bkt_state) * (1.0 - p_guess)
                posterior = num / max(1e-6, den)
                bkt_state = float(np.clip(posterior + (1.0 - posterior) * p_transit, 0.01, 0.99))

            results[name]["rewards"].append(ep_reward)
            results[name]["skill_gains"].append(student.skill - initial_skill)
            results[name]["final_skills"].append(student.skill)
            results[name]["zpd_hits"].append(zpd_count / steps_per_episode)

    # Build Comparison Summary Table
    summary = []
    for name in policies:
        summary.append({
            "Policy Algorithm": name,
            "Mean Reward": round(float(np.mean(results[name]["rewards"])), 3),
            "Avg Skill Gain": round(float(np.mean(results[name]["skill_gains"])), 4),
            "Avg Final Mastery": round(float(np.mean(results[name]["final_skills"])), 3),
            "ZPD Alignment (%)": f"{np.mean(results[name]['zpd_hits']) * 100:.1f}%"
        })

    summary_df = pd.DataFrame(summary)
    print("\n" + "=" * 70)
    print("[RESULTS] FINAL BENCHMARK PERFORMANCE COMPARISON TABLE")
    print("=" * 70)
    print(summary_df.to_string(index=False))
    print("=" * 70)

    # Calculate RL improvement
    rl_gain = np.mean(results["RL Policy (Q-Learning)"]["skill_gains"])
    rand_gain = np.mean(results["Random Policy Baseline"]["skill_gains"])
    improvement = ((rl_gain - rand_gain) / max(1e-5, rand_gain)) * 100
    print(f"\n[INSIGHT] RL Policy delivers a +{improvement:.1f}% increase in learning gain over random baseline!")

    # Plot Multi-Policy Benchmark Comparison Graphs
    try:
        import matplotlib.pyplot as plt
        plots_dir = os.path.join(BASE_DIR, "data", "output_plots")
        os.makedirs(plots_dir, exist_ok=True)

        fig, axes = plt.subplots(1, 3, figsize=(18, 5))

        # Plot 1: Skill Gain Boxplot
        labels = [k.replace(" Policy", "").replace(" Baseline", "") for k in policies.keys()]
        gains_data = [results[k]["skill_gains"] for k in policies]
        axes[0].boxplot(gains_data, tick_labels=labels, patch_artist=True,
                        boxprops=dict(facecolor='#818cf8', color='#4f46e5'),
                        medianprops=dict(color='#312e81', lw=2))
        axes[0].set_title('Student Skill Gain Distribution (20 Steps)', fontsize=12, fontweight='bold')
        axes[0].set_ylabel('Net Latent Skill Gain (Δθ)')
        axes[0].grid(axis='y', linestyle='--', alpha=0.5)

        # Plot 2: Average Cumulative Episode Rewards
        avg_rewards = [np.mean(results[k]["rewards"]) for k in policies]
        colors = ['#10b981', '#6366f1', '#f59e0b', '#f43f5e']
        axes[1].bar(labels, avg_rewards, color=colors, alpha=0.85)
        axes[1].set_title('Mean Episode Reward by Policy', fontsize=12, fontweight='bold')
        axes[1].set_ylabel('Cumulative Reward')
        axes[1].grid(axis='y', linestyle='--', alpha=0.5)

        # Plot 3: Zone of Proximal Development (ZPD) Alignment Rate
        zpd_rates = [np.mean(results[k]["zpd_hits"]) * 100 for k in policies]
        axes[2].bar(labels, zpd_rates, color='#06b6d4', alpha=0.85)
        axes[2].set_title('Zone of Proximal Development (ZPD) Hit Rate (%)', fontsize=12, fontweight='bold')
        axes[2].set_ylabel('ZPD Percentage (%)')
        axes[2].set_ylim(0, 100)
        axes[2].grid(axis='y', linestyle='--', alpha=0.5)

        plt.tight_layout()
        plot_path = os.path.join(plots_dir, "step09_policy_benchmarks.png")
        plt.savefig(plot_path, dpi=150)
        print(f"\n[OK] Benchmark Comparison Plots saved to:\n   {plot_path}")
        plt.close()
    except Exception as e:
        print(f"[NOTE] Plot generation skipped: {e}")

    return summary_df

if __name__ == "__main__":
    run_benchmarking()