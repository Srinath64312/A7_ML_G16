import unittest
import os
import pandas as pd
from backend.data_pipeline import PROCESSED_FILE, preprocess_and_fit_irt, generate_synthetic_backup

class TestIRTCalibration(unittest.TestCase):
    def setUp(self):
        generate_synthetic_backup()
        
    def test_irt_fitting(self):
        preprocess_and_fit_irt(max_rows=1000)
        
        self.assertTrue(os.path.exists(PROCESSED_FILE))
        df = pd.read_csv(PROCESSED_FILE)
        
        self.assertIn('difficulty_level', df.columns)
        self.assertIn('estimated_difficulty_beta', df.columns)
        
        # Difficulties should be bounded 1 to 5
        self.assertTrue(df['difficulty_level'].min() >= 1)
        self.assertTrue(df['difficulty_level'].max() <= 5)

if __name__ == "__main__":
    unittest.main()
