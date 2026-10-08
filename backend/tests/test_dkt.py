import unittest
import numpy as np
from backend.dkt_model import PureNumpyDKT

class TestDeepKnowledgeTracing(unittest.TestCase):
    def setUp(self):
        self.num_skills = 4
        self.dkt = PureNumpyDKT(num_skills=self.num_skills, hidden_dim=16, lr=0.05)

    def test_forward_pass(self):
        # Create a sample student sequence: [(skill, correct), ...]
        seq = [(0, 1), (1, 0), (0, 1), (2, 1)]
        preds, hiddens = self.dkt.forward_sequence(seq)
        
        self.assertEqual(len(preds), len(seq))
        self.assertEqual(preds.shape[1], self.num_skills)
        # Probabilities should be strictly in [0, 1]
        self.assertTrue(np.all(preds >= 0.0) and np.all(preds <= 1.0))

    def test_training_reduces_loss(self):
        # Generate synthetic sequences with a consistent skill pattern
        np.random.seed(42)
        sequences = []
        for _ in range(30):
            seq = []
            for t in range(10):
                skill = np.random.randint(0, self.num_skills)
                # Skill 0 is always mastered (1), Skill 1 is unmastered (0)
                correct = 1 if skill == 0 else (0 if skill == 1 else np.random.randint(0, 2))
                seq.append((skill, correct))
            sequences.append(seq)
            
        res = self.dkt.train_on_sequences(sequences, epochs=8)
        losses = res["loss_history"]
        self.assertTrue(len(losses) > 0)
        # Final loss should be lower than initial loss
        self.assertLess(losses[-1], losses[0] * 1.05)

    def test_evaluate_metrics(self):
        test_seqs = [
            [(0, 1), (0, 1), (1, 0), (1, 0)],
            [(1, 0), (1, 0), (0, 1), (0, 1)]
        ]
        eval_res = self.dkt.evaluate(test_seqs)
        self.assertIn("auc", eval_res)
        self.assertIn("accuracy", eval_res)
        self.assertIn("bce_loss", eval_res)
        self.assertTrue(0.0 <= eval_res["auc"] <= 1.0)
        self.assertTrue(0.0 <= eval_res["accuracy"] <= 1.0)

if __name__ == "__main__":
    unittest.main()
