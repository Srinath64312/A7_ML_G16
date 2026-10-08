"""
================================================================================
STEP 10: END-TO-END PIPELINE ORCHESTRATION & INFERENCE ENGINE
================================================================================
Goal:
  - Connect all 9 upstream ML components into an autonomous tutoring session:
      1. BKT Belief Tracking -> 2. RL Difficulty Selection -> 
      3. Problem Generation -> 4. Student Response -> 5. State & Reward Update
  - Provide an interactive multi-step simulation demo.
================================================================================
"""

import os
import random
import json
import numpy as np

# Sample Problem Database mapped to topics & difficulty levels
QUESTION_BANK = {
    "Linear Equations Graphs": {
        1: {
            "question": "What is the y-intercept of the line given by y = 3x + 5?",
            "options": ["(0, 5)", "(0, 3)", "(5, 0)", "(3, 5)"],
            "answer": "(0, 5)",
            "hint_1": "Recall the slope-intercept form y = mx + b.",
            "hint_2": "The y-intercept occurs where x = 0, giving y = b = 5.",
            "explanation": "In y = mx + b, b represents the y-intercept at coordinate (0, b)."
        },
        2: {
            "question": "Find the slope of the line passing through (2, 3) and (4, 11).",
            "options": ["4", "2", "8", "6"],
            "answer": "4",
            "hint_1": "Use the slope formula m = (y2 - y1) / (x2 - x1).",
            "hint_2": "m = (11 - 3) / (4 - 2) = 8 / 2.",
            "explanation": "m = (11 - 3) / (4 - 2) = 8 / 2 = 4."
        },
        3: {
            "question": "Which line is perpendicular to y = -1/2 x + 4?",
            "options": ["y = 2x - 1", "y = -2x + 3", "y = -1/2 x + 1", "y = 1/2 x + 4"],
            "answer": "y = 2x - 1",
            "hint_1": "Perpendicular lines have negative reciprocal slopes (m1 * m2 = -1).",
            "hint_2": "The negative reciprocal of -1/2 is +2.",
            "explanation": "Perpendicular slope is -1 / (-1/2) = +2."
        },
        4: {
            "question": "Solve the system: 2x + y = 7 and x - y = 2 for x.",
            "options": ["x = 3", "x = 4", "x = 2", "x = 5"],
            "answer": "x = 3",
            "hint_1": "Add both equations together to eliminate y.",
            "hint_2": "2x + x = 3x and 7 + 2 = 9, so 3x = 9.",
            "explanation": "Adding equations gives 3x = 9, so x = 3 and y = 1."
        },
        5: {
            "question": "What is the area of the triangle bounded by x = 0, y = 0, and 2x + 3y = 12?",
            "options": ["12", "6", "24", "18"],
            "answer": "12",
            "hint_1": "Find the x-intercept (where y=0) and y-intercept (where x=0).",
            "hint_2": "x-intercept is 6, y-intercept is 4. Area = 1/2 * base * height.",
            "explanation": "Base = 6, Height = 4. Area = 0.5 * 6 * 4 = 12 square units."
        }
    }
}

class IntelligentTutorSession:
    """End-to-end intelligent tutoring session manager."""
    def __init__(self, topic="Linear Equations Graphs"):
        self.topic = topic
        from step05_bayesian_knowledge_tracing import BKTTracker
        from step08_rl_agent_training import train_rl_agents
        
        self.bkt = BKTTracker(p_init=0.25, p_transit=0.15, p_slip=0.10, p_guess=0.20)
        self.rl_agent = train_rl_agents()
        self.history = []

    def get_recommended_question(self):
        # 1. State estimation
        current_mastery = self.bkt.p_l
        
        # 2. RL Action selection (0-4 mapped to Level 1-5)
        action = self.rl_agent.select_action(current_mastery, evaluation=True)
        difficulty_level = action + 1
        
        # 3. Retrieve problem
        topic_bank = QUESTION_BANK.get(self.topic, QUESTION_BANK["Linear Equations Graphs"])
        problem = topic_bank.get(difficulty_level, topic_bank[3])
        
        return difficulty_level, current_mastery, problem

    def submit_answer(self, difficulty_level: int, selected_option: str, problem_dict: dict):
        is_correct = int(selected_option == problem_dict["answer"])
        
        # 4. Bayesian Belief Update
        prior_mastery = self.bkt.p_l
        new_mastery = self.bkt.update(is_correct)
        
        # 5. Calculate Pedagogical Gain & Reward
        gain = max(0.0, new_mastery - prior_mastery)
        norm_diff = (difficulty_level - 1) / 4.0
        gap = abs(prior_mastery - norm_diff)
        reward = 1.6 * gain + 0.4 * is_correct + 0.5 * 0.8 - 0.25 * (gap ** 2)
        
        record = {
            "difficulty": difficulty_level,
            "is_correct": is_correct,
            "prior_mastery": prior_mastery,
            "new_mastery": new_mastery,
            "reward": reward
        }
        self.history.append(record)
        return record

def run_pipeline_demo():
    print("=" * 70)
    print("STEP 10: END-TO-END INTELLIGENT TUTORING PIPELINE DEMO")
    print("=" * 70)

    session = IntelligentTutorSession(topic="Linear Equations Graphs")
    print(f"\n[SESSION] Initialized Intelligent Tutoring Session for Topic: '{session.topic}'")
    print(f"   Initial BKT Mastery Belief: {session.bkt.p_l * 100:.1f}%\n")

    # Simulate 4 interactive solving rounds
    for round_num in range(1, 5):
        diff_level, mastery, problem = session.get_recommended_question()
        print(f"--- [ROUND {round_num}] ---")
        print(f"[STATE] Current Mastery Belief P(L): {mastery * 100:.1f}%")
        print(f"[ACTION] RL Selected Optimal Difficulty: Level {diff_level} / 5")
        print(f"[QUESTION] Problem: {problem['question']}")
        print(f"   Options: {', '.join(problem['options'])}")
        
        # Simulate simulated student answer (80% chance of correct)
        chosen = problem["answer"] if random.random() < 0.80 else problem["options"][0]
        print(f"[RESPONSE] Student Answer: '{chosen}'")
        
        res = session.submit_answer(diff_level, chosen, problem)
        status = "[CORRECT]" if res["is_correct"] else "[INCORRECT]"
        print(f"[EVALUATION] Result: {status}")
        print(f"[UPDATE] New Mastery Belief: {res['new_mastery'] * 100:.1f}% (+{res['new_mastery'] - res['prior_mastery']:.3f})")
        print(f"[REWARD] Step Reward: {res['reward']:.3f}\n")

    # Plot Live Session Trajectory
    try:
        import matplotlib.pyplot as plt
        plots_dir = os.path.join(BASE_DIR, "data", "output_plots")
        os.makedirs(plots_dir, exist_ok=True)

        mastery_history = [0.25] + [r["new_mastery"] for r in session.history]
        difficulty_history = [r["difficulty"] for r in session.history]
        rewards_history = [r["reward"] for r in session.history]

        fig, ax1 = plt.subplots(figsize=(10, 5))

        color = '#4f46e5'
        ax1.set_xlabel('Question Sequence Attempt', fontsize=11)
        ax1.set_ylabel('BKT Mastery Probability P(L_t)', color=color, fontsize=11)
        ax1.plot(mastery_history, marker='o', color=color, lw=2.5, label='Mastery Probability P(L_t)')
        ax1.tick_params(axis='y', labelcolor=color)
        ax1.set_ylim(0, 1.05)
        ax1.grid(True, linestyle='--', alpha=0.5)

        ax2 = ax1.twinx()
        color = '#f59e0b'
        ax2.set_ylabel('RL Selected Difficulty Tier (1 to 5)', color=color, fontsize=11)
        ax2.step(range(1, len(difficulty_history) + 1), difficulty_history, where='mid', color=color, lw=2.5, linestyle='--', label='RL Difficulty Level')
        ax2.tick_params(axis='y', labelcolor=color)
        ax2.set_ylim(0.5, 5.5)

        plt.title('Live Interactive Tutoring Session - Mastery Tracking & RL Adaptation', fontsize=13, fontweight='bold')
        fig.tight_layout()
        plot_path = os.path.join(plots_dir, "step10_live_session_trajectory.png")
        plt.savefig(plot_path, dpi=150)
        print(f"[OK] Live Session Trajectory Plot saved to:\n   {plot_path}")
        plt.close()
    except Exception as e:
        print(f"[NOTE] Plot generation skipped: {e}")

    print("=" * 70)
    print("[SUCCESS] FULL 10-STEP MACHINE LEARNING PIPELINE COMPLETED!")
    print("=" * 70)

if __name__ == "__main__":
    run_pipeline_demo()