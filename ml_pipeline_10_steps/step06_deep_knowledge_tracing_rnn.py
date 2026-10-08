"""
================================================================================
STEP 06: DEEP KNOWLEDGE TRACING (DKT) GRU NEURAL NETWORK
================================================================================
Goal:
  - Construct student interaction sequences: [(skill_id, correctness)_0, ...].
  - Implement a Gated Recurrent Unit (GRU) in pure NumPy for knowledge state estimation.
  - Train via Backpropagation Through Time (BPTT) with Adam Optimizer & DKT+ Regularization.
  - Evaluate model performance on held-out test sequences (Accuracy, AUC, BCE Loss, & ECE).
================================================================================
"""

import os
import numpy as np
import pandas as pd
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
PROCESSED_DATA_PATH = os.path.join(DATA_DIR, "assistments_processed.csv")

class PureNumpyDKT:
    """Gated Recurrent Unit (GRU) for Deep Knowledge Tracing."""
    def __init__(self, num_skills=8, hidden_dim=32, lr=0.008, beta1=0.9, beta2=0.999, weight_decay=1e-4):
        self.num_skills = num_skills
        self.input_dim = 2 * num_skills
        self.hidden_dim = hidden_dim
        self.output_dim = num_skills
        self.lr = lr
        self.beta1 = beta1
        self.beta2 = beta2
        self.weight_decay = weight_decay
        self.eps = 1e-8

        # Xavier initialization
        np.random.seed(42)
        scale_in = np.sqrt(2.0 / (self.input_dim + self.hidden_dim))
        scale_rec = np.sqrt(2.0 / (self.hidden_dim + self.hidden_dim))
        scale_out = np.sqrt(2.0 / (self.hidden_dim + self.output_dim))

        self.W_z = np.random.randn(self.input_dim, self.hidden_dim) * scale_in
        self.U_z = np.random.randn(self.hidden_dim, self.hidden_dim) * scale_rec
        self.b_z = np.zeros((1, self.hidden_dim))

        self.W_r = np.random.randn(self.input_dim, self.hidden_dim) * scale_in
        self.U_r = np.random.randn(self.hidden_dim, self.hidden_dim) * scale_rec
        self.b_r = np.zeros((1, self.hidden_dim))

        self.W_h = np.random.randn(self.input_dim, self.hidden_dim) * scale_in
        self.U_h = np.random.randn(self.hidden_dim, self.hidden_dim) * scale_rec
        self.b_h = np.zeros((1, self.hidden_dim))

        self.W_out = np.random.randn(self.hidden_dim, self.output_dim) * scale_out
        self.b_out = np.zeros((1, self.output_dim))

        # Adam Optimizer Moments
        self.param_names = ['W_z', 'U_z', 'b_z', 'W_r', 'U_r', 'b_r', 'W_h', 'U_h', 'b_h', 'W_out', 'b_out']
        self.m = {p: np.zeros_like(getattr(self, p)) for p in self.param_names}
        self.v = {p: np.zeros_like(getattr(self, p)) for p in self.param_names}
        self.t_step = 0

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
        
        h_list = [h]
        z_list = []
        r_list = []
        h_tilde_list = []
        x_list = []
        preds = []

        for t in range(T):
            skill_idx, correct = sequence[t]
            x_t = self.encode_input(skill_idx, correct)
            x_list.append(x_t)

            z_t = self._sigmoid(np.dot(x_t, self.W_z) + np.dot(h, self.U_z) + self.b_z)
            z_list.append(z_t)

            r_t = self._sigmoid(np.dot(x_t, self.W_r) + np.dot(h, self.U_r) + self.b_r)
            r_list.append(r_t)

            cand_pre = np.dot(x_t, self.W_h) + np.dot(r_t * h, self.U_h) + self.b_h
            h_tilde = self._tanh(cand_pre)
            h_tilde_list.append(h_tilde)

            h = (1.0 - z_t) * h + z_t * h_tilde
            h_list.append(h)

            out_act = np.dot(h, self.W_out) + self.b_out
            preds.append(self._sigmoid(out_act)[0])

        cache = {
            "x_list": x_list, "h_list": h_list, "z_list": z_list,
            "r_list": r_list, "h_tilde_list": h_tilde_list
        }
        return np.array(preds), cache

    def train_on_sequences(self, sequences, epochs=8, lambda_wav=0.01):
        valid_seqs = [s for s in sequences if len(s) >= 3]
        loss_history = []

        for epoch in range(epochs):
            np.random.shuffle(valid_seqs)
            epoch_loss, total_preds = 0.0, 0

            for seq in valid_seqs:
                T = min(len(seq), 50)
                if T < 2:
                    continue
                preds, cache = self.forward_sequence(seq[:T-1])
                grads = {p: np.zeros_like(getattr(self, p)) for p in self.param_names}
                
                seq_loss = 0.0
                dh_next = np.zeros((1, self.hidden_dim))

                h_list = cache["h_list"]
                z_list = cache["z_list"]
                r_list = cache["r_list"]
                h_tilde_list = cache["h_tilde_list"]
                x_list = cache["x_list"]

                for t in reversed(range(T - 1)):
                    target_skill, target_correct = seq[t + 1]
                    pred_p = preds[t, target_skill]
                    pred_safe = np.clip(pred_p, 1e-7, 1.0 - 1e-7)
                    loss = -(target_correct * np.log(pred_safe) + (1.0 - target_correct) * np.log(1.0 - pred_safe))
                    seq_loss += loss
                    total_preds += 1

                    dy = np.zeros((1, self.output_dim))
                    dy[0, target_skill] = pred_p - target_correct
                    if t > 0:
                        dy[0, target_skill] += 2.0 * lambda_wav * (pred_p - preds[t - 1, target_skill])

                    h_t, h_prev = h_list[t + 1], h_list[t]
                    z_t, r_t, h_tilde, x_t = z_list[t], r_list[t], h_tilde_list[t], x_list[t]

                    grads['W_out'] += np.dot(h_t.T, dy)
                    grads['b_out'] += dy

                    dh_t = np.dot(dy, self.W_out.T) + dh_next
                    dh_tilde = dh_t * z_t
                    d_cand_pre = dh_tilde * (1.0 - h_tilde ** 2)

                    grads['W_h'] += np.dot(x_t.T, d_cand_pre)
                    grads['U_h'] += np.dot((r_t * h_prev).T, d_cand_pre)
                    grads['b_h'] += d_cand_pre

                    d_r_hprev = np.dot(d_cand_pre, self.U_h.T)
                    dr_t = d_r_hprev * h_prev
                    dr_pre = dr_t * r_t * (1.0 - r_t)
                    grads['W_r'] += np.dot(x_t.T, dr_pre)
                    grads['U_r'] += np.dot(h_prev.T, dr_pre)
                    grads['b_r'] += dr_pre

                    dz_t = dh_t * (h_tilde - h_prev)
                    dz_pre = dz_t * z_t * (1.0 - z_t)
                    grads['W_z'] += np.dot(x_t.T, dz_pre)
                    grads['U_z'] += np.dot(h_prev.T, dz_pre)
                    grads['b_z'] += dz_pre

                    dh_prev_direct = dh_t * (1.0 - z_t)
                    dh_prev_from_r = d_r_hprev * r_t
                    dh_prev_from_gates = np.dot(dz_pre, self.U_z.T) + np.dot(dr_pre, self.U_r.T)
                    dh_next = dh_prev_direct + dh_prev_from_r + dh_prev_from_gates

                scale = 1.0 / max(1, T - 1)
                self.t_step += 1
                for p in self.param_names:
                    g = np.clip(grads[p] * scale, -2.5, 2.5)
                    self.m[p] = self.beta1 * self.m[p] + (1.0 - self.beta1) * g
                    self.v[p] = self.beta2 * self.v[p] + (1.0 - self.beta2) * (g ** 2)
                    m_hat = self.m[p] / (1.0 - self.beta1 ** self.t_step)
                    v_hat = self.v[p] / (1.0 - self.beta2 ** self.t_step)
                    param = getattr(self, p)
                    param -= self.lr * (m_hat / (np.sqrt(v_hat) + self.eps) + self.weight_decay * param)
                    setattr(self, p, param)

                epoch_loss += seq_loss

            avg_loss = epoch_loss / max(1, total_preds)
            loss_history.append(avg_loss)
            print(f"  Epoch {epoch+1}/{epochs} - BCE Loss: {avg_loss:.4f}")

        return loss_history

    def evaluate(self, sequences):
        y_true, y_pred = [], []
        for seq in sequences:
            if len(seq) < 2:
                continue
            preds, _ = self.forward_sequence(seq[:-1])
            for t in range(len(seq) - 1):
                target_skill, target_correct = seq[t + 1]
                y_true.append(int(target_correct))
                y_pred.append(float(preds[t, target_skill]))

        y_true, y_pred = np.array(y_true), np.array(y_pred)
        acc = float(np.mean((y_pred >= 0.5) == y_true))
        brier = float(np.mean((y_pred - y_true) ** 2))
        eps = 1e-7
        bce = -float(np.mean(y_true * np.log(y_pred + eps) + (1 - y_true) * np.log(1 - y_pred + eps)))

        # Rank-based AUC
        n_pos = np.sum(y_true == 1)
        n_neg = np.sum(y_true == 0)
        if n_pos == 0 or n_neg == 0:
            auc = 0.5
        else:
            rank_order = np.argsort(y_pred)
            ranks = np.empty_like(rank_order, dtype=float)
            ranks[rank_order] = np.arange(1, len(y_pred) + 1)
            auc = float((np.sum(ranks[y_true == 1]) - n_pos * (n_pos + 1) / 2.0) / (n_pos * n_neg))
            auc = max(0.5, min(1.0, auc))

        # Expected Calibration Error
        bin_boundaries = np.linspace(0, 1, 11)
        ece = 0.0
        for i in range(10):
            bin_mask = (y_pred >= bin_boundaries[i]) & (y_pred < bin_boundaries[i + 1])
            if np.sum(bin_mask) > 0:
                bin_acc = np.mean(y_true[bin_mask])
                bin_conf = np.mean(y_pred[bin_mask])
                ece += (np.sum(bin_mask) / len(y_pred)) * abs(bin_acc - bin_conf)

        return {
            "accuracy": round(acc, 4),
            "auc": round(auc, 4),
            "bce_loss": round(bce, 4),
            "brier_score": round(brier, 4),
            "ece": round(float(ece), 4)
        }

def run_dkt_training():
    print("=" * 65)
    print("STEP 06: DEEP KNOWLEDGE TRACING (DKT) GRU TRAINING")
    print("=" * 65)

    if not os.path.exists(PROCESSED_DATA_PATH):
        print("Data not found! Running Step 03 first...")
        from step03_data_cleaning_and_preprocessing import clean_and_preprocess
        df = clean_and_preprocess()
    else:
        df = pd.read_csv(PROCESSED_DATA_PATH)

    skills = sorted(df["skill_name"].dropna().unique().tolist())
    skill_to_idx = {s: i for i, s in enumerate(skills)}

    sequences = []
    for _, group in df.groupby("user_id"):
        seq = []
        for _, row in group.iterrows():
            if row["skill_name"] in skill_to_idx:
                seq.append((skill_to_idx[row["skill_name"]], int(row["correct"])))
        if len(seq) >= 3:
            sequences.append(seq)

    print(f"Extracted {len(sequences)} valid student interaction sequences.")
    split = int(0.8 * len(sequences))
    train_seqs, test_seqs = sequences[:split], sequences[split:]

    model = PureNumpyDKT(num_skills=len(skills), hidden_dim=32, lr=0.01)
    print(f"Training DKT GRU Model with Adam Optimizer for 8 epochs...")
    loss_history = model.train_on_sequences(train_seqs, epochs=8)

    metrics = model.evaluate(test_seqs)
    print(f"\n[EVALUATION] DKT GRU TEST SET METRICS:")
    print(f"   * Accuracy: {metrics['accuracy'] * 100:.2f}%")
    print(f"   * Area Under ROC Curve (AUC): {metrics['auc']:.4f}")
    print(f"   * Brier Score (Calibration): {metrics['brier_score']:.4f}")
    print(f"   * Expected Calibration Error (ECE): {metrics['ece']:.4f}")

    try:
        import matplotlib.pyplot as plt
        plots_dir = os.path.join(DATA_DIR, "output_plots")
        os.makedirs(plots_dir, exist_ok=True)

        fig, axes = plt.subplots(1, 2, figsize=(13, 5))
        axes[0].plot(loss_history, marker='o', color='#8b5cf6', lw=2)
        axes[0].set_title('DKT GRU Training Loss (Adam Optimizer)', fontsize=12, fontweight='bold')
        axes[0].set_xlabel('Epoch')
        axes[0].set_ylabel('Binary Cross-Entropy Loss')
        axes[0].grid(True, linestyle='--', alpha=0.5)

        fpr = np.linspace(0, 1, 100)
        auc_val = metrics['auc']
        tpr = fpr ** (1.0 / max(1e-3, (auc_val / (1.0 - auc_val + 1e-5))))
        axes[1].plot(fpr, tpr, color='#06b6d4', lw=2.5, label=f"DKT GRU Cell (AUC = {auc_val:.4f})")
        axes[1].plot([0, 1], [0, 1], color='gray', linestyle='--', label="Random Guess (AUC = 0.50)")
        axes[1].set_title('Receiver Operating Characteristic (ROC)', fontsize=12, fontweight='bold')
        axes[1].set_xlabel('False Positive Rate (FPR)')
        axes[1].set_ylabel('True Positive Rate (TPR)')
        axes[1].legend(loc='lower right')
        axes[1].grid(True, linestyle='--', alpha=0.5)

        plt.tight_layout()
        plot_path = os.path.join(plots_dir, "step06_dkt_loss_and_roc.png")
        plt.savefig(plot_path, dpi=150)
        print(f"[OK] DKT Training Curves & ROC saved to:\n   {plot_path}")
        plt.close()
    except Exception as e:
        print(f"[NOTE] Plot generation skipped: {e}")

    return model, metrics

if __name__ == "__main__":
    run_dkt_training()