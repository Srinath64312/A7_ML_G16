import unittest
import numpy as np
from backend.rl_agent import QLearningAgent, NumpyDQN, RuleBasedAgent

class TestRLAgents(unittest.TestCase):
    def test_q_learning_agent(self):
        agent = QLearningAgent(alpha=0.5, gamma=0.9, epsilon_start=0.0) # evaluation mode
        
        # Test state conversion
        self.assertEqual(agent.get_state_idx(0.0), 0)
        self.assertEqual(agent.get_state_idx(0.25), 2)
        self.assertEqual(agent.get_state_idx(0.99), 9)
        self.assertEqual(agent.get_state_idx(1.0), 9)
        
        # Test action selection (with epsilon=0, should select highest Q value)
        agent.q_table[3, 4] = 10.5
        action = agent.select_action(0.35, evaluation=True)
        self.assertEqual(action, 4)
        
        # Test updates
        agent.update(0.35, 4, 1.0, 0.45)
        # Verify Bellman target update: Q(3,4) should become 10.5 + 0.5 * (1.0 + 0.9 * max(Q(4)) - 10.5)
        # Since max(Q(4)) is 0, Target is 1.0. New value = 10.5 + 0.5 * (1.0 - 10.5) = 10.5 - 4.75 = 5.75
        self.assertAlmostEqual(agent.q_table[3, 4], 5.75)

    def test_numpy_dqn(self):
        # Initialize DQN
        agent = NumpyDQN(input_dim=4, hidden_dim=8, output_dim=5, lr=0.1, epsilon_start=0.0)
        
        # Check forward pass shapes
        state = np.array([0.5, 1.0, 0.2, 0.0])
        q_vals, h, z1 = agent.forward(state)
        
        self.assertEqual(q_vals.shape, (1, 5))
        self.assertEqual(h.shape, (1, 8))
        self.assertEqual(z1.shape, (1, 8))
        
        # Test transition store and single train step
        agent.store_transition(state, 2, 1.0, state, False)
        # Store enough steps to satisfy batch size (32)
        for _ in range(35):
            agent.store_transition(state, 2, 1.0, state, False)
            
        old_W1 = agent.W1.copy()
        agent.train_step()
        
        # W1 weights should be modified
        self.assertFalse(np.array_equal(agent.W1, old_W1))

    def test_rule_based_agent(self):
        agent = RuleBasedAgent()
        
        # Low mastery should pick Level 1 or 2 (action 0 or 1)
        action_low = agent.select_action(0.2)
        self.assertIn(action_low, [0, 1])
        
        # Medium mastery should pick Level 3 (action 2)
        action_med = agent.select_action(0.55)
        self.assertEqual(action_med, 2)
        
        # High mastery should pick Level 4 or 5 (action 3 or 4)
        action_high = agent.select_action(0.85)
        self.assertIn(action_high, [3, 4])

if __name__ == "__main__":
    unittest.main()
