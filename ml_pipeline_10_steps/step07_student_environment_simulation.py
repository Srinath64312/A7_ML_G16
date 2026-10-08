"""
================================================================================
STEP 07: REINFORCEMENT LEARNING TUTORING ENVIRONMENT
================================================================================
Goal:
  - Formulate the Markov Decision Process (MDP) for intelligent tutoring.
  - State Space: Student mastery belief P(L_t) [discretized or continuous].
  - Action Space: 5 pedagogical difficulty levels (1 to 5).
  - Reward Function: Multi-objective reward balancing Learning Gain, Correctness, and Engagement in ZPD.
================================================================================
"""

import numpy as np

class StudentSimulator:
    """
    Simulates a human student with latent ability, heterogeneous learning rate,
    and cognitive engagement dynamics (Zone of Proximal Development).
    """
    def __init__(self, student_id=0):
        self.student_id = student_id
        # Initial latent mastery skill from Beta distribution [0, 1]
        self.skill = np.random.beta(2, 3)
        self.learning_rate = np.random.uniform(0.04, 0.12)
        self.engagement_trait = np.random.uniform(0.4, 1.0)

    def step(self, difficulty_level: int):
        """
        difficulty_level: 1 (easiest) to 5 (hardest)
        Returns: correct (0/1), learning_gain, engagement, composite_reward
        """
        norm_diff = (difficulty_level - 1) / 4.0  # Scale 1-5 to [0.0, 1.0]

        # Difficulty-conditioned slip & guess for 3-PL IRT
        base_guess, base_slip = 0.18, 0.10
        p_slip = float(np.clip(base_slip * (1.0 + 0.15 * (difficulty_level - 1)), 0.04, 0.28))
        p_guess = float(np.clip(base_guess * np.exp(-0.20 * (difficulty_level - 1)), 0.05, 0.25))

        prob_ability = 1.0 / (1.0 + np.exp(-4.0 * (self.skill - norm_diff)))
        prob_correct = p_guess * (1.0 - prob_ability) + (1.0 - p_slip) * prob_ability
        prob_correct = float(np.clip(prob_correct, 0.05, 0.95))

        correct = int(np.random.rand() < prob_correct)

        # Zone of Proximal Development (ZPD) Dynamics
        diff_gap = abs(self.skill - norm_diff)
        if diff_gap < 0.25:  # Optimal challenge zone (Flow state)
            gain = self.learning_rate * (1.25 if correct else 0.80)
            engagement = min(1.0, self.engagement_trait * 1.15)
        elif self.skill < norm_diff:  # Too difficult (Frustration zone)
            gain = self.learning_rate * 0.30
            engagement = max(0.10, self.engagement_trait * 0.60)
        else:  # Too simple (Boredom zone)
            gain = self.learning_rate * 0.10
            engagement = max(0.10, self.engagement_trait * 0.45)

        # Update latent skill
        self.skill = min(1.0, self.skill + gain)

        # Multi-Objective Pedagogical Reward
        # Reward = 1.6*Gain + 0.4*Correct + 0.5*Engagement - 0.25*(Gap^2)
        reward = 1.6 * gain + 0.4 * correct + 0.5 * engagement - 0.25 * (diff_gap ** 2)

        return correct, gain, engagement, reward


class TutoringEnvironment:
    """Gym-compatible Environment Wrapper for Tutoring."""
    def __init__(self):
        self.student = None
        self.bkt_state = 0.25

    def reset(self):
        self.student = StudentSimulator()
        self.bkt_state = 0.25
        return self.bkt_state

    def step(self, action: int):
        # action is 0 to 4 (representing levels 1 to 5)
        diff_level = action + 1
        correct, gain, eng, reward = self.student.step(diff_level)
        
        # BKT belief update for next state
        p_guess, p_slip, p_transit = 0.20, 0.10, 0.15
        if correct == 1:
            num = self.bkt_state * (1.0 - p_slip)
            den = num + (1.0 - self.bkt_state) * p_guess
        else:
            num = self.bkt_state * p_slip
            den = num + (1.0 - self.bkt_state) * (1.0 - p_guess)
        post = num / max(1e-6, den)
        self.bkt_state = float(np.clip(post + (1.0 - post) * p_transit, 0.01, 0.99))

        done = False
        info = {"latent_skill": self.student.skill, "gain": gain, "engagement": eng, "correct": correct}
        return self.bkt_state, reward, done, info

if __name__ == "__main__":
    print("=" * 65)
    print("STEP 07: TUTORING ENVIRONMENT & MDP SIMULATION TEST")
    print("=" * 65)
    env = TutoringEnvironment()
    state = env.reset()
    print(f"Initial State BKT Mastery: {state:.2f}")
    
    print("\nSimulating 5 interaction steps:")
    for step in range(1, 6):
        action = np.random.randint(0, 5)
        next_state, reward, _, info = env.step(action)
        print(f"Step {step}: Action Level={action+1} | Correct={info['correct']} | "
              f"Reward={reward:.3f} | Latent Skill={info['latent_skill']:.3f} | Next State={next_state:.3f}")