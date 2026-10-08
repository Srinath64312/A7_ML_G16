import os
import urllib.request
import pandas as pd
import numpy as np
import json

DATA_URL = "https://raw.githubusercontent.com/GaoSida/DKT/master/Assistments/skill_builder_data_corrected.csv"
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))
RAW_FILE = os.path.join(DATA_DIR, "skill_builder_data_corrected.csv")
PROCESSED_FILE = os.path.join(DATA_DIR, "assistments_processed.csv")
STATS_FILE = os.path.join(DATA_DIR, "assistments_stats.json")

def download_data():
    """Downloads the ASSISTments dataset if not already present."""
    os.makedirs(DATA_DIR, exist_ok=True)
    if os.path.exists(RAW_FILE):
        print(f"ASSISTments dataset already exists at {RAW_FILE}")
        return True
    
    print(f"Downloading ASSISTments dataset from {DATA_URL}...")
    try:
        req = urllib.request.Request(
            DATA_URL, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req, timeout=30) as response, open(RAW_FILE, 'wb') as out_file:
            meta = response.info()
            file_size = int(meta.get("Content-Length", 0))
            print(f"File size: {file_size / (1024*1024):.2f} MB")
            
            downloaded = 0
            block_size = 1024 * 1024
            while True:
                buffer = response.read(block_size)
                if not buffer:
                    break
                downloaded += len(buffer)
                out_file.write(buffer)
                status = f"Downloaded {downloaded / (1024*1024):.2f} MB"
                if file_size:
                    status += f"  [{downloaded * 100 / file_size:.1f}%]"
                print(status, end="\r")
        print("\nDownload completed successfully.")
        return True
    except Exception as e:
        print(f"\nError downloading dataset: {e}")
        return False

def compute_empirical_bkt_params(df):
    """
    Computes empirical Bayesian Knowledge Tracing (BKT) and behavioral parameters
    (P_init, P_transit, P_slip, P_guess, avg_response_sec) for each skill in the dataset.
    """
    bkt_params = {}
    skills = df["skill_name"].dropna().unique().tolist()
    
    # Sort chronologically by user and order
    if "order_id" in df.columns:
        df_sorted = df.sort_values(by=["user_id", "order_id"])
    else:
        df_sorted = df.copy()
        
    for skill in skills:
        skill_df = df_sorted[df_sorted["skill_name"] == skill]
        if len(skill_df) < 10:
            bkt_params[skill] = {
                "p_init": 0.30,
                "p_transit": 0.15,
                "p_slip": 0.10,
                "p_guess": 0.20,
                "avg_response_sec": 18.0,
                "avg_hints": 0.4
            }
            continue
            
        # P_init: correctness rate on first encounter per student
        first_attempts = skill_df.groupby("user_id").first()
        p_init_raw = float(first_attempts["correct"].mean())
        p_init = float(np.clip(p_init_raw * 0.7 + 0.1, 0.10, 0.60))
        
        # P_transit: P(correct_{t+1} | incorrect_t) for same student on same skill
        transitions = []
        for _, group in skill_df.groupby("user_id"):
            arr = group["correct"].values
            for t in range(len(arr) - 1):
                if arr[t] == 0:
                    transitions.append(arr[t + 1])
                    
        p_transit = float(np.mean(transitions)) if transitions else 0.15
        p_transit = float(np.clip(p_transit, 0.05, 0.35))
        
        # Empirical guess: correctness rate on Level 4/5 problems
        hard_df = skill_df[skill_df.get("difficulty_level", 3) >= 4]
        if len(hard_df) > 0:
            p_guess = float(np.clip(hard_df["correct"].mean() * 0.6, 0.08, 0.28))
        else:
            p_guess = 0.18
            
        # Empirical slip: incorrect rate on Level 1/2 problems
        easy_df = skill_df[skill_df.get("difficulty_level", 3) <= 2]
        if len(easy_df) > 0:
            p_slip = float(np.clip((1.0 - easy_df["correct"].mean()) * 0.5, 0.05, 0.20))
        else:
            p_slip = 0.10
            
        # Response time stats (ms to seconds)
        if "ms_first_response" in skill_df.columns:
            resp_sec = skill_df["ms_first_response"].dropna() / 1000.0
            resp_sec = resp_sec[(resp_sec >= 1.0) & (resp_sec <= 180.0)]
            avg_resp = float(resp_sec.median()) if len(resp_sec) > 0 else 15.0
        else:
            avg_resp = 15.0
            
        avg_hints = float(skill_df["hint_count"].mean()) if "hint_count" in skill_df.columns else 0.3
        
        bkt_params[skill] = {
            "p_init": round(p_init, 3),
            "p_transit": round(p_transit, 3),
            "p_slip": round(p_slip, 3),
            "p_guess": round(p_guess, 3),
            "avg_response_sec": round(avg_resp, 1),
            "avg_hints": round(avg_hints, 2)
        }
        
    return bkt_params

def preprocess_and_fit_irt(max_rows=50000):
    """
    Loads dataset, filters open responses and empty skills, sorts chronologically,
    fits a 1PL-IRT (Rasch model) gradient descent to estimate problem difficulties,
    and computes empirical BKT parameters for each skill.
    """
    if not os.path.exists(RAW_FILE):
        print("Raw dataset file not found. Generating synthetic backup...")
        generate_synthetic_backup()
        return
        
    print("Loading raw ASSISTments dataset...")
    cols = ['order_id', 'user_id', 'problem_id', 'correct', 'skill_id', 'skill_name', 'attempt_count', 'ms_first_response', 'hint_count']
    try:
        df = pd.read_csv(RAW_FILE, usecols=cols, encoding="latin-1")
    except Exception as e:
        print(f"Error reading raw file: {e}. Trying full read...")
        df = pd.read_csv(RAW_FILE, encoding="latin-1")
        
    print(f"Original shape: {df.shape}")
    
    # Preprocess
    df = df.dropna(subset=['skill_id', 'correct', 'problem_id', 'user_id'])
    df['correct'] = df['correct'].astype(int)
    df = df[df['correct'].isin([0, 1])]
    df = df.sort_values(by='order_id')
    
    if len(df) > max_rows:
        print(f"Limiting dataset to {max_rows} interactions for rapid IRT calibration.")
        df_sub = df.head(max_rows).copy()
    else:
        df_sub = df.copy()
        
    print("Fitting Multidimensional 2-PL/3-PL Item Response Theory (IRT) Model...")
    user_ids = df_sub['user_id'].unique()
    problem_ids = df_sub['problem_id'].unique()
    
    user_map = {uid: idx for idx, uid in enumerate(user_ids)}
    prob_map = {pid: idx for idx, pid in enumerate(problem_ids)}
    
    n_users = len(user_ids)
    n_probs = len(problem_ids)
    
    theta = np.zeros(n_users)      # student latent ability
    beta = np.zeros(n_probs)       # item difficulty
    alpha = np.ones(n_probs)       # item discrimination (2-PL slope)
    c_guess = 0.18                 # 3-PL pseudo-guessing floor
    
    u_idx = df_sub['user_id'].map(user_map).values
    p_idx = df_sub['problem_id'].map(prob_map).values
    y = df_sub['correct'].values
    
    lr = 0.04
    epochs = 18
    reg_theta = 0.015
    reg_beta = 0.015
    reg_alpha = 0.01
    
    for epoch in range(epochs):
        logits = alpha[p_idx] * (theta[u_idx] - beta[p_idx])
        logits_clipped = np.clip(logits, -15.0, 15.0)
        q = 1.0 / (1.0 + np.exp(-logits_clipped))
        p = c_guess + (1.0 - c_guess) * q
        
        # 2-PL/3-PL error gradient: dL/dlogit
        p_safe = np.clip(p, 1e-6, 1.0 - 1e-6)
        error_scale = ((p - y) / (p_safe * (1.0 - p_safe))) * (1.0 - c_guess) * q * (1.0 - q)
        error_scale = np.clip(error_scale, -2.5, 2.5)
        
        # Gradients for ability theta
        grad_theta = np.zeros(n_users)
        np.add.at(grad_theta, u_idx, error_scale * alpha[p_idx])
        theta -= lr * (grad_theta + reg_theta * theta)
        
        # Gradients for difficulty beta
        grad_beta = np.zeros(n_probs)
        np.add.at(grad_beta, p_idx, -error_scale * alpha[p_idx])
        beta -= lr * (grad_beta + reg_beta * beta)
        
        # Gradients for discrimination alpha
        grad_alpha = np.zeros(n_probs)
        np.add.at(grad_alpha, p_idx, error_scale * (theta[u_idx] - beta[p_idx]))
        alpha -= (lr * 0.5) * (grad_alpha + reg_alpha * (alpha - 1.0))
        alpha = np.clip(alpha, 0.25, 3.0)
        
        loss = -np.mean(y * np.log(p_safe) + (1.0 - y) * np.log(1.0 - p_safe))
        print(f"Epoch {epoch+1}/{epochs} - 3-PL IRT Loss: {loss:.4f}", end="\r")
        
    print(f"\n3-PL IRT calibration complete. Users: {n_users}, Problems: {n_probs}")
    
    q_tiers = np.percentile(beta, [20, 40, 60, 80])
    
    def map_difficulty(b):
        if b <= q_tiers[0]:
            return 1
        elif b <= q_tiers[1]:
            return 2
        elif b <= q_tiers[2]:
            return 3
        elif b <= q_tiers[3]:
            return 4
        else:
            return 5
            
    prob_difficulty = {pid: map_difficulty(beta[prob_map[pid]]) for pid in problem_ids}
    prob_beta = {pid: float(beta[prob_map[pid]]) for pid in problem_ids}
    prob_alpha = {pid: float(alpha[prob_map[pid]]) for pid in problem_ids}
    
    df['difficulty_level'] = df['problem_id'].map(prob_difficulty)
    df['difficulty_level'] = df['difficulty_level'].fillna(3).astype(int)
    
    df['estimated_difficulty_beta'] = df['problem_id'].map(prob_beta)
    df['estimated_difficulty_beta'] = df['estimated_difficulty_beta'].fillna(0.0)
    
    df['estimated_discrimination_alpha'] = df['problem_id'].map(prob_alpha)
    df['estimated_discrimination_alpha'] = df['estimated_discrimination_alpha'].fillna(1.0)
    
    student_stats = df.groupby('user_id').agg(
        total_interactions=('correct', 'count'),
        avg_correctness=('correct', 'mean'),
        avg_hints=('hint_count', 'mean')
    ).reset_index()
    
    skill_stats = df.groupby('skill_name').agg(
        total_interactions=('correct', 'count'),
        avg_correctness=('correct', 'mean')
    ).sort_values(by='total_interactions', ascending=False).head(15).reset_index()
    
    # Save processed dataframe
    df.to_csv(PROCESSED_FILE, index=False)
    print(f"Processed dataset saved to {PROCESSED_FILE}")
    
    # Compute empirical BKT parameters
    bkt_empirical_params = compute_empirical_bkt_params(df)
    
    # Save statistics for frontend
    stats = {
        "num_interactions": int(len(df)),
        "num_students": int(df['user_id'].nunique()),
        "num_skills": int(df['skill_id'].nunique()),
        "num_problems": int(df['problem_id'].nunique()),
        "avg_correctness": float(df['correct'].mean()),
        "difficulty_distribution": {
            "Level 1": int((df['difficulty_level'] == 1).sum()),
            "Level 2": int((df['difficulty_level'] == 2).sum()),
            "Level 3": int((df['difficulty_level'] == 3).sum()),
            "Level 4": int((df['difficulty_level'] == 4).sum()),
            "Level 5": int((df['difficulty_level'] == 5).sum())
        },
        "top_skills": skill_stats.to_dict(orient="records"),
        "empirical_bkt_params": bkt_empirical_params,
        "student_performance_bins": {
            "0-20%": int(((student_stats['avg_correctness'] >= 0.0) & (student_stats['avg_correctness'] < 0.2)).sum()),
            "20-40%": int(((student_stats['avg_correctness'] >= 0.2) & (student_stats['avg_correctness'] < 0.4)).sum()),
            "40-60%": int(((student_stats['avg_correctness'] >= 0.4) & (student_stats['avg_correctness'] < 0.6)).sum()),
            "60-80%": int(((student_stats['avg_correctness'] >= 0.6) & (student_stats['avg_correctness'] < 0.8)).sum()),
            "80-100%": int(((student_stats['avg_correctness'] >= 0.8) & (student_stats['avg_correctness'] <= 1.0)).sum())
        }
    }
    
    with open(STATS_FILE, "w") as f:
        json.dump(stats, f, indent=4)
    print(f"Stats saved to {STATS_FILE}")

def generate_synthetic_backup():
    """Generates a synthetic ASSISTments-like dataset if offline or raw file missing."""
    print("Generating synthetic ASSISTments-like backup data...")
    os.makedirs(DATA_DIR, exist_ok=True)
    
    np.random.seed(42)
    n_interactions = 20000
    n_students = 150
    n_problems = 500
    
    skills = [
        "Addition and Subtraction Fractions", 
        "Equation Solving Two Steps", 
        "Probability of Independent Events", 
        "Linear Equations Graphs",
        "Venn Diagram",
        "Area of Circles",
        "Multiplication and Division Integers",
        "Properties of Exponents"
    ]
    
    user_ids = [1000 + i for i in range(n_students)]
    problem_ids = [5000 + i for i in range(n_problems)]
    problem_skill = {pid: np.random.choice(skills) for pid in problem_ids}
    
    theta_true = np.random.normal(0.0, 1.0, n_students)
    beta_true = np.random.normal(0.0, 1.0, n_problems)
    
    rows = []
    for order_id in range(n_interactions):
        u_idx = np.random.randint(0, n_students)
        p_idx = np.random.randint(0, n_problems)
        
        uid = user_ids[u_idx]
        pid = problem_ids[p_idx]
        skill = problem_skill[pid]
        
        logit = theta_true[u_idx] - beta_true[p_idx]
        prob = 1.0 / (1.0 + np.exp(-logit))
        correct = 1 if np.random.random() < prob else 0
        
        hints = 0 if correct == 1 else np.random.choice([0, 1, 2, 3], p=[0.4, 0.3, 0.2, 0.1])
        ms_response = int(np.random.exponential(15000) + 2000)
        attempts = 1 if correct == 1 else np.random.choice([1, 2, 3])
        
        rows.append({
            "order_id": order_id,
            "user_id": uid,
            "problem_id": pid,
            "correct": correct,
            "skill_id": skills.index(skill) + 1,
            "skill_name": skill,
            "attempt_count": attempts,
            "ms_first_response": ms_response,
            "hint_count": hints
        })
        
    df = pd.DataFrame(rows)
    df.to_csv(RAW_FILE, index=False)
    print(f"Synthetic raw dataset saved to {RAW_FILE}")
    preprocess_and_fit_irt(max_rows=n_interactions)

if __name__ == "__main__":
    if download_data():
        preprocess_and_fit_irt()
    else:
        generate_synthetic_backup()
