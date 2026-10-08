import unittest
from backend.app import app, TOPICS, QUESTION_DATABASE
from backend.dkt_model import PureNumpyDKT
from backend.tutor_env import StudentSimulator, BKTTracker
import numpy as np

class FullSystemScanTest(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_01_topics_catalog(self):
        res = self.client.get('/api/topics')
        self.assertEqual(res.status_code, 200)
        data = res.json
        self.assertIn('tracks', data)
        self.assertIn('math', data['tracks'])
        self.assertIn('cs', data['tracks'])
        self.assertIn('all_topics', data)
        self.assertEqual(len(data['all_topics']), len(TOPICS))

    def test_02_question_database_integrity(self):
        self.assertTrue(len(QUESTION_DATABASE) > 0)
        for topic, questions in QUESTION_DATABASE.items():
            self.assertTrue(len(questions) > 0, f"Topic {topic} has no questions!")
            for q in questions:
                self.assertIn('id', q)
                self.assertIn('question', q)
                self.assertIn('choices', q)
                self.assertIn('answer', q)
                self.assertIn('difficulty', q)
                self.assertIn('hint', q)
                self.assertIn(q['answer'], q['choices'], f"Answer '{q['answer']}' not in choices for {q['id']}")
                self.assertTrue(1 <= q['difficulty'] <= 5, f"Difficulty out of range for {q['id']}")

    def test_03_student_session_lifecycle(self):
        policies = ['Q-Learning', 'DQN', 'Rule-Based', 'Random', 'Fixed-Difficulty']
        for policy in policies:
            # Start session
            start_res = self.client.post('/api/student/start_session', json={
                'topic': 'Linear Equations Graphs',
                'policy': policy
            })
            self.assertEqual(start_res.status_code, 200)
            data = start_res.json
            self.assertIn('session_id', data)
            self.assertIn('question', data)
            self.assertIn('choices', data)
            self.assertIn('difficulty', data)

            session_id = data['session_id']
            choice = data['choices'][0]

            # Submit answer
            sub_res = self.client.post('/api/student/submit_answer', json={
                'session_id': session_id,
                'answer': choice,
                'time_taken': 15.0,
                'hints_used': 0
            })
            self.assertEqual(sub_res.status_code, 200)
            sub_data = sub_res.json
            self.assertIn('correct', sub_data)
            self.assertIn('new_mastery', sub_data)
            self.assertIn('next_question', sub_data)
            self.assertIn('difficulty_direction', sub_data)

    def test_04_skill_parameters_and_icc(self):
        res = self.client.get('/api/skill_parameters')
        self.assertEqual(res.status_code, 200)
        data = res.json
        self.assertIn('theta_vals', data)
        self.assertIn('icc_data', data)
        self.assertTrue(len(data['icc_data']) > 0)

    def test_05_get_q_table(self):
        res = self.client.get('/api/get_q_table')
        self.assertEqual(res.status_code, 200)
        data = res.json
        self.assertIn('q_table', data)
        self.assertEqual(len(data['q_table']), 10)
        self.assertEqual(len(data['q_table'][0]), 5)

    def test_06_dkt_numpy_model(self):
        dkt = PureNumpyDKT(num_skills=4, hidden_dim=16)
        seq = [(0, 1), (1, 0), (2, 1), (0, 0)]
        preds, cache = dkt.forward_sequence(seq)
        self.assertEqual(preds.shape, (4, 4))
        self.assertEqual(len(cache["h_list"]), 5)  # h_0 + 4 steps

    def test_07_bkt_tracker(self):
        bkt = BKTTracker()
        p0 = bkt.get_mastery('Linear Equations Graphs')
        p1 = bkt.update('Linear Equations Graphs', is_correct=1)
        self.assertGreater(p1, p0)
        p2 = bkt.update('Linear Equations Graphs', is_correct=0)
        self.assertLess(p2, p1)

if __name__ == '__main__':
    unittest.main()
