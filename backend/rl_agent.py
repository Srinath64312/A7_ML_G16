import numpy as np
import random
from collections import deque

class QLearningAgent:
    """
    Tabular Q-learning agent with Boltzmann (Softmax) action selection
    and decaying temperature / epsilon-greedy exploration.
    State: 10 discretized skill mastery bins [0 to 9].
    Action: 5 difficulty levels [0 to 4].
    """
    def __init__(self, alpha=0.3, gamma=0.9, epsilon_start=1.0, epsilon_min=0.05, decay_rate=0.9995, temperature=0.6, temp_min=0.1):
        self.alpha = alpha
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_min = epsilon_min
        self.decay_rate = decay_rate
        self.temperature = temperature
        self.temp_min = temp_min
        
        # Q-table: 10 states x 5 actions
        self.q_table = np.zeros((10, 5))
        
    def get_state_idx(self, mastery_prob):
        # Map mastery_prob [0, 1] to integer state index [0, 9]
        idx = int(mastery_prob * 10)
        return min(9, max(0, idx))
        
    def get_action_probabilities(self, state_val):
        """Computes Boltzmann (Softmax) action probabilities for the current state."""
        state_idx = self.get_state_idx(state_val)
        q_row = self.q_table[state_idx]
        tau = max(self.temp_min, self.temperature)
        scaled_q = (q_row - np.max(q_row)) / tau
        exp_q = np.exp(np.clip(scaled_q, -20.0, 20.0))
        probs = exp_q / np.sum(exp_q)
        return probs
        
    def select_action(self, state_val, evaluation=False, use_boltzmann=True):
        state_idx = self.get_state_idx(state_val)
        
        if evaluation:
            return int(np.argmax(self.q_table[state_idx]))
            
        if use_boltzmann and random.random() > self.epsilon:
            probs = self.get_action_probabilities(state_val)
            return int(np.random.choice(5, p=probs))
            
        if random.random() < self.epsilon:
            return random.randint(0, 4)
            
        return int(np.argmax(self.q_table[state_idx]))
        
    def update(self, state_val, action, reward, next_state_val):
        s = self.get_state_idx(state_val)
        s_prime = self.get_state_idx(next_state_val)
        a = action
        
        # Bellman Optimality Equation: Q(s,a) += alpha * (r + gamma * max_a' Q(s', a') - Q(s,a))
        best_next_q = np.max(self.q_table[s_prime])
        self.q_table[s, a] = self.q_table[s, a] + self.alpha * (reward + self.gamma * best_next_q - self.q_table[s, a])
        
        # Epsilon and temperature decay
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.decay_rate
        if self.temperature > self.temp_min:
            self.temperature *= self.decay_rate


class NumpyDQN:
    """
    A pure NumPy implementation of a Deep Q-Network (DQN) with a Target Network,
    Replay Buffer, Huber Loss, and Boltzmann Exploration.
    State: [mastery, recent_correctness, avg_response_time_seconds, hint_count]
    Action: 5 difficulty levels (0 to 4).
    """
    def __init__(self, input_dim=4, hidden_dim=16, output_dim=5, lr=0.008, gamma=0.9, 
                 epsilon_start=1.0, epsilon_min=0.05, decay_rate=0.9995, tau_polyak=0.02):
        self.input_dim = input_dim
        self.hidden_dim = hidden_dim
        self.output_dim = output_dim
        self.lr = lr
        self.gamma = gamma
        self.epsilon = epsilon_start
        self.epsilon_min = epsilon_min
        self.decay_rate = decay_rate
        self.tau_polyak = tau_polyak
        
        # Replay buffer
        self.replay_buffer = deque(maxlen=5000)
        self.batch_size = 32
        
        # Online Network Parameters (He initialization)
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
        """Forward pass of 2-layer MLP."""
        if x.ndim == 1:
            x = x.reshape(1, -1)
            
        w1 = self.W1_target if use_target else self.W1
        b1 = self.b1_target if use_target else self.b1
        w2 = self.W2_target if use_target else self.W2
        b2 = self.b2_target if use_target else self.b2
        
        z1 = np.dot(x, w1) + b1
        h = np.maximum(0, z1) # ReLU activation
        q = np.dot(h, w2) + b2 # Linear Q-values
        return q, h, z1
        
    def select_action(self, state, evaluation=False):
        q, _, _ = self.forward(state, use_target=False)
        if evaluation:
            return int(np.argmax(q[0]))
            
        if random.random() < self.epsilon:
            return random.randint(0, 4)
            
        # Softmax Boltzmann action selection
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
        states = np.array([t[0] for t in batch])       # (32, 4)
        actions = np.array([t[1] for t in batch])      # (32,)
        rewards = np.array([t[2] for t in batch])      # (32,)
        next_states = np.array([t[3] for t in batch])  # (32, 4)
        dones = np.array([t[4] for t in batch])        # (32,)
        
        # Calculate target using dedicated Target Network
        next_q, _, _ = self.forward(next_states, use_target=True)
        max_next_q = np.max(next_q, axis=1)
        targets = rewards + self.gamma * max_next_q * (1 - dones)
        
        # Forward pass on online network
        q_vals, h, z1 = self.forward(states, use_target=False)
        
        # Huber Loss Gradient Computation
        dq = np.zeros_like(q_vals)
        for i in range(self.batch_size):
            err = q_vals[i, actions[i]] - targets[i]
            # Smooth L1 Huber gradient
            if abs(err) <= 1.0:
                grad_val = err
            else:
                grad_val = np.sign(err)
            dq[i, actions[i]] = grad_val
            
        # Gradients w.r.t W2 and b2
        dW2 = np.dot(h.T, dq) / self.batch_size
        db2 = np.mean(dq, axis=0)
        
        # Backpropagation into hidden activations
        dh = np.dot(dq, self.W2.T)
        dz1 = dh * (z1 > 0)
        
        # Gradients w.r.t W1 and b1
        dW1 = np.dot(states.T, dz1) / self.batch_size
        db1 = np.mean(dz1, axis=0)
        
        # Parameter update
        self.W1 -= self.lr * np.clip(dW1, -1.0, 1.0)
        self.b1 -= self.lr * np.clip(db1, -1.0, 1.0)
        self.W2 -= self.lr * np.clip(dW2, -1.0, 1.0)
        self.b2 -= self.lr * np.clip(db2, -1.0, 1.0)
        
        # Soft Polyak Target Network Update
        self.W1_target = (1.0 - self.tau_polyak) * self.W1_target + self.tau_polyak * self.W1
        self.b1_target = (1.0 - self.tau_polyak) * self.b1_target + self.tau_polyak * self.b1
        self.W2_target = (1.0 - self.tau_polyak) * self.W2_target + self.tau_polyak * self.W2
        self.b2_target = (1.0 - self.tau_polyak) * self.b2_target + self.tau_polyak * self.b2
        
        # Decay epsilon
        if self.epsilon > self.epsilon_min:
            self.epsilon *= self.decay_rate


class RuleBasedAgent:
    """
    Baselines agent that selects difficulty using a fixed pedagogic rule.
    """
    def select_action(self, mastery_prob):
        if mastery_prob < 0.40:
            return np.random.choice([0, 1])  # Difficulty 1 or 2 (Easy)
        elif mastery_prob <= 0.70:
            return 2                         # Difficulty 3 (Medium)
        else:
            return np.random.choice([3, 4])  # Difficulty 4 or 5 (Hard)


class RandomAgent:
    """
    Baseline agent that selects difficulty uniformly at random.
    """
    def select_action(self):
        return random.randint(0, 4)


class FixedDifficultyAgent:
    """
    Baseline agent that always selects medium difficulty (Difficulty level 3).
    """
    def select_action(self):
        return 2  # Level 3 (0-indexed 2)

