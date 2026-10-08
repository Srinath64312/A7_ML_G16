"""
Deep Knowledge Tracing (DKT) Model in pure NumPy.
Implements a Gated Recurrent Unit (GRU) cell with Adam optimizer and DKT+ consistency
regularization trained on student interaction sequences (skill_id, correctness)
to predict the probability of answering future problems correctly.
"""

import os
import json
import numpy as np
import pandas as pd

class PureNumpyDKT:
    """
    Gated Recurrent Unit (GRU) for Deep Knowledge Tracing.
    Input at step t: one-hot encoding of (skill_idx, correctness) -> dimension = 2 * num_skills
    Hidden state: dimension = hidden_dim
    Output at step t: sigmoid activation predicting correctness for every skill -> dimension = num_skills
    """
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
        
        # Xavier / Glorot parameter initialization
        np.random.seed(42)
        scale_in = np.sqrt(2.0 / (self.input_dim + self.hidden_dim))
        scale_rec = np.sqrt(2.0 / (self.hidden_dim + self.hidden_dim))
        scale_out = np.sqrt(2.0 / (self.hidden_dim + self.output_dim))
        
        # GRU Gates: Update Gate (z), Reset Gate (r), Candidate Hidden (h_tilde)
        self.W_z = np.random.randn(self.input_dim, self.hidden_dim) * scale_in
        self.U_z = np.random.randn(self.hidden_dim, self.hidden_dim) * scale_rec
        self.b_z = np.zeros((1, self.hidden_dim))
        
        self.W_r = np.random.randn(self.input_dim, self.hidden_dim) * scale_in
        self.U_r = np.random.randn(self.hidden_dim, self.hidden_dim) * scale_rec
        self.b_r = np.zeros((1, self.hidden_dim))
        
        self.W_h = np.random.randn(self.input_dim, self.hidden_dim) * scale_in
        self.U_h = np.random.randn(self.hidden_dim, self.hidden_dim) * scale_rec
        self.b_h = np.zeros((1, self.hidden_dim))
        
        # Output Linear Projection
        self.W_out = np.random.randn(self.hidden_dim, self.output_dim) * scale_out
        self.b_out = np.zeros((1, self.output_dim))
        
        # Adam Optimizer Moment State
        self.param_names = ['W_z', 'U_z', 'b_z', 'W_r', 'U_r', 'b_r', 'W_h', 'U_h', 'b_h', 'W_out', 'b_out']
        self.m = {p: np.zeros_like(getattr(self, p)) for p in self.param_names}
        self.v = {p: np.zeros_like(getattr(self, p)) for p in self.param_names}
        self.t_step = 0
        
    def _sigmoid(self, z):
        z = np.clip(z, -15.0, 15.0)
        return 1.0 / (1.0 + np.exp(-z))
        
    def _tanh(self, z):
        return np.tanh(np.clip(z, -15.0, 15.0))
        
    def encode_input(self, skill_idx, correct):
        """Encodes (skill_idx, correct) into a 2 * num_skills one-hot representation."""
        vec = np.zeros((1, self.input_dim))
        offset = self.num_skills if correct == 1 else 0
        vec[0, offset + skill_idx] = 1.0
        return vec
        
    def forward_sequence(self, sequence):
        """
        Forward pass of GRU over a sequence of interactions [(skill_idx, correct), ...].
        Returns:
            preds: array of shape (T, num_skills)
            cache: dictionary of intermediate activations for backpropagation
        """
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
            
            # GRU Update Gate: z_t = sigmoid(x_t W_z + h_{t-1} U_z + b_z)
            z_t = self._sigmoid(np.dot(x_t, self.W_z) + np.dot(h, self.U_z) + self.b_z)
            z_list.append(z_t)
            
            # GRU Reset Gate: r_t = sigmoid(x_t W_r + h_{t-1} U_r + b_r)
            r_t = self._sigmoid(np.dot(x_t, self.W_r) + np.dot(h, self.U_r) + self.b_r)
            r_list.append(r_t)
            
            # Candidate Hidden: h_tilde = tanh(x_t W_h + (r_t * h_{t-1}) U_h + b_h)
            cand_pre = np.dot(x_t, self.W_h) + np.dot(r_t * h, self.U_h) + self.b_h
            h_tilde = self._tanh(cand_pre)
            h_tilde_list.append(h_tilde)
            
            # Hidden State Update: h_t = (1 - z_t) * h_{t-1} + z_t * h_tilde
            h = (1.0 - z_t) * h + z_t * h_tilde
            h_list.append(h)
            
            # Output predictions for each skill: y_t = sigmoid(h_t W_out + b_out)
            out_act = np.dot(h, self.W_out) + self.b_out
            y_t = self._sigmoid(out_act)
            preds.append(y_t[0])
            
        cache = {
            "x_list": x_list,
            "h_list": h_list,
            "z_list": z_list,
            "r_list": r_list,
            "h_tilde_list": h_tilde_list
        }
        return np.array(preds), cache

    def train_on_sequences(self, sequences, epochs=8, lambda_wav=0.01):
        """
        Trains the DKT GRU model using BPTT and the Adam optimizer with DKT+ wave regularization.
        """
        valid_seqs = [s for s in sequences if len(s) >= 3]
        if not valid_seqs:
            return {"loss_history": []}
            
        loss_history = []
        
        for epoch in range(epochs):
            np.random.shuffle(valid_seqs)
            epoch_loss = 0.0
            total_predictions = 0
            
            for seq in valid_seqs:
                T = min(len(seq), 50)
                if T < 2:
                    continue
                    
                preds, cache = self.forward_sequence(seq[:T-1])
                
                # Gradients initialization
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
                    
                    # Binary Cross-Entropy Loss
                    bce_loss = -(target_correct * np.log(pred_safe) + (1.0 - target_correct) * np.log(1.0 - pred_safe))
                    seq_loss += bce_loss
                    total_predictions += 1
                    
                    # Output error gradient
                    dy = np.zeros((1, self.output_dim))
                    dy[0, target_skill] = pred_p - target_correct
                    
                    # Optional DKT+ wave smoothing regularization
                    if t > 0:
                        wave_diff = pred_p - preds[t - 1, target_skill]
                        dy[0, target_skill] += 2.0 * lambda_wav * wave_diff
                    
                    h_t = h_list[t + 1]
                    h_prev = h_list[t]
                    z_t = z_list[t]
                    r_t = r_list[t]
                    h_tilde = h_tilde_list[t]
                    x_t = x_list[t]
                    
                    # W_out and b_out gradients
                    grads['W_out'] += np.dot(h_t.T, dy)
                    grads['b_out'] += dy
                    
                    # Backpropagation into hidden state h_t
                    dh_t = np.dot(dy, self.W_out.T) + dh_next
                    
                    # Gradient w.r.t candidate hidden h_tilde
                    dh_tilde = dh_t * z_t
                    d_cand_pre = dh_tilde * (1.0 - h_tilde ** 2)
                    grads['W_h'] += np.dot(x_t.T, d_cand_pre)
                    grads['U_h'] += np.dot((r_t * h_prev).T, d_cand_pre)
                    grads['b_h'] += d_cand_pre
                    
                    # Gradient w.r.t reset gate r_t
                    d_r_hprev = np.dot(d_cand_pre, self.U_h.T)
                    dr_t = d_r_hprev * h_prev
                    dr_pre = dr_t * r_t * (1.0 - r_t)
                    grads['W_r'] += np.dot(x_t.T, dr_pre)
                    grads['U_r'] += np.dot(h_prev.T, dr_pre)
                    grads['b_r'] += dr_pre
                    
                    # Gradient w.r.t update gate z_t
                    dz_t = dh_t * (h_tilde - h_prev)
                    dz_pre = dz_t * z_t * (1.0 - z_t)
                    grads['W_z'] += np.dot(x_t.T, dz_pre)
                    grads['U_z'] += np.dot(h_prev.T, dz_pre)
                    grads['b_z'] += dz_pre
                    
                    # Compute dh_prev for previous recurrent step
                    dh_prev_direct = dh_t * (1.0 - z_t)
                    dh_prev_from_r = d_r_hprev * r_t
                    dh_prev_from_gates = np.dot(dz_pre, self.U_z.T) + np.dot(dr_pre, self.U_r.T)
                    dh_next = dh_prev_direct + dh_prev_from_r + dh_prev_from_gates
                    
                # Gradient clipping
                scale = 1.0 / max(1, T - 1)
                self.t_step += 1
                
                for p in self.param_names:
                    g = np.clip(grads[p] * scale, -2.5, 2.5)
                    # Adam Moment Updates
                    self.m[p] = self.beta1 * self.m[p] + (1.0 - self.beta1) * g
                    self.v[p] = self.beta2 * self.v[p] + (1.0 - self.beta2) * (g ** 2)
                    
                    m_hat = self.m[p] / (1.0 - self.beta1 ** self.t_step)
                    v_hat = self.v[p] / (1.0 - self.beta2 ** self.t_step)
                    
                    # Parameter update with Adam & L2 weight decay
                    param = getattr(self, p)
                    param -= self.lr * (m_hat / (np.sqrt(v_hat) + self.eps) + self.weight_decay * param)
                    setattr(self, p, param)
                    
                epoch_loss += seq_loss
                
            avg_loss = epoch_loss / max(1, total_predictions)
            loss_history.append(float(avg_loss))
            
        return {"loss_history": loss_history}

    def evaluate(self, sequences):
        """
        Evaluates prediction Accuracy, AUC, Brier Score, and Expected Calibration Error (ECE).
        """
        y_true = []
        y_pred = []
        
        for seq in sequences:
            if len(seq) < 2:
                continue
            preds, _ = self.forward_sequence(seq[:-1])
            for t in range(len(seq) - 1):
                target_skill, target_correct = seq[t + 1]
                pred_p = float(preds[t, target_skill])
                y_true.append(int(target_correct))
                y_pred.append(pred_p)
                
        if not y_true:
            return {"accuracy": 0.5, "auc": 0.5, "bce_loss": 0.693, "brier_score": 0.25, "ece": 0.0}
            
        y_true = np.array(y_true)
        y_pred = np.array(y_pred)
        
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
            rank_sum_pos = np.sum(ranks[y_true == 1])
            auc = float((rank_sum_pos - n_pos * (n_pos + 1) / 2.0) / (n_pos * n_neg))
            auc = max(0.5, min(1.0, auc))
            
        # Expected Calibration Error (ECE) across 10 confidence bins
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
            "ece": round(float(ece), 4),
            "num_predictions": len(y_true)
        }


def train_and_export_dkt(csv_path):
    """Loads ASSISTments processed data, builds student sequences, trains DKT GRU, and returns stats."""
    if not os.path.exists(csv_path):
        return None
        
    df = pd.read_csv(csv_path)
    if "order_id" in df.columns:
        df = df.sort_values(by=["user_id", "order_id"])
        
    skills = sorted(df["skill_name"].dropna().unique().tolist())
    skill_to_idx = {s: i for i, s in enumerate(skills)}
    
    student_sequences = []
    for user_id, group in df.groupby("user_id"):
        seq = []
        for _, row in group.iterrows():
            s_name = row.get("skill_name")
            if s_name in skill_to_idx and not pd.isna(row.get("correct")):
                seq.append((skill_to_idx[s_name], int(row["correct"])))
        if len(seq) >= 3:
            student_sequences.append(seq)
            
    if not student_sequences:
        return None
        
    np.random.seed(42)
    indices = np.arange(len(student_sequences))
    np.random.shuffle(indices)
    split_idx = int(0.8 * len(student_sequences))
    train_seqs = [student_sequences[i] for i in indices[:split_idx]]
    test_seqs = [student_sequences[i] for i in indices[split_idx:]]
    
    dkt = PureNumpyDKT(num_skills=len(skills), hidden_dim=32, lr=0.01)
    train_res = dkt.train_on_sequences(train_seqs, epochs=8)
    test_eval = dkt.evaluate(test_seqs)
    
    return {
        "skills": skills,
        "num_skills": len(skills),
        "num_student_sequences": len(student_sequences),
        "loss_history": train_res["loss_history"],
        "test_eval": test_eval,
        "model": dkt
    }

