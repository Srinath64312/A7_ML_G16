import unittest
import os
import pandas as pd
from backend.data_pipeline import RAW_FILE, generate_synthetic_backup

class TestDataPipeline(unittest.TestCase):
    def test_synthetic_generation(self):
        # Generate synthetic backup
        generate_synthetic_backup()
        
        # Verify RAW_FILE exists
        self.assertTrue(os.path.exists(RAW_FILE))
        
        # Check columns
        df = pd.read_csv(RAW_FILE)
        required_cols = ['order_id', 'user_id', 'problem_id', 'correct', 'skill_id', 'skill_name']
        for col in required_cols:
            self.assertIn(col, df.columns)
            
        self.assertGreater(len(df), 0)

if __name__ == "__main__":
    unittest.main()
