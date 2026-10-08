"""
================================================================================
STEP 08: REINFORCEMENT LEARNING AGENT TRAINING (Q-LEARNING & DQN)
================================================================================
Goal:
  - Implement Tabular Q-Learning with Bellman optimality updates.
  - Implement a Deep Q-Network (DQN) with Experience Replay in pure NumPy.
  - Train agents across 400 simulated student learning episodes.
  - Track loss convergence and policy stabilization.
================================================================================
"""

import os
import sys
import random
from collections import deque
import numpy as np

try:
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
except NameError:
    cur = os.path.abspath(".")
    BASE_DIR = cur if os.path.exists(os.path.join(cur, "data")) else os.path.dirname(cur)

PIPELINE_DIR = os.path.join(BASE_DIR, "ml_pipeline_10_steps")
for p in [BASE_DIR, PIPELINE_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

class QLearningAgent:
    """Tabular Q-learning agent with Boltzmann exploration and decaying temperature."""
    def __init__(self, alpha=0.3, gamma=0.90, epsilon_start=1.0, epsilon_min=0.05, decay_rate=0.995, temperature=0.6, temp_min=0.1):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_min = epsilon_min
        self.decay_rate = decay_rate
        self.temperature = temperature
        self.temp_min = temp_min
        # Q-table: 10 State bins (0.0 to 1.0) x 5 Actions (Difficulty 1 to 5)
        self.q_table = np.zeros((10, 5))

    def get_state_idx(self, mastery_prob: float) -> int:
        return min(9, max(0, int(mastery_prob * 10)))

    def get_action_probabilities(self, state_val: float):
        state_idx = self.get_state_idx(state_val)
        q_row = self.q_table[state_idx]
        tau = max(self.temp_min, self.temperature)
        scaled_q = (q_row - np.max(q_row)) / tau
        exp_q = np.exp(np.clip(scaled_q, -20.0, 20.0))
        return exp_q / np.sum(exp_q)

    def select_action(self, state_val: float, evaluation: bool = False, use_boltzmann: bool = True) -> int:
        state_idx = self.get_state_idx(state_val)
        if evaluation:
            return int(np.argmax(self.q_table[state_idx]))
        if use_boltzmann and random.random() > self.epsilon:
            probs = self.get_action_probabilities(state_val)
            return int(np.random.choice(5, p=probs))
        if random.random() < self.epsilon:
            return random.randint(0, 4)
        return int(np.argmax(self.q_table[state_idx]))

    def update(self, state_val: float, action: int, reward: float, next_state_val: float):
        s = self.get_state_idx(state_val)
        s_prime = self.get_state_idx(next_state_val)
        a = action

        # Bellman Equation update
        best_next_q = np.max(self.q_table[s_prime])
        td_target = reward + self.gamma * best_next_q
        self.q_table[s, a] += self.alpha * (td_target - self.q_table[s, a])

        # Decay exploration rate and temperature
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.decay_rate
        if self.temperature > self.temp_min:
            self.temperature *= self.decay_rate


class NumpyDQN:
    """Deep Q-Network with Target Network and Huber Loss implemented in pure NumPy."""
    def __init__(self, input_dim=4, hidden_dim=16, output_dim=5, lr=0.008, gamma=0.90, tau_polyak=0.02):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        self.lr = lr
        self.gamma = gamma
        self.epsilon = 1.0
        self.epsilon_min = 0.05
        self.decay_rate = 0.995
        self.tau_polyak = tau_polyak
        
        self.replay_buffer = deque(maxlen=5000)
        self.batch_size = 32

        # Online Network Parameters
        self.W1 = np.random.normal(0, np.sqrt(2.0 / input_dim), (input_dim, hidden_dim))
        self.b1 = np.zeros(hidden_dim)
        self.W2 = np.random.normal(0, np.sqrt(2.0 / hidden_dim), (hidden_dim, output_dim))
        self.b2 = np.zeros(output_dim)

        # Target Network Parameters
        self.W1_target = self.W1.copy()
        self.b1_target = self.b1.copy()
        self.W2_target = self.W2.copy()
        self.b2_target = self.b2.copy()

    def forward(self, x, use_target=False):
        if x.ndim == 1:
            x = x.reshape(1, -1)
        w1 = self.W1_target if use_target else self.W1
        b1 = self.b1_target if use_target else self.b1
        w2 = self.W2_target if use_target else self.W2
        b2 = self.b2_target if use_target else self.b2

        z1 = np.dot(x, w1) + b1
        h = np.maximum(0, z1)  # ReLU
        q = np.dot(h, w2) + b2
        return q, h, z1

    def select_action(self, state, evaluation=False):
        q, _, _ = self.forward(state, use_target=False)
        if evaluation:
            return int(np.argmax(q[0]))
        if random.random() < self.epsilon:
            return random.randint(0, 4)
        q_row = q[0]
        exp_q = np.exp(np.clip((q_row - np.max(q_row)) / 0.5, -20.0, 20.0))
        probs = exp_q / np.sum(exp_q)
        return int(np.random.choice(5, p=probs))

    def store_transition(self, state, action, reward, next_state, done):
        self.replay_buffer.append((state, action, reward, next_state, done))

    def train_step(self):
        if len(self.replay_buffer) < self.batch_size:
            return
        batch = random.sample(self.replay_buffer, self.batch_size)
        states = np.array([t[0] for t in batch])
        actions = np.array([t[1] for t in batch])
        rewards = np.array([t[2] for t in batch])
        next_states = np.array([t[3] for t in batch])
        dones = np.array([t[4] for t in batch])

        next_q, _, _ = self.forward(next_states, use_target=True)
        targets = rewards + self.gamma * np.max(next_q, axis=1) * (1 - dones)
        q_vals, h, z1 = self.forward(states, use_target=False)

        dq = np.zeros_like(q_vals)
        for i in range(self.batch_size):
            err = q_vals[i, actions[i]] - targets[i]
            grad_val = err if abs(err) <= 1.0 else np.sign(err)
            dq[i, actions[i]] = grad_val

        dW2 = np.dot(h.T, dq) / self.batch_size
        db2 = np.mean(dq, axis=0)
        dh = np.dot(dq, self.W2.T)
        dz1 = dh * (z1 > 0)
        dW1 = np.dot(states.T, dz1) / self.batch_size
        db1 = np.mean(dz1, axis=0)

        self.W1 -= self.lr * np.clip(dW1, -1.0, 1.0)
        self.b1 -= self.lr * np.clip(db1, -1.0, 1.0)
        self.W2 -= self.lr * np.clip(dW2, -1.0, 1.0)
        self.b2 -= self.lr * np.clip(db2, -1.0, 1.0)

        # Soft Polyak Target Network Update
        self.W1_target = (1.0 - self.tau_polyak) * self.W1_target + self.tau_polyak * self.W1
        self.b1_target = (1.0 - self.tau_polyak) * self.b1_target + self.tau_polyak * self.b1
        self.W2_target = (1.0 - self.tau_polyak) * self.W2_target + self.tau_polyak * self.W2
        self.b2_target = (1.0 - self.tau_polyak) * self.b2_target + self.tau_polyak * self.b2

        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.decay_rate

def train_rl_agents():
    print("=" * 65)
    print("STEP 08: REINFORCEMENT LEARNING AGENTS TRAINING")
    print("=" * 65)
    
    from step07_student_environment_simulation import TutoringEnvironment
    
    env = TutoringEnvironment()
    q_agent = QLearningAgent()
    
    num_episodes = 400
    steps_per_episode = 20
    rewards_log = []

    print(f"Training Tabular Q-Learning Agent across {num_episodes} student cohorts...")
    for ep in range(num_episodes):
        state = env.reset()
        ep_reward = 0.0
        
        for _ in range(steps_per_episode):
            action = q_agent.select_action(state)
            next_state, reward, _, _ = env.step(action)
            q_agent.update(state, action, reward, next_state)
            state = next_state
            ep_reward += reward

        rewards_log.append(ep_reward)
        if (ep + 1) % 100 == 0:
            print(f"  Episode {ep+1:3d}/{num_episodes} | Avg Reward (last 50): {np.mean(rewards_log[-50:]):.3f} | Epsilon: {q_agent.epsilon:.3f}")

    print("\n[OK] Learned Q-Table (State Mastery Bin [0-9] vs Difficulty Action [1-5]):")
    print("State | Diff 1 | Diff 2 | Diff 3 | Diff 4 | Diff 5 | Optimal Action")
    print("-" * 65)
    for s in range(10):
        row = q_agent.q_table[s]
        best_a = int(np.argmax(row)) + 1
        q_str = " | ".join([f"{v:6.2f}" for v in row])
        print(f"  {s:2d}  | {q_str} | Level {best_a}")

    # Plot Q-learning convergence and Q-table heatmap
    try:
        import matplotlib.pyplot as plt
        plots_dir = os.path.join(BASE_DIR, "data", "output_plots")
        os.makedirs(plots_dir, exist_ok=True)

        fig, axes = plt.subplots(1, 2, figsize=(14, 5))

        # Subplot 1: Episode Reward Learning Curve
        # Smooth with moving average
        window = 20
        smoothed = np.convolve(rewards_log, np.ones(window)/window, mode='valid')
        axes[0].plot(rewards_log, color='#93c5fd', alpha=0.4, label='Raw Episode Reward')
        axes[0].plot(range(window-1, len(rewards_log)), smoothed, color='#2563eb', lw=2.5, label='Moving Average (w=20)')
        axes[0].set_title('Reinforcement Learning Convergence Curve', fontsize=12, fontweight='bold')
        axes[0].set_xlabel('Episode')
        axes[0].set_ylabel('Cumulative Episode Reward')
        axes[0].grid(True, linestyle='--', alpha=0.5)
        axes[0].legend()

        # Subplot 2: Q-Table Heatmap
        cax = axes[1].matshow(q_agent.q_table, cmap='viridis', aspect='auto')
        fig.colorbar(cax, ax=axes[1], fraction=0.046, pad=0.04)
        axes[1].set_xticks(range(5))
        axes[1].set_xticklabels(['Lvl 1', 'Lvl 2', 'Lvl 3', 'Lvl 4', 'Lvl 5'])

        plt.tight_layout()
        plot_path = os.path.join(plots_dir, "step08_rl_convergence_and_qtable.png")
        plt.savefig(plot_path, dpi=150)
        print(f"\n[OK] RL Training & Q-Table Heatmap saved to:\n   {plot_path}")
        plt.close()
    except Exception as e:
        print(f"[NOTE] Plot generation skipped: {e}")

    return q_agent

if __name__ == "__main__":
    train_rl_agents()