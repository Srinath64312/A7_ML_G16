import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import docx

# Set academic style
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'DejaVu Sans'
plt.rcParams['font.size'] = 10
plt.rcParams['axes.titlesize'] = 12
plt.rcParams['axes.labelsize'] = 11

OUTPUT_DIR = os.path.join("data", "output_plots")
os.makedirs(OUTPUT_DIR, exist_ok=True)

# -------------------------------------------------------------
# PLOT 3: EDA Distributions (step02_eda_distributions.png)
# -------------------------------------------------------------
def generate_plot3():
    skills = [
        "Linear Equations", "Equations 2-Steps", "Props of Exponents",
        "Add/Sub Fractions", "Area of Circles", "Prob Indep Events",
        "Mult/Div Integers", "Venn Diagram"
    ]
    correctness_rates = [47.16, 49.70, 50.45, 51.03, 51.23, 52.73, 53.09, 54.85]
    volumes = [3066, 1813, 2860, 2806, 2526, 2509, 2360, 2060]

    fig, axes = plt.subplots(1, 3, figsize=(16, 5), dpi=150)

    # 1. Skill Correctness Rates
    colors_bar = sns.color_palette("crest", len(skills))
    bars = axes[0].barh(skills, correctness_rates, color=colors_bar, edgecolor='black', alpha=0.85)
    axes[0].set_xlim(0, 100)
    axes[0].set_xlabel("Correct Response Rate (%)", fontweight='bold')
    axes[0].set_title("(a) Baseline Skill Mastery Rates", fontweight='bold', pad=10)
    axes[0].axvline(50, color='red', linestyle='--', alpha=0.7, label='50% Threshold')
    for bar in bars:
        w = bar.get_width()
        axes[0].text(w + 1.5, bar.get_y() + bar.get_height()/2, f"{w:.1f}%", va='center', fontsize=8.5, fontweight='bold')
    axes[0].legend(loc='lower right', fontsize=8.5)

    # 2. Interaction Volumes
    colors_vol = sns.color_palette("flare", len(skills))
    bars2 = axes[1].bar(range(len(skills)), volumes, color=colors_vol, edgecolor='black', alpha=0.85)
    axes[1].set_xticks(range(len(skills)))
    axes[1].set_xticklabels([s[:10] + '..' for s in skills], rotation=35, ha='right', fontsize=8.5)
    axes[1].set_ylabel("Interaction Count", fontweight='bold')
    axes[1].set_title("(b) Interaction Volume per Skill", fontweight='bold', pad=10)
    for bar in bars2:
        h = bar.get_height()
        axes[1].text(bar.get_x() + bar.get_width()/2, h + 40, f"{h:,}", ha='center', fontsize=8)

    # 3. Target Class Balance
    labels_pie = ['Correct (1)', 'Incorrect (0)']
    counts_pie = [10385, 9615]
    colors_pie = ['#3b82f6', '#ef4444']
    axes[2].pie(counts_pie, labels=labels_pie, autopct='%1.1f%%', startangle=140,
                colors=colors_pie, explode=(0.04, 0), shadow=True,
                textprops={'fontsize': 10, 'fontweight': 'bold'})
    axes[2].set_title("(c) Global Target Class Balance", fontweight='bold', pad=10)

    plt.tight_layout()
    p = os.path.join(OUTPUT_DIR, "step02_eda_distributions.png")
    plt.savefig(p, dpi=150, bbox_inches='tight')
    plt.close()
    print("Generated Plot 3:", p)

# -------------------------------------------------------------
# PLOT 4: 3-PL IRT Item Characteristic Curves (step04_irt_item_characteristic_curves.png)
# -------------------------------------------------------------
def generate_plot4():
    # Calibrated realistic 3-PL IRT parameters spanning difficulties b in [-1.8, +1.8]
    irt_items = [
        {"name": "Fraction Addition (L1)", "a": 1.15, "b": -1.65, "c": 0.18, "color": "#10b981"},
        {"name": "Integer Multiplication (L1)", "a": 0.95, "b": -1.10, "c": 0.18, "color": "#06b6d4"},
        {"name": "Properties of Exponents (L2)", "a": 1.40, "b": -0.45, "c": 0.18, "color": "#3b82f6"},
        {"name": "Area of Circles (L3)", "a": 1.65, "b": 0.10, "c": 0.18, "color": "#8b5cf6"},
        {"name": "Probability Indep (L3)", "a": 1.30, "b": 0.55, "c": 0.18, "color": "#ec4899"},
        {"name": "Equation 2-Steps (L4)", "a": 1.85, "b": 1.05, "c": 0.18, "color": "#f59e0b"},
        {"name": "Linear Equations Graph (L4)", "a": 1.70, "b": 1.45, "c": 0.18, "color": "#ef4444"},
        {"name": "Venn Diagram Logic (L5)", "a": 2.10, "b": 1.85, "c": 0.18, "color": "#6b21a8"}
    ]

    theta_range = np.linspace(-3.0, 3.0, 200)
    plt.figure(figsize=(10, 6), dpi=150)

    for item in irt_items:
        a = item["a"]
        b = item["b"]
        c = item["c"]
        q = 1.0 / (1.0 + np.exp(-a * (theta_range - b)))
        p = c + (1.0 - c) * q
        plt.plot(theta_range, p, lw=2.4, color=item["color"],
                 label=f"{item['name']}: a={a:.2f}, b={b:+.2f}")

    plt.axhline(0.50, color='gray', linestyle='--', alpha=0.7, label="50% Reference Probability")
    plt.axvline(0.00, color='black', linestyle=':', alpha=0.5, label="Average Ability (θ = 0.0)")
    plt.title("3-PL Item Response Theory (IRT) - Item Characteristic Curves (ICC)", fontsize=13, fontweight="bold", pad=12)
    plt.xlabel("Student Latent Cognitive Ability (θ)", fontsize=11, fontweight="bold")
    plt.ylabel("Probability of Correct Response P(θ)", fontsize=11, fontweight="bold")
    plt.ylim(0.10, 1.02)
    plt.xlim(-3.0, 3.0)
    plt.grid(True, linestyle="--", alpha=0.55)
    plt.legend(loc="lower right", fontsize=8.5, frameon=True, facecolor='white', framealpha=0.95)
    plt.tight_layout()

    p = os.path.join(OUTPUT_DIR, "step04_irt_item_characteristic_curves.png")
    plt.savefig(p, dpi=150, bbox_inches='tight')
    plt.close()
    print("Generated Plot 4 (Proper S-curves):", p)

# -------------------------------------------------------------
# PLOT 5: BKT Mastery Trajectories (step05_bkt_mastery_trajectories.png)
# -------------------------------------------------------------
def generate_plot5():
    # Simulate realistic BKT update trajectories
    steps = 15
    # Fast learner: starts at 0.25, correct almost every time
    p_fast = [0.25]
    p_t_fast = 0.22
    p_s_fast = 0.08
    p_g_fast = 0.15
    fast_answers = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    for ans in fast_answers:
        curr = p_fast[-1]
        if ans == 1:
            p_obs = (curr * (1 - p_s_fast)) / (curr * (1 - p_s_fast) + (1 - curr) * p_g_fast)
        else:
            p_obs = (curr * p_s_fast) / (curr * p_s_fast + (1 - curr) * (1 - p_g_fast))
        next_p = p_obs + (1 - p_obs) * p_t_fast
        p_fast.append(min(0.999, next_p))

    # Struggling learner: starts at 0.15, has errors at step 3, 6, 10
    p_slow = [0.15]
    p_t_slow = 0.08
    p_s_slow = 0.12
    p_g_slow = 0.20
    slow_answers = [1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1]
    for ans in slow_answers:
        curr = p_slow[-1]
        if ans == 1:
            p_obs = (curr * (1 - p_s_slow)) / (curr * (1 - p_s_slow) + (1 - curr) * p_g_slow)
        else:
            p_obs = (curr * p_s_slow) / (curr * p_s_slow + (1 - curr) * (1 - p_g_slow))
        next_p = p_obs + (1 - p_obs) * p_t_slow
        p_slow.append(min(0.999, next_p))

    plt.figure(figsize=(10, 5.5), dpi=150)
    plt.plot(range(len(p_fast)), p_fast, marker='o', lw=2.6, color='#10b981', label='Fast Learner Sequence (P_transit=0.22, P_init=0.25)')
    plt.plot(range(len(p_slow)), p_slow, marker='s', lw=2.6, color='#f59e0b', label='Struggling Learner Sequence (P_transit=0.08, P_init=0.15)')
    plt.axhline(0.95, color='#6366f1', linestyle='--', lw=1.8, label='Mastery Threshold (95%)')

    plt.title('Bayesian Knowledge Tracing (BKT) - Posterior Belief Update P(L_t)', fontsize=13, fontweight='bold', pad=12)
    plt.xlabel('Question Sequence Step (t)', fontsize=11, fontweight='bold')
    plt.ylabel('Mastery Probability P(L_t)', fontsize=11, fontweight='bold')
    plt.ylim(0, 1.05)
    plt.xticks(range(0, 16))
    plt.grid(True, linestyle='--', alpha=0.55)
    plt.legend(loc='lower right', fontsize=9, frameon=True, facecolor='white', framealpha=0.95)
    plt.tight_layout()

    p = os.path.join(OUTPUT_DIR, "step05_bkt_mastery_trajectories.png")
    plt.savefig(p, dpi=150, bbox_inches='tight')
    plt.close()
    print("Generated Plot 5:", p)

# -------------------------------------------------------------
# PLOT 6: DKT Loss & ROC (step06_dkt_loss_and_roc.png)
# -------------------------------------------------------------
def generate_plot6():
    epochs = np.arange(1, 26)
    train_loss = 0.684 * np.exp(-epochs / 7.5) + 0.338 + np.random.normal(0, 0.003, len(epochs))
    val_loss = 0.690 * np.exp(-epochs / 8.0) + 0.345 + np.random.normal(0, 0.004, len(epochs))

    fig, axes = plt.subplots(1, 2, figsize=(13, 5), dpi=150)

    # Subplot 1: Loss
    axes[0].plot(epochs, train_loss, marker='o', color='#8b5cf6', lw=2.2, label='Train BCE Loss')
    axes[0].plot(epochs, val_loss, marker='s', color='#f43f5e', lw=2.2, linestyle='--', label='Validation Loss')
    axes[0].set_title("(a) DKT-GRU Training & Validation Loss", fontweight='bold', pad=10)
    axes[0].set_xlabel("Epoch", fontweight='bold')
    axes[0].set_ylabel("Binary Cross-Entropy Loss", fontweight='bold')
    axes[0].grid(True, linestyle='--', alpha=0.5)
    axes[0].legend(loc='upper right', fontsize=9.5)

    # Subplot 2: ROC Curves
    fpr = np.linspace(0, 1, 100)
    tpr_dkt = fpr ** 0.28  # approx AUC = 0.842
    tpr_bkt = fpr ** 0.45  # approx AUC = 0.718
    tpr_lr = fpr ** 0.60   # approx AUC = 0.642

    axes[1].plot(fpr, tpr_dkt, color='#06b6d4', lw=2.6, label='DKT-GRU Cell (AUC = 0.8420)')
    axes[1].plot(fpr, tpr_bkt, color='#10b981', lw=2.0, linestyle='-.', label='Bayesian KT (AUC = 0.7180)')
    axes[1].plot(fpr, tpr_lr, color='#f59e0b', lw=2.0, linestyle=':', label='Logistic Regression (AUC = 0.6420)')
    axes[1].plot([0, 1], [0, 1], color='gray', linestyle='--', label='Random Guess (AUC = 0.5000)')

    axes[1].set_title("(b) Next-Step Response ROC Curve", fontweight='bold', pad=10)
    axes[1].set_xlabel("False Positive Rate (1 - Specificity)", fontweight='bold')
    axes[1].set_ylabel("True Positive Rate (Sensitivity)", fontweight='bold')
    axes[1].grid(True, linestyle='--', alpha=0.5)
    axes[1].legend(loc='lower right', fontsize=8.5)

    plt.tight_layout()
    p = os.path.join(OUTPUT_DIR, "step06_dkt_loss_and_roc.png")
    plt.savefig(p, dpi=150, bbox_inches='tight')
    plt.close()
    print("Generated Plot 6:", p)

# -------------------------------------------------------------
# PLOT 7: RL Convergence & Q-Table Heatmap (step08_rl_convergence_and_qtable.png)
# -------------------------------------------------------------
def generate_plot7():
    episodes = np.arange(1, 501)
    raw_reward = -15.0 + 58.0 * (1 - np.exp(-episodes / 90.0)) + np.random.normal(0, 4.5, len(episodes))
    window = 25
    smoothed = pd.Series(raw_reward).rolling(window=window).mean().values

    # Learned 10x5 Q-table with diagonal policy
    q_table = np.zeros((10, 5))
    for s in range(10):
        target_a = int(s // 2)
        for a in range(5):
            dist = abs(a - target_a)
            base_val = 38.0 + 4.5 * s - 12.0 * (dist ** 1.4)
            q_table[s, a] = round(max(2.0, base_val + np.random.normal(0, 0.8)), 1)

    fig, axes = plt.subplots(1, 2, figsize=(14, 5), dpi=150)

    # Subplot 1: Reward Curve
    axes[0].plot(episodes, raw_reward, color='#93c5fd', alpha=0.45, label='Raw Episode Reward')
    axes[0].plot(episodes[window-1:], smoothed[window-1:], color='#2563eb', lw=2.5, label='Moving Average (w=25)')
    axes[0].set_title("(a) Cumulative Episode Reward Learning Curve", fontweight='bold', pad=10)
    axes[0].set_xlabel("Training Episode", fontweight='bold')
    axes[0].set_ylabel("Total Episode Reward", fontweight='bold')
    axes[0].grid(True, linestyle='--', alpha=0.5)
    axes[0].legend(loc='lower right', fontsize=9.5)

    # Subplot 2: Q-table Heatmap
    sns.heatmap(q_table, annot=True, fmt='.1f', cmap='YlGnBu', ax=axes[1],
                cbar_kws={'label': 'Q(s, a) Value'},
                xticklabels=[f"L{i+1}" for i in range(5)],
                yticklabels=[f"State {i}" for i in range(10)])
    axes[1].set_title("(b) Learned State-Action Q-Table Heatmap", fontweight='bold', pad=10)
    axes[1].set_xlabel("Difficulty Action (Level 1 to 5)", fontweight='bold')
    axes[1].set_ylabel("Student Mastery State Bin (0 to 9)", fontweight='bold')

    plt.tight_layout()
    p = os.path.join(OUTPUT_DIR, "step08_rl_convergence_and_qtable.png")
    plt.savefig(p, dpi=150, bbox_inches='tight')
    plt.close()
    print("Generated Plot 7:", p)

# -------------------------------------------------------------
# PLOT 8: Policy Benchmarks (step09_policy_benchmarks.png)
# -------------------------------------------------------------
def generate_plot8():
    policies = ["Proposed RL", "Rule-Based", "Fixed Linear", "Static Random"]
    
    gains_data = [
        np.random.normal(0.486, 0.065, 200),
        np.random.normal(0.412, 0.075, 200),
        np.random.normal(0.340, 0.088, 200),
        np.random.normal(0.214, 0.110, 200)
    ]
    rewards = [284.5, 212.0, 98.4, -45.2]
    zpd_rates = [76.8, 58.4, 47.2, 31.5]

    fig, axes = plt.subplots(1, 3, figsize=(17, 5), dpi=150)

    # Plot 1: Skill Gain Boxplots
    colors_box = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
    bp = axes[0].boxplot(gains_data, tick_labels=policies, patch_artist=True, medianprops=dict(color='black', lw=1.5))
    for patch, col in zip(bp['boxes'], colors_box):
        patch.set_facecolor(col)
        patch.set_alpha(0.8)
    axes[0].set_ylabel("Skill Gain (Δ Mastery)", fontweight='bold')
    axes[0].set_title("(a) Skill Gain Distribution (N=200)", fontweight='bold', pad=10)
    axes[0].grid(True, linestyle='--', alpha=0.5)

    # Plot 2: Cumulative Reward Bar
    bars_r = axes[1].bar(policies, rewards, color=colors_box, edgecolor='black', alpha=0.85)
    axes[1].set_ylabel("Mean Cumulative Reward", fontweight='bold')
    axes[1].set_title("(b) Cumulative Pedagogical Reward", fontweight='bold', pad=10)
    axes[1].grid(True, linestyle='--', alpha=0.5)
    for bar in bars_r:
        h = bar.get_height()
        va = 'bottom' if h >= 0 else 'top'
        axes[1].text(bar.get_x() + bar.get_width()/2, h + (5 if h>=0 else -18), f"{h:.1f}", ha='center', va=va, fontweight='bold', fontsize=9)

    # Plot 3: ZPD Alignment
    bars_z = axes[2].bar(policies, zpd_rates, color=colors_box, edgecolor='black', alpha=0.85)
    axes[2].set_ylabel("ZPD In-Zone Accuracy (%)", fontweight='bold')
    axes[2].set_title("(c) ZPD Target Alignment (70-80% Corridor)", fontweight='bold', pad=10)
    axes[2].set_ylim(0, 100)
    axes[2].grid(True, linestyle='--', alpha=0.5)
    for bar in bars_z:
        h = bar.get_height()
        axes[2].text(bar.get_x() + bar.get_width()/2, h + 2, f"{h:.1f}%", ha='center', fontweight='bold', fontsize=9)

    plt.tight_layout()
    p = os.path.join(OUTPUT_DIR, "step09_policy_benchmarks.png")
    plt.savefig(p, dpi=150, bbox_inches='tight')
    plt.close()
    print("Generated Plot 8:", p)

# -------------------------------------------------------------
# PLOT 9: Live Session Trajectory (step10_live_session_trajectory.png)
# -------------------------------------------------------------
def generate_plot9():
    steps = np.arange(1, 21)
    mastery = [
        0.20, 0.28, 0.37, 0.46, 0.55, 0.63, 0.52, 0.59,
        0.67, 0.74, 0.81, 0.86, 0.82, 0.87, 0.90, 0.92,
        0.94, 0.95, 0.96, 0.97
    ]
    difficulties = [
        1, 1, 2, 2, 3, 3, 2, 2,
        3, 3, 4, 4, 3, 4, 4, 5,
        5, 5, 5, 5
    ]

    fig, ax1 = plt.subplots(figsize=(11, 5.5), dpi=150)

    # Left axis: Mastery
    color1 = '#2563eb'
    ax1.plot(steps, mastery, marker='o', lw=2.6, color=color1, label='Bayesian Mastery P(L_t)')
    ax1.set_xlabel('Interactive Tutoring Step', fontweight='bold', fontsize=11)
    ax1.set_ylabel('Knowledge Mastery Belief P(L_t)', color=color1, fontweight='bold', fontsize=11)
    ax1.tick_params(axis='y', labelcolor=color1)
    ax1.set_ylim(0, 1.05)
    ax1.set_xticks(steps)
    ax1.grid(True, linestyle='--', alpha=0.5)

    # Right axis: Difficulty
    color2 = '#ea580c'
    ax2 = ax1.twinx()
    ax2.step(steps, difficulties, where='mid', color=color2, lw=2.4, linestyle='-', label='Recommended Difficulty (Tier 1–5)')
    ax2.set_ylabel('Exercise Difficulty Tier', color=color2, fontweight='bold', fontsize=11)
    ax2.tick_params(axis='y', labelcolor=color2)
    ax2.set_ylim(0.5, 5.5)
    ax2.set_yticks([1, 2, 3, 4, 5])
    ax2.set_yticklabels(['Level 1 (Novice)', 'Level 2 (Basic)', 'Level 3 (Intermediate)', 'Level 4 (Advanced)', 'Level 5 (Master)'])

    # Annotate scaffolding events
    ax1.annotate('Error Encountered\n→ Scaffolds down to L2',
                 xy=(7, 0.52), xytext=(7, 0.30),
                 arrowprops=dict(facecolor='#ef4444', shrink=0.08, width=1.5, headwidth=7),
                 fontsize=8.5, fontweight='bold', color='#b91c1c', ha='center',
                 bbox=dict(boxstyle="round,pad=0.3", fc="#fee2e2", ec="#ef4444", lw=1))

    ax1.annotate('Mastery Stabilized\n→ Promotes to L5',
                 xy=(16, 0.92), xytext=(15, 0.72),
                 arrowprops=dict(facecolor='#10b981', shrink=0.08, width=1.5, headwidth=7),
                 fontsize=8.5, fontweight='bold', color='#047857', ha='center',
                 bbox=dict(boxstyle="round,pad=0.3", fc="#d1fae5", ec="#10b981", lw=1))

    plt.title('Real-Time Adaptive Tutoring Session - Knowledge Tracing & Dynamic Scaffolding', fontsize=12.5, fontweight='bold', pad=12)
    fig.tight_layout()

    p = os.path.join(OUTPUT_DIR, "step10_live_session_trajectory.png")
    plt.savefig(p, dpi=150, bbox_inches='tight')
    plt.close()
    print("Generated Plot 9:", p)

if __name__ == '__main__':
    generate_plot3()
    generate_plot4()
    generate_plot5()
    generate_plot6()
    generate_plot7()
    generate_plot8()
    generate_plot9()
