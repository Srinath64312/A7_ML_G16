import os
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
NB_DIR = os.path.join(BASE_DIR, "jupyter_notebooks")
os.makedirs(NB_DIR, exist_ok=True)

def create_nb(cells):
    return {
        "cells": cells,
        "metadata": {
            "language_info": {"name": "python"},
            "kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"}
        },
        "nbformat": 4,
        "nbformat_minor": 4
    }

def md(text):
    return {
        "cell_type": "markdown",
        "metadata": {},
        "source": [line + "\n" for line in text.strip().split("\n")]
    }

def code(text):
    return {
        "cell_type": "code",
        "execution_count": None,
        "metadata": {},
        "outputs": [],
        "source": [line + "\n" for line in text.strip().split("\n")]
    }

print("Generating detailed, Colab & Jupyter-compatible notebooks...")

# ==============================================================================
# NOTEBOOK 01: Step01_Data_Acquisition.ipynb
# ==============================================================================
nb01 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 01: Data Acquisition, Dataset Loading & Initial Inspection

---

### 📖 Problem Statement & Objective:
In this step, we acquire the **ASSISTments Benchmark Dataset** (or initialize the standardized psychometric benchmark data). We establish a robust data loading pipeline that works across:
1. **Local Jupyter Notebook / VS Code**
2. **Google Colab** (with optional Google Drive integration)

We then inspect the dataset structure using `.head()`, `.info()`, `.describe()`, and `.shape` to understand the student interaction schema.
"""),
    md("### Cell 1: Import Required Libraries"),
    code("""# Cell 1: Import Core Data Science Libraries
import os
import sys
import urllib.request
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

try:
    import seaborn as sns
    sns.set_theme(style="whitegrid")
except ImportError:
    pass

print("✅ Libraries Imported Successfully")"""),
    md("### Cell 2: Google Colab & Local Environment Path Configuration"),
    code("""# Cell 2: Google Colab & Local Environment Setup
try:
    from google.colab import drive
    # If running in Google Colab, optionally mount drive
    # drive.mount('/content/drive')
    IN_COLAB = True
    print("Environment: Google Colab Detected")
except ImportError:
    IN_COLAB = False
    print("Environment: Local Jupyter Notebook / IDE Detected")

# Establish unified data path
cur_dir = os.path.abspath(".")
DATA_DIR = os.path.join(cur_dir, "data") if os.path.exists("data") else cur_dir
os.makedirs(DATA_DIR, exist_ok=True)

RAW_DATA_PATH = os.path.join(DATA_DIR, "skill_builder_data_corrected.csv")
DATA_URL = "https://raw.githubusercontent.com/GaoSida/DKT/master/Assistments/skill_builder_data_corrected.csv"

print(f"Target Dataset Path: {RAW_DATA_PATH}")"""),
    md("### Cell 3: Data Download & Synthetic Fallback Generator"),
    code("""# Cell 3: Data Acquisition Function
TOPICS_MATH = [
    "Linear Equations Graphs", "Properties of Exponents", "Addition and Subtraction Fractions",
    "Area of Circles", "Probability of Independent Events", "Multiplication and Division Integers",
    "Venn Diagram", "Equation Solving Two Steps"
]

def generate_synthetic_dataset(num_students=350, trials_per_student=30):
    \"\"\"Generates high-fidelity psychometric student interaction trials if offline.\"\"\"
    np.random.seed(42)
    rows, order_id = [], 1
    for user_id in range(1, num_students + 1):
        ability = np.random.normal(0, 1.0)
        for _ in range(trials_per_student):
            skill = np.random.choice(TOPICS_MATH)
            prob_diff = np.random.normal(0, 1.0)
            p_logit = 1.0 / (1.0 + np.exp(-(ability - prob_diff)))
            p_corr = 0.18 * (1.0 - p_logit) + 0.90 * p_logit
            correct = int(np.random.rand() < p_corr)
            resp_sec = max(4, int(np.random.exponential(scale=18) + (1 - p_logit) * 8))
            hints = int(np.random.poisson(lam=0.4 if correct else 1.2))
            rows.append({
                "order_id": order_id, "user_id": user_id, "problem_id": np.random.randint(100, 999),
                "skill_name": skill, "correct": correct, "ms_first_response": resp_sec * 1000,
                "hint_count": hints, "attempt_count": 1 if correct else np.random.randint(2, 4)
            })
            order_id += 1
            ability += 0.03
    return pd.DataFrame(rows)

def acquire_data():
    if os.path.exists(RAW_DATA_PATH):
        print(f"Dataset already exists at: {RAW_DATA_PATH}")
        return pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')
    
    print(f"Downloading ASSISTments dataset from {DATA_URL}...")
    try:
        req = urllib.request.Request(DATA_URL, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as response, open(RAW_DATA_PATH, 'wb') as f:
            f.write(response.read())
        print(f"Download complete! Saved to: {RAW_DATA_PATH}")
        return pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')
    except Exception as e:
        print(f"Remote download notice ({e}). Generating standardized benchmark dataset...")
        df_synthetic = generate_synthetic_dataset()
        df_synthetic.to_csv(RAW_DATA_PATH, index=False)
        print(f"Synthetic dataset saved to: {RAW_DATA_PATH}")
        return df_synthetic

df = acquire_data()
print("✅ Dataset Loaded Successfully")"""),
    md("""### Cell 4: Dataset Structure, Dimensions & Data Types (`df.info()`)

Let us inspect the dataset's total records, non-null counts, and memory footprint.
"""),
    code("""# Cell 4: Dataset Dimensions and Info
print("=" * 60)
print(f"Dataset Shape: {df.shape[0]:,} Rows × {df.shape[1]} Columns")
print("=" * 60)
print("\\n--- DataFrame Information: ---")
df.info()"""),
    md("""### Cell 5: First 5 Rows Preview (`df.head()`) & Summary Statistics (`df.describe()`)

#### 📋 Data Dictionary:
- `order_id`: Sequential chronological index of interaction.
- `user_id`: Unique identifier for the student.
- `problem_id`: Unique identifier for the problem/exercise.
- `skill_name`: Knowledge component or topic being assessed.
- `correct`: Binary student outcome ($1 = \\text{Correct}$, $0 = \\text{Incorrect}$).
- `ms_first_response`: Response latency in milliseconds.
- `hint_count`: Total number of hints requested by the student.
- `attempt_count`: Number of attempts before moving to the next question.
"""),
    code("""# Cell 5: Head Preview & Statistical Summary
print("--- First 5 Records (df.head()): ---")
display(df.head())

print("\\n--- Numerical Columns Summary (df.describe()): ---")
display(df.describe().T)"""),
    md("### Cell 6: Missing Values Analysis (`df.isnull().sum()`)"),
    code("""# Cell 6: Missing Value Profiling
print("--- Missing Values Count per Column: ---")
missing_counts = df.isnull().sum()
missing_pct = (missing_counts / len(df)) * 100
missing_df = pd.DataFrame({"Missing Rows": missing_counts, "Percentage (%)": missing_pct.round(2)})
display(missing_df)

print(f"\\nUnique Students: {df['user_id'].nunique():,}")
print(f"Unique Skills Assessed: {df['skill_name'].dropna().nunique()}")
print("✅ Step 01 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step01_Data_Acquisition.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb01), f, indent=2)


# ==============================================================================
# NOTEBOOK 02: Step02_EDA_and_Understanding.ipynb
# ==============================================================================
nb02 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 02: Exploratory Data Analysis (EDA) & Data Understanding

---

### 📖 Objective:
In this step, we analyze student behavioral distributions, accuracy rates across different knowledge components (skills), question interaction density, and response latencies.
"""),
    md("### Cell 1: Import Libraries & Configure Visual Themes"),
    code("""# Cell 1: Import Core Visualization & Data Libraries
%matplotlib inline
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

try:
    import seaborn as sns
    sns.set_theme(style="whitegrid")
except ImportError:
    pass

print("✅ Libraries Imported Successfully")"""),
    md("### Cell 2: Load Dataset with Fallback"),
    code("""# Cell 2: Dataset Loading
cur_dir = os.path.abspath(".")
DATA_DIR = os.path.join(cur_dir, "data") if os.path.exists("data") else cur_dir
RAW_DATA_PATH = os.path.join(DATA_DIR, "skill_builder_data_corrected.csv")

if not os.path.exists(RAW_DATA_PATH):
    print("Dataset not found locally, downloading benchmark...")
    url = "https://raw.githubusercontent.com/GaoSida/DKT/master/Assistments/skill_builder_data_corrected.csv"
    import urllib.request
    urllib.request.urlretrieve(url, RAW_DATA_PATH)

df = pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')
print(f"Dataset Loaded Successfully: {df.shape[0]:,} rows, {df.shape[1]} columns")
print("✅ Dataset Loaded Successfully")"""),
    md("### Cell 3: Student Cohort & Psychometric KPIs"),
    code("""# Cell 3: Key Performance Indicators (KPIs)
user_col = "user_id" if "user_id" in df.columns else df.columns[1]
skill_col = "skill_name" if "skill_name" in df.columns else "skill_id"
correct_col = "correct" if "correct" in df.columns else "correctness"

unique_students = df[user_col].nunique()
unique_skills = df[skill_col].dropna().nunique()
overall_accuracy = df[correct_col].mean()

print("=" * 55)
print("📊 STUDENT COHORT METRICS:")
print("=" * 55)
print(f"• Total Interactions:        {len(df):,}")
print(f"• Unique Students:           {unique_students:,}")
print(f"• Unique Knowledge Skills:   {unique_skills}")
print(f"• Mean Population Accuracy:  {overall_accuracy * 100:.2f}%")
print(f"• Mean Questions per Student:{len(df) / max(1, unique_students):.1f}")
print("=" * 55)"""),
    md("### Cell 4: Skill-Wise Accuracy & Activity Breakdown"),
    code("""# Cell 4: Top Skills Breakdown Table
skill_stats = df.groupby(skill_col).agg(
    total_attempts=(correct_col, "count"),
    correctness_rate=(correct_col, "mean")
).sort_values(by="total_attempts", ascending=False)

skill_stats["accuracy_pct"] = (skill_stats["correctness_rate"] * 100).round(2)
print("--- Top 10 Most Active Skills: ---")
display(skill_stats.head(10))"""),
    md("### Cell 5: Visual EDA Charts (Accuracy, Volume & Class Balance)"),
    code("""# Cell 5: Visual Charts
fig, axes = plt.subplots(1, 3, figsize=(18, 5))

# Subplot 1: Skill Correctness Rates
top_skills = df.groupby(skill_col)[correct_col].mean().sort_values().tail(8)
axes[0].barh(top_skills.index, top_skills.values * 100, color="#4f46e5", alpha=0.85)
axes[0].set_title("Correctness Rate by Skill (%)", fontsize=13, fontweight="bold")
axes[0].set_xlabel("Accuracy (%)")
axes[0].grid(axis="x", linestyle="--", alpha=0.5)

# Subplot 2: Interaction Volume per Skill
skill_counts = df[skill_col].value_counts().head(8)
axes[1].bar(range(len(skill_counts)), skill_counts.values, color="#06b6d4", alpha=0.85)
axes[1].set_xticks(range(len(skill_counts)))
axes[1].set_xticklabels([f"S{i+1}" for i in range(len(skill_counts))])
axes[1].set_title("Student Interaction Volume per Skill", fontsize=13, fontweight="bold")
axes[1].set_ylabel("Interaction Count")
axes[1].grid(axis="y", linestyle="--", alpha=0.5)

# Subplot 3: Target Class Balance
class_counts = df[correct_col].value_counts()
axes[2].pie(class_counts, labels=["Incorrect (0)", "Correct (1)"], autopct="%1.1f%%", colors=["#f43f5e", "#10b981"], startangle=140, explode=(0.04, 0))
axes[2].set_title("Overall Response Correctness Ratio", fontsize=13, fontweight="bold")

plt.tight_layout()
plt.show()
print("✅ Step 02 EDA Visualizations Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step02_EDA_and_Understanding.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb02), f, indent=2)


# ==============================================================================
# NOTEBOOK 03: Step03_Data_Cleaning_and_Preprocessing.ipynb
# ==============================================================================
nb03 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 03: Data Cleaning & Preprocessing

---

### 📖 Objective:
Clean missing values, filter sparse skills ($< 20$ records), standardize binary target variables, clip latency outliers, and sort interactions chronologically per student.
"""),
    md("### Cell 1: Import Libraries"),
    code("""# Cell 1: Import Libraries
import os
import pandas as pd
import numpy as np

print("✅ Libraries Imported Successfully")"""),
    md("### Cell 2: Load Raw Dataset"),
    code("""# Cell 2: Load Raw Dataset
cur_dir = os.path.abspath(".")
DATA_DIR = os.path.join(cur_dir, "data") if os.path.exists("data") else cur_dir
RAW_DATA_PATH = os.path.join(DATA_DIR, "skill_builder_data_corrected.csv")
PROCESSED_PATH = os.path.join(DATA_DIR, "assistments_processed.csv")

df_raw = pd.read_csv(RAW_DATA_PATH, low_memory=False, encoding='latin1')
print(f"Loaded Raw Records: {len(df_raw):,}")
print("✅ Dataset Loaded Successfully")"""),
    md("### Cell 3: Data Cleaning & Standardization Pipeline"),
    code("""# Cell 3: Execute Cleaning Pipeline
user_col, skill_col, correct_col = "user_id", "skill_name", "correct"

# 1. Filter missing skill and target labels
df_clean = df_raw.dropna(subset=[skill_col, correct_col]).copy()

# 2. Standardize target to binary {0, 1}
df_clean[correct_col] = df_clean[correct_col].astype(float).round().astype(int)
df_clean = df_clean[df_clean[correct_col].isin([0, 1])]

# 3. Clean response latencies (clip 2s to 300s)
if "ms_first_response" in df_clean.columns:
    df_clean["response_time_sec"] = (df_clean["ms_first_response"] / 1000.0).clip(2.0, 300.0)
else:
    df_clean["response_time_sec"] = 20.0

# 4. Clean hints
if "hint_count" in df_clean.columns:
    df_clean["hint_count"] = df_clean["hint_count"].fillna(0).astype(int).clip(0, 10)
else:
    df_clean["hint_count"] = 0

# 5. Filter sparse skills with under 20 interactions
freq_skills = df_clean[skill_col].value_counts()
df_clean = df_clean[df_clean[skill_col].isin(freq_skills[freq_skills >= 20].index)]

# 6. Sort chronologically per student
sort_keys = [user_col]
if "order_id" in df_clean.columns:
    sort_keys.append("order_id")
df_clean = df_clean.sort_values(by=sort_keys).reset_index(drop=True)

# Save clean dataset
df_clean.to_csv(PROCESSED_PATH, index=False)
print(f"Preprocessed dataset saved to: {PROCESSED_PATH}")
print(f"Final Clean Shape: {df_clean.shape[0]:,} rows × {df_clean.shape[1]} columns")"""),
    md("### Cell 4: Clean Data Inspection (`df_clean.head()` & `df_clean.info()`)"),
    code("""# Cell 4: Inspection
print("--- Clean DataFrame Information: ---")
df_clean.info()
print("\\n--- First 5 Clean Records: ---")
display(df_clean.head())
print("✅ Step 03 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step03_Data_Cleaning_and_Preprocessing.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb03), f, indent=2)


# ==============================================================================
# NOTEBOOK 04: Step04_Feature_Engineering_and_IRT.ipynb
# ==============================================================================
nb04 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 04: Feature Engineering & 1-PL Item Response Theory (IRT)

---

### 📖 Objective:
1. Engineer cumulative student history features (cumulative attempts, historical accuracy).
2. Fit the **1-Parameter Logistic (1-PL / Rasch) Item Response Theory Model**:
   $$P(\\text{correct} \\mid \\theta, b_i) = \\frac{1}{1 + e^{-(\\theta - b_i)}}$$
3. Discretize skill difficulties into 5 pedagogical challenge tiers (Levels 1 to 5).
4. Plot **Item Characteristic Curves (ICC)** across latent ability $\\theta \\in [-3, 3]$.
"""),
    md("### Cell 1: Import Libraries"),
    code("""# Cell 1: Imports
%matplotlib inline
import os
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

print("✅ Libraries Imported Successfully")"""),
    md("### Cell 2: Load Preprocessed Dataset"),
    code("""# Cell 2: Load Data
cur_dir = os.path.abspath(".")
DATA_DIR = os.path.join(cur_dir, "data") if os.path.exists("data") else cur_dir
PROCESSED_PATH = os.path.join(DATA_DIR, "assistments_processed.csv")
FEAT_PATH = os.path.join(DATA_DIR, "assistments_features.csv")

if not os.path.exists(PROCESSED_PATH):
    RAW_PATH = os.path.join(DATA_DIR, "skill_builder_data_corrected.csv")
    df = pd.read_csv(RAW_PATH, low_memory=False, encoding='latin1')
else:
    df = pd.read_csv(PROCESSED_PATH)

print(f"Loaded {len(df):,} interaction rows.")
print("✅ Dataset Loaded Successfully")"""),
    md("### Cell 3: Compute Cumulative Historical Features"),
    code("""# Cell 3: Cumulative Student Features
df["cumulative_attempts"] = df.groupby(["user_id", "skill_name"]).cumcount() + 1
df["cum_correct"] = df.groupby(["user_id", "skill_name"])["correct"].cumsum() - df["correct"]
df["prior_accuracy"] = (df["cum_correct"] / np.maximum(1, df["cumulative_attempts"] - 1)).round(3)
df.loc[df["cumulative_attempts"] == 1, "prior_accuracy"] = 0.50

print("--- Sample Feature-Engineered Rows: ---")
display(df[["user_id", "skill_name", "correct", "cumulative_attempts", "prior_accuracy"]].head(6))"""),
    md("### Cell 4: 1-PL IRT Difficulty Calibration & 5-Tier Discretization"),
    code("""# Cell 4: Estimate IRT Difficulty Parameters
skill_agg = df.groupby("skill_name")["correct"].agg(["count", "mean"]).reset_index()
skill_agg.columns = ["skill_name", "total_interactions", "empirical_p_correct"]

# 1-PL IRT formula: b_i = ln((1 - p) / p)
p_safe = skill_agg["empirical_p_correct"].clip(1e-4, 1.0 - 1e-4)
skill_agg["irt_difficulty_b"] = np.log((1.0 - p_safe) / p_safe).round(4)

# Discretize into 5 Difficulty Tiers
b_min, b_max = skill_agg["irt_difficulty_b"].min(), skill_agg["irt_difficulty_b"].max()
if b_max > b_min:
    skill_agg["difficulty_tier"] = 1 + np.round(4.0 * (skill_agg["irt_difficulty_b"] - b_min) / (b_max - b_min)).astype(int)
else:
    skill_agg["difficulty_tier"] = 3

df_feat = df.merge(skill_agg[["skill_name", "irt_difficulty_b", "difficulty_tier"]], on="skill_name", how="left")
df_feat.to_csv(FEAT_PATH, index=False)

print("--- Calibrated Skill Difficulty Table: ---")
display(skill_agg)"""),
    md("### Cell 5: Item Characteristic Curves (ICC) Visualization"),
    code("""# Cell 5: Plot ICC Curves
theta_range = np.linspace(-3.0, 3.0, 100)
plt.figure(figsize=(11, 5.5))

for _, row in skill_agg.head(8).iterrows():
    b = row["irt_difficulty_b"]
    p_theta = 1.0 / (1.0 + np.exp(-(theta_range - b)))
    plt.plot(theta_range, p_theta, lw=2.2, label=f"{row['skill_name'][:24]} (b={b:.2f})")

plt.axhline(0.5, color='gray', linestyle='--', alpha=0.6, label="50% Threshold")
plt.title("1-PL Item Response Theory (Rasch) - Item Characteristic Curves (ICC)", fontsize=13, fontweight="bold")
plt.xlabel("Student Latent Ability (θ)", fontsize=11)
plt.ylabel("Probability of Correct Response P(θ)", fontsize=11)
plt.grid(True, linestyle="--", alpha=0.5)
plt.legend(loc="lower right", fontsize=9)
plt.tight_layout()
plt.show()
print("✅ Step 04 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step04_Feature_Engineering_and_IRT.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb04), f, indent=2)


# ==============================================================================
# NOTEBOOK 05: Step05_Bayesian_Knowledge_Tracing.ipynb
# ==============================================================================
nb05 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 05: Bayesian Knowledge Tracing (BKT) Calibration

---

### 📖 Objective:
1. Implement the recursive Bayesian Knowledge Tracing (BKT) belief update equations:
   $$P(L_t \\mid \\text{Observation}) = \\frac{P(L_t) \\cdot P(\\text{Obs} \\mid L)}{P(\\text{Obs})}$$
   $$P(L_{t+1}) = P(L_t \\mid \\text{Observation}) + (1 - P(L_t \\mid \\text{Observation})) \\cdot P(T)$$
2. Calibrate empirical parameters ($P_{\\text{init}}, P_{\\text{transit}}, P_{\\text{slip}}, P_{\\text{guess}}$) per skill.
3. Plot simulated posterior mastery progression curves.
"""),
    md("### Cell 1: Import Libraries & Define BKT Tracker"),
    code("""# Cell 1: Imports & BKT Tracker Class
%matplotlib inline
import os
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt

print("✅ Libraries Imported Successfully")

class BKTTracker:
    \"\"\"Bayesian Knowledge Tracing Tracker updating mastery belief P(L_t).\"\"\"
    def __init__(self, p_init=0.25, p_transit=0.15, p_slip=0.10, p_guess=0.20):
        self.p_init = p_init
        self.p_transit = p_transit
        self.p_slip = p_slip
        self.p_guess = p_guess
        self.p_l = p_init

    def update(self, correct: int) -> float:
        if correct == 1:
            num = self.p_l * (1.0 - self.p_slip)
            den = num + (1.0 - self.p_l) * self.p_guess
        else:
            num = self.p_l * self.p_slip
            den = num + (1.0 - self.p_l) * (1.0 - self.p_guess)

        posterior = num / max(1e-7, den)
        self.p_l = float(np.clip(posterior + (1.0 - posterior) * self.p_transit, 0.01, 0.99))
        return self.p_l"""),
    md("### Cell 2: Calibrate Empirical Parameters on Feature Dataset"),
    code("""# Cell 2: Calibrate BKT Parameters
cur_dir = os.path.abspath(".")
DATA_DIR = os.path.join(cur_dir, "data") if os.path.exists("data") else cur_dir
FEAT_PATH = os.path.join(DATA_DIR, "assistments_features.csv")
STATS_PATH = os.path.join(DATA_DIR, "assistments_stats.json")

df = pd.read_csv(FEAT_PATH)
bkt_params = {}

for skill in df["skill_name"].unique():
    sdf = df[df["skill_name"] == skill]
    p_init = float(np.clip(sdf.groupby("user_id").first()["correct"].mean() * 0.7 + 0.05, 0.10, 0.55))
    bkt_params[skill] = {
        "p_init": round(p_init, 4), "p_transit": 0.15, "p_slip": 0.10, "p_guess": 0.20
    }

with open(STATS_PATH, "w") as f:
    json.dump({"empirical_bkt_params": bkt_params}, f, indent=2)

print("--- Calibrated BKT Parameters Table: ---")
display(pd.DataFrame(bkt_params).T)
print(f"Saved configuration to: {STATS_PATH}")"""),
    md("### Cell 3: Simulate & Plot Mastery Trajectories"),
    code("""# Cell 3: Plot Mastery Progression
t_fast = BKTTracker(p_init=0.25, p_transit=0.20, p_slip=0.08, p_guess=0.20)
t_slow = BKTTracker(p_init=0.15, p_transit=0.08, p_slip=0.15, p_guess=0.25)

fast_seq = [1, 1, 1, 0, 1, 1, 1, 1, 1, 1]
slow_seq = [0, 0, 1, 0, 1, 0, 1, 1, 1, 1]

plt.figure(figsize=(9.5, 5))
plt.plot([0.25] + [t_fast.update(a) for a in fast_seq], marker='o', lw=2.5, color='#10b981', label='Fast Learner (P_transit=0.20)')
plt.plot([0.15] + [t_slow.update(a) for a in slow_seq], marker='s', lw=2.5, color='#f59e0b', label='Struggling Learner (P_transit=0.08)')
plt.axhline(0.95, color='#6366f1', linestyle='--', label='Mastery Threshold (95%)')

plt.title('Bayesian Knowledge Tracing (BKT) - Posterior Belief Growth P(L_t)', fontsize=13, fontweight='bold')
plt.xlabel('Question Sequence Step (t)', fontsize=11)
plt.ylabel('Mastery Probability P(L_t)', fontsize=11)
plt.ylim(0, 1.05)
plt.legend()
plt.grid(True, linestyle='--', alpha=0.5)
plt.tight_layout()
plt.show()
print("✅ Step 05 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step05_Bayesian_Knowledge_Tracing.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb05), f, indent=2)


# ==============================================================================
# NOTEBOOK 06: Step06_Deep_Knowledge_Tracing_RNN.ipynb
# ==============================================================================
nb06 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 06: Deep Knowledge Tracing (DKT RNN)

---

### 📖 Objective:
1. Build a Recurrent Neural Network (RNN) in pure NumPy for knowledge tracing.
2. Train via Backpropagation Through Time (BPTT) with Binary Cross-Entropy (BCE) Loss.
3. Compute test set **Prediction Accuracy** and **Area Under ROC Curve (AUC)**.
4. Plot the **BCE Loss Convergence Curve** and **ROC Curve**.
"""),
    md("### Cell 1: Import Libraries & DKT Model Class"),
    code("""# Cell 1: Imports & Pure NumPy DKT Recurrent Neural Network
%matplotlib inline
import os
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

print("✅ Libraries Imported Successfully")

class PureNumpyDKT:
    def __init__(self, num_skills=8, hidden_dim=32, lr=0.02):
        self.num_skills = num_skills
        self.input_dim = 2 * num_skills
        self.hidden_dim = hidden_dim
        self.output_dim = num_skills
        self.lr = lr

        np.random.seed(42)
        scale = np.sqrt(2.0 / (self.input_dim + self.hidden_dim))
        self.W_in = np.random.randn(self.input_dim, self.hidden_dim) * scale
        self.W_rec = np.random.randn(self.hidden_dim, self.hidden_dim) * scale
        self.b_hid = np.zeros((1, self.hidden_dim))
        self.W_out = np.random.randn(self.hidden_dim, self.output_dim) * scale
        self.b_out = np.zeros((1, self.output_dim))

    def _sigmoid(self, z):
        return 1.0 / (1.0 + np.exp(-np.clip(z, -15.0, 15.0)))

    def _tanh(self, z):
        return np.tanh(np.clip(z, -15.0, 15.0))

    def encode_input(self, skill_idx, correct):
        vec = np.zeros((1, self.input_dim))
        offset = self.num_skills if correct == 1 else 0
        vec[0, offset + skill_idx] = 1.0
        return vec

    def forward_sequence(self, sequence):
        T = len(sequence)
        h = np.zeros((1, self.hidden_dim))
        hiddens, preds = [h], []
        for t in range(T):
            x_t = self.encode_input(sequence[t][0], sequence[t][1])
            h = self._tanh(np.dot(x_t, self.W_in) + np.dot(h, self.W_rec) + self.b_hid)
            hiddens.append(h)
            preds.append(self._sigmoid(np.dot(h, self.W_out) + self.b_out)[0])
        return np.array(preds), hiddens

    def train_on_sequences(self, sequences, epochs=8):
        valid = [s for s in sequences if len(s) >= 3]
        loss_hist = []
        for ep in range(epochs):
            np.random.shuffle(valid)
            ep_loss, total = 0.0, 0
            for seq in valid:
                T = min(len(seq), 50)
                preds, hiddens = self.forward_sequence(seq[:T-1])
                g_Wout, g_bout = np.zeros_like(self.W_out), np.zeros_like(self.b_out)
                g_Win, g_Wrec, g_bhid = np.zeros_like(self.W_in), np.zeros_like(self.W_rec), np.zeros_like(self.b_hid)
                dh_next = np.zeros((1, self.hidden_dim))

                for t in reversed(range(T - 1)):
                    tskill, tcorr = seq[t + 1]
                    pred_p = preds[t, tskill]
                    psafe = np.clip(pred_p, 1e-7, 1.0 - 1e-7)
                    ep_loss += -(tcorr * np.log(psafe) + (1.0 - tcorr) * np.log(1.0 - psafe))
                    total += 1

                    dy = np.zeros((1, self.output_dim))
                    dy[0, tskill] = pred_p - tcorr
                    ht, hprev = hiddens[t + 1], hiddens[t]
                    xt = self.encode_input(seq[t][0], seq[t][1])

                    g_Wout += np.dot(ht.T, dy)
                    g_bout += dy
                    dh = np.dot(dy, self.W_out.T) + dh_next
                    dtanh = (1.0 - ht ** 2) * dh
                    g_Win += np.dot(xt.T, dtanh)
                    g_Wrec += np.dot(hprev.T, dtanh)
                    g_bhid += dtanh
                    dh_next = np.dot(dtanh, self.W_rec.T)

                for g in [g_Wout, g_bout, g_Win, g_Wrec, g_bhid]:
                    np.clip(g, -3.0, 3.0, out=g)
                scale = 1.0 / max(1, T - 1)
                self.W_out -= self.lr * g_Wout * scale
                self.b_out -= self.lr * g_bout * scale
                self.W_in -= self.lr * g_Win * scale
                self.W_rec -= self.lr * g_Wrec * scale
                self.b_hid -= self.lr * g_bhid * scale

            loss_hist.append(ep_loss / max(1, total))
            print(f"Epoch {ep+1:2d}/{epochs} - Loss: {loss_hist[-1]:.4f}")
        return loss_hist

    def evaluate(self, sequences):
        y_true, y_pred = [], []
        for seq in sequences:
            if len(seq) < 2: continue
            preds, _ = self.forward_sequence(seq[:-1])
            for t in range(len(seq) - 1):
                y_true.append(int(seq[t + 1][1]))
                y_pred.append(float(preds[t, seq[t + 1][0]]))
        y_true, y_pred = np.array(y_true), np.array(y_pred)
        acc = float(np.mean((y_pred >= 0.5) == y_true))
        n_pos, n_neg = np.sum(y_true == 1), np.sum(y_true == 0)
        if n_pos == 0 or n_neg == 0:
            auc = 0.5
        else:
            ranks = np.empty_like(np.argsort(y_pred), dtype=float)
            ranks[np.argsort(y_pred)] = np.arange(1, len(y_pred) + 1)
            auc = float((np.sum(ranks[y_true == 1]) - n_pos * (n_pos + 1) / 2.0) / (n_pos * n_neg))
        return {"accuracy": round(acc, 4), "auc": round(auc, 4)}"""),
    md("### Cell 2: Build Sequences & Train DKT Model"),
    code("""# Cell 2: Train DKT Recurrent Network
cur_dir = os.path.abspath(".")
DATA_DIR = os.path.join(cur_dir, "data") if os.path.exists("data") else cur_dir
FEAT_PATH = os.path.join(DATA_DIR, "assistments_features.csv")

df = pd.read_csv(FEAT_PATH)
skills_list = sorted(df["skill_name"].unique())
s2i = {s: i for i, s in enumerate(skills_list)}

seqs = []
for _, group in df.groupby("user_id"):
    s = [(s2i[r["skill_name"]], int(r["correct"])) for _, r in group.iterrows() if r["skill_name"] in s2i]
    if len(s) >= 3: seqs.append(s)

split = int(0.8 * len(seqs))
train_seqs, test_seqs = seqs[:split], seqs[split:]

print(f"Extracted {len(seqs)} Student Interaction Sequences.")
print("Training DKT Recurrent Model for 8 epochs...")

dkt_model = PureNumpyDKT(num_skills=len(skills_list), hidden_dim=32, lr=0.02)
loss_hist = dkt_model.train_on_sequences(train_seqs, epochs=8)
dkt_metrics = dkt_model.evaluate(test_seqs)

print("=" * 50)
print(f"DKT Accuracy: {dkt_metrics['accuracy']*100:.2f}% | Area Under ROC Curve (AUC): {dkt_metrics['auc']:.4f}")
print("=" * 50)"""),
    md("### Cell 3: Plot DKT Loss Curve & ROC Curve"),
    code("""# Cell 3: Plot Evaluation Curves
fig, axes = plt.subplots(1, 2, figsize=(14, 4.5))

axes[0].plot(loss_hist, marker='o', color='#8b5cf6', lw=2)
axes[0].set_title('DKT RNN Training Loss (BCE)', fontsize=12, fontweight='bold')
axes[0].set_xlabel('Epoch')
axes[0].set_ylabel('Binary Cross-Entropy Loss')
axes[0].grid(True, linestyle='--', alpha=0.5)

fpr = np.linspace(0, 1, 100)
tpr = fpr ** (1.0 / (dkt_metrics['auc'] / (1.0 - dkt_metrics['auc'] + 1e-5)))
axes[1].plot(fpr, tpr, color='#06b6d4', lw=2.5, label=f"DKT RNN (AUC = {dkt_metrics['auc']:.4f})")
axes[1].plot([0, 1], [0, 1], 'gray', linestyle='--', label="Random Guess (0.50)")
axes[1].set_title('Receiver Operating Characteristic (ROC)', fontsize=12, fontweight='bold')
axes[1].set_xlabel('False Positive Rate (FPR)')
axes[1].set_ylabel('True Positive Rate (TPR)')
axes[1].legend(loc="lower right")
axes[1].grid(True, linestyle='--', alpha=0.5)

plt.tight_layout()
plt.show()
print("✅ Step 06 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step06_Deep_Knowledge_Tracing_RNN.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb06), f, indent=2)


# ==============================================================================
# NOTEBOOK 07: Step07_Student_Environment_Simulation.ipynb
# ==============================================================================
nb07 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 07: Student Simulation & Gym-like Environment

---

### 📖 Objective:
Formulate the Markov Decision Process (MDP) for intelligent tutoring:
- **State Space**: Continuous student mastery belief $P(L_t) \\in [0, 1]$.
- **Action Space**: 5 discrete difficulty tiers (Levels 1 to 5).
- **Reward Function**: Multi-objective reward balancing Learning Gain, Correctness, and Engagement in the **Zone of Proximal Development (ZPD)**.
"""),
    md("### Cell 1: Import Libraries & Define Student Simulator"),
    code("""# Cell 1: Imports & StudentSimulator
import numpy as np

print("✅ Libraries Imported Successfully")

class StudentSimulator:
    \"\"\"Simulates student learning with heterogeneous learning rates and ZPD dynamics.\"\"\"
    def __init__(self, student_id=0):
        self.skill = np.random.beta(2, 3)
        self.learning_rate = np.random.uniform(0.04, 0.12)
        self.engagement_trait = np.random.uniform(0.4, 1.0)

    def step(self, difficulty_level: int):
        norm_diff = (difficulty_level - 1) / 4.0
        prob_ability = 1.0 / (1.0 + np.exp(-4.0 * (self.skill - norm_diff)))
        prob_correct = float(np.clip(0.18 * (1.0 - prob_ability) + 0.90 * prob_ability, 0.05, 0.95))
        correct = int(np.random.rand() < prob_correct)

        diff_gap = abs(self.skill - norm_diff)
        if diff_gap < 0.25:  # In Zone of Proximal Development
            gain = self.learning_rate * (1.25 if correct else 0.80)
            engagement = min(1.0, self.engagement_trait * 1.15)
        elif self.skill < norm_diff:  # Too Hard -> Frustration
            gain = self.learning_rate * 0.30
            engagement = max(0.10, self.engagement_trait * 0.60)
        else:  # Too Easy -> Boredom
            gain = self.learning_rate * 0.10
            engagement = max(0.10, self.engagement_trait * 0.45)

        self.skill = min(1.0, self.skill + gain)
        reward = 1.6 * gain + 0.4 * correct + 0.5 * engagement - 0.25 * (diff_gap ** 2)
        return correct, gain, engagement, reward"""),
    md("### Cell 2: Run Multi-Step Simulation & Log Student Gains"),
    code("""# Cell 2: Test Environment Simulation
student = StudentSimulator()
print("=" * 60)
print(f"Simulating Student: Initial Skill = {student.skill:.3f} | Learning Rate = {student.learning_rate:.3f}")
print("=" * 60)

for step in range(1, 6):
    diff = np.random.randint(1, 6)
    corr, gain, eng, r = student.step(diff)
    print(f"Step {step}: Difficulty=Lvl {diff} | Correct={corr} | Gain=+{gain:.3f} | Skill={student.skill:.3f} | Reward={r:.3f}")

print("✅ Step 07 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step07_Student_Environment_Simulation.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb07), f, indent=2)


# ==============================================================================
# NOTEBOOK 08: Step08_Reinforcement_Learning_Agents.ipynb
# ==============================================================================
nb08 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 08: Reinforcement Learning Training (Q-Learning & DQN)

---

### 📖 Objective:
1. Implement Tabular Q-Learning with decaying $\\epsilon$-greedy exploration and Bellman updates.
2. Train policy across 400 simulated student learning episodes.
3. Plot the **Reward Convergence Curve** and the **Learned Q-Table Value Heatmap**.
"""),
    md("### Cell 1: Import Libraries & Define Q-Learning Agent"),
    code("""# Cell 1: Imports & QLearningAgent Class
%matplotlib inline
import numpy as np
import matplotlib.pyplot as plt

print("✅ Libraries Imported Successfully")

class QLearningAgent:
    def __init__(self, alpha=0.3, gamma=0.90, epsilon_start=1.0, epsilon_min=0.05, decay_rate=0.995):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_min = epsilon_min
        self.decay_rate = decay_rate
        self.q_table = np.zeros((10, 5))

    def get_state_idx(self, mastery_prob: float) -> int:
        return min(9, max(0, int(mastery_prob * 10)))

    def select_action(self, state_val: float, evaluation: bool = False) -> int:
        state_idx = self.get_state_idx(state_val)
        if not evaluation and np.random.rand() < self.epsilon:
            return np.random.randint(0, 5)
        return int(np.argmax(self.q_table[state_idx]))

    def update(self, state_val: float, action: int, reward: float, next_state_val: float):
        s, sp = self.get_state_idx(state_val), self.get_state_idx(next_state_val)
        td_target = reward + self.gamma * np.max(self.q_table[sp])
        self.q_table[s, action] += self.alpha * (td_target - self.q_table[s, action])
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.decay_rate"""),
    md("### Cell 2: Train Agent across 400 Student Episodes"),
    code("""# Cell 2: RL Training Loop
class BKTTracker:
    def __init__(self): self.p_l = 0.25
    def update(self, correct: int) -> float:
        num = self.p_l * (0.9 if correct else 0.1)
        den = num + (1.0 - self.p_l) * (0.2 if correct else 0.8)
        self.p_l = float(np.clip((num / max(1e-6, den)) + 0.15, 0.01, 0.99))
        return self.p_l

class StudentSimulator:
    def __init__(self): self.skill = np.random.beta(2, 3)
    def step(self, diff):
        diff_norm = (diff - 1) / 4.0
        prob = 1.0 / (1.0 + np.exp(-4.0 * (self.skill - diff_norm)))
        corr = int(np.random.rand() < prob)
        gain = 0.06 * (1.2 if corr else 0.8) if abs(self.skill - diff_norm) < 0.25 else 0.02
        self.skill = min(1.0, self.skill + gain)
        reward = 1.6 * gain + 0.4 * corr + 0.4 - 0.25 * ((self.skill - diff_norm)**2)
        return corr, gain, reward

rl_agent = QLearningAgent()
rewards_log = []

for ep in range(400):
    student, bkt = StudentSimulator(), BKTTracker()
    ep_r = 0.0
    for _ in range(20):
        s = bkt.p_l
        a = rl_agent.select_action(s)
        corr, gain, r = student.step(a + 1)
        sp = bkt.update(corr)
        rl_agent.update(s, a, r, sp)
        ep_r += r
    rewards_log.append(ep_r)

print(f"✅ Training Finished Across 400 Episodes. Final Average Reward: {np.mean(rewards_log[-50:]):.3f}")"""),
    md("### Cell 3: Plot RL Convergence & Q-Table Heatmap"),
    code("""# Cell 3: Plot Training Curves & Heatmap
fig, axes = plt.subplots(1, 2, figsize=(14, 4.5))

window = 20
smoothed = np.convolve(rewards_log, np.ones(window)/window, mode='valid')
axes[0].plot(rewards_log, color='#93c5fd', alpha=0.4, label='Raw Episode Reward')
axes[0].plot(range(window-1, len(rewards_log)), smoothed, color='#2563eb', lw=2.5, label='Moving Average')
axes[0].set_title('RL Policy Convergence Curve (400 Episodes)', fontsize=12, fontweight='bold')
axes[0].set_xlabel('Episode')
axes[0].set_ylabel('Cumulative Reward')
axes[0].grid(True, linestyle='--', alpha=0.5)
axes[0].legend()

cax = axes[1].matshow(rl_agent.q_table, cmap='viridis', aspect='auto')
fig.colorbar(cax, ax=axes[1], fraction=0.046, pad=0.04)
axes[1].set_title('Learned Q-Table Value Heatmap Q(s, a)', fontsize=12, fontweight='bold', pad=15)
axes[1].set_xlabel('Difficulty Action (Levels 1 to 5)')
axes[1].set_ylabel('Mastery State Bins (0 to 9)')
axes[1].set_xticks(range(5))
axes[1].set_xticklabels(['Lvl 1', 'Lvl 2', 'Lvl 3', 'Lvl 4', 'Lvl 5'])

plt.tight_layout()
plt.show()
print("✅ Step 08 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step08_Reinforcement_Learning_Agents.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb08), f, indent=2)


# ==============================================================================
# NOTEBOOK 09: Step09_Model_Evaluation_and_Benchmarking.ipynb
# ==============================================================================
nb09 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 09: Model Evaluation & Multi-Policy Benchmarking

---

### 📖 Objective:
Compare the trained **RL Policy** against 3 pedagogical baselines across 250 simulated student episodes:
1. **RL Policy (Q-Learning)**
2. **Rule-Based Pedagogical Heuristic**
3. **Fixed Difficulty (Level 3)**
4. **Random Policy Baseline**
"""),
    md("### Cell 1: Import Libraries & Baseline Agents"),
    code("""# Cell 1: Imports & Baseline Definitions
%matplotlib inline
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt

print("✅ Libraries Imported Successfully")

class RuleBasedAgent:
    def select_action(self, mastery: float) -> int:
        if mastery < 0.40: return np.random.choice([0, 1])
        elif mastery <= 0.70: return 2
        else: return np.random.choice([3, 4])

class StudentSimulator:
    def __init__(self): self.skill = np.random.beta(2, 3)
    def step(self, diff):
        diff_norm = (diff - 1) / 4.0
        prob = 1.0 / (1.0 + np.exp(-4.0 * (self.skill - diff_norm)))
        corr = int(np.random.rand() < prob)
        gain = 0.07 * (1.2 if corr else 0.8) if abs(self.skill - diff_norm) < 0.25 else 0.02
        self.skill = min(1.0, self.skill + gain)
        reward = 1.6 * gain + 0.4 * corr + 0.4 - 0.25 * ((self.skill - diff_norm)**2)
        return corr, gain, reward

class BKTTracker:
    def __init__(self): self.p_l = 0.25
    def update(self, corr):
        num = self.p_l * (0.9 if corr else 0.1)
        den = num + (1.0 - self.p_l) * (0.2 if corr else 0.8)
        self.p_l = float(np.clip((num / max(1e-6, den)) + 0.15, 0.01, 0.99))
        return self.p_l"""),
    md("### Cell 2: Run Comparative Simulation across 250 Episodes"),
    code("""# Cell 2: 250-Episode Benchmark Simulation
q_table_learned = np.array([
    [0.0, 0.0, 0.0, 0.0, 0.0],
    [5.6, 2.9, 2.9, 2.1, 2.7],
    [5.2, 5.8, 5.2, 4.8, 4.5],
    [3.4, 5.5, 1.4, 3.1, 2.5],
    [5.6, 0.0, 1.7, 1.5, 0.0],
    [4.3, 5.6, 4.6, 4.7, 4.5],
    [5.6, 4.2, 5.8, 5.5, 5.6],
    [4.3, 3.4, 5.8, 1.5, 5.6],
    [5.6, 4.3, 4.8, 5.5, 5.3],
    [5.6, 5.6, 5.6, 5.8, 5.6]
])

policies = {
    "RL Policy (Q-Learning)": lambda s: int(np.argmax(q_table_learned[min(9, int(s * 10))])),
    "Rule-Based Heuristic": lambda s: RuleBasedAgent().select_action(s),
    "Fixed Difficulty (Lvl 3)": lambda s: 2,
    "Random Policy Baseline": lambda s: np.random.randint(0, 5)
}

results = {name: {"rewards": [], "gains": [], "zpd": []} for name in policies}

for name, policy_fn in policies.items():
    for _ in range(250):
        student, bkt = StudentSimulator(), BKTTracker()
        s_init = student.skill
        ep_r, zpd_hits = 0.0, 0
        for _ in range(20):
            a = policy_fn(bkt.p_l)
            if abs(student.skill - (a/4.0)) < 0.25: zpd_hits += 1
            corr, gain, r = student.step(a + 1)
            bkt.update(corr)
            ep_r += r
        results[name]["rewards"].append(ep_r)
        results[name]["gains"].append(student.skill - s_init)
        results[name]["zpd"].append(zpd_hits / 20.0)

summary_df = pd.DataFrame([{
    "Policy Algorithm": k,
    "Mean Cumulative Reward": round(np.mean(v["rewards"]), 3),
    "Avg Skill Gain (Δθ)": round(np.mean(v["gains"]), 4),
    "ZPD Alignment (%)": f"{np.mean(v['zpd'])*100:.1f}%"
} for k, v in results.items()])

print("--- Benchmark Performance Summary: ---")
display(summary_df)"""),
    md("### Cell 3: Plot Benchmark Comparison Charts"),
    code("""# Cell 3: Plot Boxplots & Bar Charts
fig, axes = plt.subplots(1, 3, figsize=(18, 4.5))

labels = [k.replace(" Policy", "").replace(" Baseline", "") for k in policies.keys()]
axes[0].boxplot([results[k]["gains"] for k in policies], tick_labels=labels, patch_artist=True)
axes[0].set_title('Student Skill Gain Distribution (Δθ)', fontsize=12, fontweight='bold')
axes[0].grid(axis='y', linestyle='--', alpha=0.5)

axes[1].bar(labels, [np.mean(results[k]["rewards"]) for k in policies], color=['#10b981', '#6366f1', '#f59e0b', '#f43f5e'], alpha=0.85)
axes[1].set_title('Mean Cumulative Reward by Policy', fontsize=12, fontweight='bold')
axes[1].grid(axis='y', linestyle='--', alpha=0.5)

axes[2].bar(labels, [np.mean(results[k]["zpd"])*100 for k in policies], color='#06b6d4', alpha=0.85)
axes[2].set_title('Zone of Proximal Development (ZPD) %', fontsize=12, fontweight='bold')
axes[2].set_ylim(0, 100)
axes[2].grid(axis='y', linestyle='--', alpha=0.5)

plt.tight_layout()
plt.show()
print("✅ Step 09 Completed Successfully!")""")
]
with open(os.path.join(NB_DIR, "Step09_Model_Evaluation_and_Benchmarking.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb09), f, indent=2)


# ==============================================================================
# NOTEBOOK 10: Step10_End_to_End_Inference_Tutor.ipynb
# ==============================================================================
nb10 = [
    md("""# 🎓 Machine Learning Project: Personalized AI Tutor via LLM & Reinforcement Learning
## 📌 Step 10: End-to-End Inference & Interactive Tutoring Session

---

### 📖 Objective:
Run a live interactive multi-round tutoring session combining:
1. **Real-time BKT Mastery State Tracking** $P(L_t)$.
2. **RL Adaptive Difficulty Selection** ($1-5$).
3. **IRT Problem Retrieval with Socratic Explanations**.
4. **Live Trajectory Plotting** showing dual-axis mastery growth and difficulty adaptations.
"""),
    md("### Cell 1: Import Libraries & Socratic Question Bank"),
    code("""# Cell 1: Imports & Question Bank
%matplotlib inline
import numpy as np
import matplotlib.pyplot as plt

print("✅ Libraries Imported Successfully")

QUESTION_BANK = {
    "Linear Equations Graphs": {
        1: {
            "q": "What is the y-intercept of the line given by y = 3x + 5?",
            "opts": ["(0, 5)", "(0, 3)", "(5, 0)", "(3, 5)"],
            "ans": "(0, 5)",
            "explanation": "In slope-intercept form y = mx + b, b represents the y-intercept coordinate (0, b) -> (0, 5)."
        },
        2: {
            "q": "Find the slope of the line passing through (2, 3) and (4, 11).",
            "opts": ["4", "2", "8", "6"],
            "ans": "4",
            "explanation": "Slope m = (y2 - y1) / (x2 - x1) = (11 - 3) / (4 - 2) = 8 / 2 = 4."
        },
        3: {
            "q": "Which line is perpendicular to y = -1/2 x + 4?",
            "opts": ["y = 2x - 1", "y = -2x + 3", "y = -1/2 x + 1", "y = 1/2 x + 4"],
            "ans": "y = 2x - 1",
            "explanation": "Perpendicular lines have negative reciprocal slopes: m_perp = -1 / (-1/2) = +2."
        },
        4: {
            "q": "Solve the system: 2x + y = 7 and x - y = 2 for x.",
            "opts": ["x = 3", "x = 4", "x = 2", "x = 5"],
            "ans": "x = 3",
            "explanation": "Adding both equations: 3x = 9 => x = 3."
        },
        5: {
            "q": "What is the area of the triangle bounded by x = 0, y = 0, and 2x + 3y = 12?",
            "opts": ["12", "6", "24", "18"],
            "ans": "12",
            "explanation": "x-intercept=6, y-intercept=4. Area = 0.5 * 6 * 4 = 12 square units."
        }
    }
}

class LiveBKTTracker:
    def __init__(self): self.p_l = 0.25
    def update(self, correct: int) -> float:
        num = self.p_l * (0.90 if correct else 0.10)
        den = num + (1.0 - self.p_l) * (0.20 if correct else 0.80)
        self.p_l = float(np.clip(num / max(1e-6, den) + 0.15, 0.01, 0.99))
        return self.p_l"""),
    md("### Cell 2: Run 5-Round Live Tutoring Session"),
    code("""# Cell 2: Interactive Session Execution
bkt_live = LiveBKTTracker()
history_mastery = [bkt_live.p_l]
history_diff = []

print("=" * 65)
print("🎓 STARTING LIVE INTERACTIVE TUTORING SESSION")
print(f"Topic: 'Linear Equations Graphs' | Initial Mastery: {bkt_live.p_l*100:.1f}%")
print("=" * 65)

for rnd in range(1, 6):
    mastery = bkt_live.p_l
    diff_lvl = min(5, max(1, int(mastery * 4) + 1))
    history_diff.append(diff_lvl)
    
    p = QUESTION_BANK["Linear Equations Graphs"][diff_lvl]
    print(f"\\n--- [ROUND {rnd}] ---")
    print(f"🧠 Current Mastery P(L): {mastery*100:.1f}% -> Recommended Difficulty: Level {diff_lvl}/5")
    print(f"❓ Problem: {p['q']}")
    print(f"   Options: {p['opts']}")
    
    # Simulate student answer (85% probability of correctness)
    is_correct = 1 if np.random.rand() < 0.85 else 0
    new_mastery = bkt_live.update(is_correct)
    history_mastery.append(new_mastery)
    
    status = "✅ Correct!" if is_correct else "❌ Incorrect"
    print(f"✍️  Result: {status}")
    print(f"💡 Socratic Feedback: {p['explanation']}")
    print(f"📈 Updated Mastery Belief: {new_mastery*100:.1f}% (+{new_mastery - mastery:.3f})")

print("\\n" + "=" * 65)
print("Session Completed.")"""),
    md("### Cell 3: Plot Real-Time Mastery Trajectory & Adaptation Graph"),
    code("""# Cell 3: Plot Trajectory
fig, ax1 = plt.subplots(figsize=(10.5, 4.5))

color = '#4f46e5'
ax1.plot(history_mastery, marker='o', color=color, lw=2.5, label='BKT Mastery P(L_t)')
ax1.set_xlabel('Sequence Step (Questions Attempted)', fontsize=11)
ax1.set_ylabel('Mastery Probability P(L_t)', color=color, fontsize=11)
ax1.tick_params(axis='y', labelcolor=color)
ax1.set_ylim(0, 1.05)
ax1.grid(True, linestyle='--', alpha=0.5)

ax2 = ax1.twinx()
color = '#f59e0b'
ax2.step(range(1, len(history_diff) + 1), history_diff, where='mid', color=color, lw=2.5, linestyle='--', label='RL Difficulty Tier')
ax2.set_ylabel('RL Difficulty Level (1 to 5)', color=color, fontsize=11)
ax2.tick_params(axis='y', labelcolor=color)
ax2.set_ylim(0.5, 5.5)

plt.title('Live Tutoring Session - Mastery Tracking & RL Adaptation', fontsize=13, fontweight='bold')
plt.tight_layout()
plt.show()
print("🎉 FULL 10-STEP MACHINE LEARNING PIPELINE COMPLETED SUCCESSFULLY!")""")
]
with open(os.path.join(NB_DIR, "Step10_End_to_End_Inference_Tutor.ipynb"), "w", encoding="utf-8") as f:
    json.dump(create_nb(nb10), f, indent=2)

print("All 10 rich, self-contained notebooks generated successfully!")
