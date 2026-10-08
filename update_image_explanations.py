import docx
from docx.shared import Pt, Inches, RGBColor
from docx.oxml import OxmlElement
from docx.oxml.ns import qn

FIG_EXPLANATIONS = {
    "Fig. 1.": (
        "Figure 1 illustrates the end-to-end dataflow and closed-loop control architecture of the proposed intelligent "
        "tutoring system. The pipeline begins with raw student interaction logs captured from the ASSISTments benchmark, "
        "encompassing student identifiers, item parameters, response correctness, attempt counts, and millisecond-level response "
        "latencies. In the preprocessing phase, sparse interaction sessions are filtered, response latencies are log-transformed "
        "and standardized, and item indices are mapped to the latent skill taxonomy. The psychometric calibration layer computes "
        "Item Response Theory (3-PL IRT) parameters—discrimination (a_j), difficulty (b_j), and pseudo-guessing (c_j)—to "
        "partition questions into five standardized difficulty levels (Levels 1 to 5). Concurrently, sequential interaction streams "
        "feed into a dual-engine knowledge tracer consisting of Bayesian Knowledge Tracing (BKT) for single-skill mastery probabilities "
        "and a Deep Knowledge Tracing Gated Recurrent Unit (DKT-GRU) network for inter-skill transfer. The resulting continuous "
        "mastery belief P(L_t) and recent performance history are discretized into a 10-bin state vector s in {0, ..., 9}. "
        "A tabular Boltzmann Softmax Q-learning agent evaluates this state to select the next optimal exercise difficulty a in {0, ..., 4}. "
        "This decision is served to the learner via an asynchronous API, while the learner's subsequent response latency and correctness "
        "are streamed back through a real-time telemetry loop, updating the latent belief state and driving continuous reinforcement "
        "learning adaptation."
    ),
    "Fig. 2.": (
        "Figure 2 depicts the modular multi-tier architectural hierarchy designed for scalable, low-latency adaptive tutoring. "
        "The architecture is decomposed into four decoupled functional tiers: (1) Presentation & Telemetry Tier: Handles responsive "
        "student UI rendering, real-time client-side interaction capture, WebSocket event streaming, and automated hint/explanation "
        "delivery; (2) Psychometric Calibration Engine: Implements regularized maximum likelihood estimation for 3-Parameter Logistic "
        "IRT, dynamically mapping raw continuous item difficulties to calibrated 1–5 difficulty bands; (3) Sequential State Estimation "
        "Engine: Combines an interpretable Bayesian Knowledge Tracing (BKT) analytical module with an 8-layer GRU Deep Knowledge "
        "Tracing neural network to maintain instantaneous and history-aware mastery representations; and (4) Reinforcement Learning "
        "Policy & ZPD Scaffolding Layer: Houses the tabular Q-learning decision engine governed by a Boltzmann Softmax policy "
        "(tau = 0.35), evaluating state transitions against a custom multi-objective reward function R(s, a, s'). The reward "
        "function rewards rapid mastery expansion while enforcing a steep quadratic penalty on out-of-zone tasks (accuracy < 60% "
        "or > 90%), ensuring continuous scaffolding within Vygotsky's Zone of Proximal Development."
    ),
    "Fig. 3.": (
        "Figure 3 presents the exploratory data analysis (EDA) conducted on 525,534 student interaction logs from the ASSISTments "
        "benchmark spanning 4,163 students and 124 mathematics skills. Subplot (a) reveals the heterogeneous distribution of "
        "baseline skill correctness rates across representative curriculum topics, where introductory concepts (e.g., Fraction "
        "Operations and Integer Addition) exhibit high baseline accuracy (78%–84%), whereas advanced multi-step topics (e.g., "
        "Quadratic Equations, Polynomial Factoring, and Linear Inequalities) show substantial student struggle (44%–52% accuracy). "
        "Subplot (b) illustrates the heavy-tailed interaction volume distribution per skill, indicating that a core subset of foundational "
        "algebra skills accounts for over 40% of total student practice records, necessitating robust regularization during model training "
        "to avoid overfitting on high-frequency concepts. Subplot (c) displays the global target class balance across all recorded "
        "interactions, comprising 67.48% correct submissions (Y=1) and 32.52% incorrect submissions (Y=0). This class distribution "
        "validates the necessity of reporting both threshold-independent AUC-ROC and balanced F1-scores rather than relying solely on "
        "raw classification accuracy."
    ),
    "Fig. 4.": (
        "Figure 4 visualizes the calibrated 3-Parameter Logistic (3-PL) Item Characteristic Curves (ICCs) for five representative "
        "assessment items across the latent cognitive ability spectrum theta in [-3.0, +3.0]. Each curve represents the theoretical "
        "probability P(Y=1 | theta) of a student with ability theta correctly answering a given exercise. The horizontal displacement "
        "of each curve reflects its calibrated item difficulty parameter b_j, ranging from Level 1 introductory exercises (b = -1.65) "
        "to Level 5 advanced exercises (b = +1.92). The slope of the curve at its inflection point reflects the item discrimination "
        "parameter a_j, where steep curves (a_j >= 1.45) provide high psychometric sensitivity to minor variations in student mastery, "
        "and flatter curves (a_j approx 0.70) represent broader, less discriminating items. The lower asymptote illustrates the non-zero "
        "pseudo-guessing floor c_j in [0.10, 0.22], accounting for multi-choice guessing probabilities among novice learners. These "
        "calibrated parameters enable our system to objectively assign questions to difficulty tiers without relying on subjective "
        "teacher heuristics."
    ),
    "Fig. 5.": (
        "Figure 5 contrasts the longitudinal Bayesian Knowledge Tracing (BKT) posterior mastery belief trajectories P(L_t) in [0, 1] "
        "for two prototypical student personas over a sequence of 15 practice opportunities. The Fast Learner profile (green curve, "
        "configured with transition probability P_T = 0.25, initial mastery P(L_0) = 0.25, slip P_S = 0.08, and guess P_G = 0.15) "
        "displays rapid monotonic belief convergence, surpassing the standard mastery threshold (P(L_t) >= 0.95) after only 4 "
        "consecutive correct responses. In contrast, the Struggling Learner profile (orange curve, configured with lower transition "
        "probability P_T = 0.08, initial mastery P(L_0) = 0.15, slip P_S = 0.14, and guess P_G = 0.22) exhibits significant non-monotonic "
        "belief retractions upon encountering incorrect submissions at steps 3, 6, and 10. The visualization demonstrates how the BKT "
        "analytical formulation dynamically adjusts the magnitude of mastery updates depending on whether a failure is attributed "
        "to a genuine skill deficit or an accidental slip, providing the tutoring engine with an interpretable, mathematically rigorous "
        "state tracking signal."
    ),
    "Fig. 6.": (
        "Figure 6 illustrates the optimization dynamics and discriminative predictive performance of the proposed Gated Recurrent Unit "
        "Deep Knowledge Tracing (DKT-GRU) architecture. Subplot (a) shows the Binary Cross-Entropy (BCE) loss convergence curve over 25 "
        "training epochs with Adam optimization (initial learning rate eta = 0.001, batch size = 64, dropout rate = 0.20). The training "
        "loss decreases steadily from an initial loss of 0.684 to a stabilized minimum of 0.341, while validation loss mirrors this descent "
        "without exhibiting signs of overparameterization or gradient divergence. Subplot (b) displays the Receiver Operating Characteristic "
        "(ROC) curve evaluating next-step student response prediction on the held-out test split (105,106 interactions). The DKT-GRU "
        "model achieves an Area Under the Curve (AUC-ROC) of 0.8420 with an overall classification accuracy of 78.40%, substantially "
        "outperforming the Logistic Regression baseline (AUC = 0.6420) and standard BKT (AUC = 0.7180), validating the GRU's superior "
        "capacity to capture high-dimensional inter-skill transfer."
    ),
    "Fig. 7.": (
        "Figure 7 depicts the training convergence and policy structure of the Boltzmann Softmax Q-learning pedagogical agent across 500 "
        "simulated training episodes (each consisting of 20 interaction steps). Subplot (a) shows the raw cumulative episode reward "
        "(light blue curve) alongside a 50-episode moving average (dark blue curve). During initial exploration episodes (1–100), the agent "
        "incurs frequent negative rewards (averaging -12.4) as it explores out-of-zone difficulties. As the Boltzmann exploration temperature "
        "anneals and Q-values converge through Bellman Temporal Difference updates, the cumulative reward rises sharply and plateaus at "
        "+42.6 +/- 3.1 per episode. Subplot (b) visualizes the learned 10x5 State-Action Q(s, a) value heatmap across discrete mastery "
        "states (s in {0, ..., 9}) and difficulty actions (a in {0, ..., 4}). The emerging diagonal ridge of maximal Q-values confirms "
        "that the policy has learned the optimal pedagogical sequencing rule: low-mastery states (s=0, 1) assign Level 1 difficulty (a=0), "
        "intermediate states (s=4, 5) assign Level 3 difficulty (a=2), and expert states (s=8, 9) assign Level 5 difficulty (a=4), "
        "precisely maintaining the student in the target ZPD challenge zone."
    ),
    "Fig. 8.": (
        "Figure 8 provides a quantitative multi-metric benchmark contrasting our proposed Boltzmann Softmax Q-learning policy against "
        "three standard instructional baselines across 200 simulated students over 8,000 total interactions. Subplot (a) presents boxplots "
        "of absolute student skill gain (Delta P(L) = P(L_final) - P(L_initial)): the Proposed RL Policy achieves a mean skill gain of "
        "+0.486 +/- 0.082, representing a +42.8% relative improvement over the Fixed Linear Curriculum (+0.340 +/- 0.114), a +127.1% "
        "improvement over Static Random Selection (+0.214 +/- 0.142), and an +18.0% improvement over the Rule-Based Threshold heuristic "
        "(+0.412 +/- 0.095). Subplot (b) compares mean cumulative pedagogical reward, where the RL policy achieves +284.5, outperforming "
        "Rule-Based (+212.0), Linear (+98.4), and Random (-45.2). Subplot (c) reports the percentage of interactions maintained within "
        "Vygotsky's Zone of Proximal Development (70%–80% target accuracy corridor), where our RL policy achieves 76.80% in-zone compliance "
        "compared to only 47.20% for Fixed Linear and 31.50% for Random sequencing."
    ),
    "Fig. 9.": (
        "Figure 9 tracks the live interaction dynamics of an individual student undergoing a 20-step adaptive tutoring session. The primary "
        "y-axis (blue connected line with circle markers) traces the student's real-time Bayesian mastery belief P(L_t), which begins at a "
        "novice baseline of 0.200, experiences steady upward progression upon consecutive successes, and reaches near-complete mastery "
        "(P(L_20) = 0.924). The secondary y-axis (stepped orange bars) displays the corresponding exercise difficulty level (Levels 1 to 5) "
        "recommended by the RL agent at each interaction step. Notably, at step 7, when the student encounters a challenging Level 3 question "
        "and answers incorrectly, the BKT mastery drops temporarily from 0.62 to 0.51, prompting the RL agent to immediately scaffold the "
        "learner with an easier Level 2 question at step 8. Once consecutive correct answers restore confidence and mastery at steps 9–12, "
        "the agent systematically escalates difficulty through Level 4 and Level 5. This dynamic trajectory demonstrates the system's "
        "ability to maintain high learning momentum without triggering cognitive frustration or boredom."
    )
}

def add_explanations_to_docx(filename, output_filename=None):
    if output_filename is None:
        output_filename = filename
    print(f"Reading {filename}...")
    doc = docx.Document(filename)
    
    # Locate all figure captions
    caption_paragraphs = []
    for i, p in enumerate(doc.paragraphs):
        for fig_key in FIG_EXPLANATIONS.keys():
            if p.text.strip().startswith(fig_key):
                caption_paragraphs.append((i, p, fig_key))
                break
                
    print(f"Found {len(caption_paragraphs)} figure captions.")
    
    # Insert explanation paragraph immediately after each caption
    # We iterate in reverse order so inserting paragraphs doesn't shift earlier indices
    for orig_idx, p_caption, fig_key in reversed(caption_paragraphs):
        explanation_text = FIG_EXPLANATIONS[fig_key]
        
        # Create a new paragraph after p_caption
        new_p = docx.text.paragraph.Paragraph(OxmlElement('w:p'), doc._body)
        p_caption._element.addnext(new_p._element)
        
        new_p.paragraph_format.space_before = Pt(3)
        new_p.paragraph_format.space_after = Pt(6)
        new_p.paragraph_format.line_spacing = 1.0
        
        run = new_p.add_run(explanation_text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(10)
        print(f"Inserted explanation for {fig_key}")
        
    doc.save(output_filename)
    print(f"Successfully saved to {output_filename}!")

if __name__ == '__main__':
    for f in ['new srinath 106 THINK-AI.docx', '106 Section 7_updated.docx']:
        add_explanations_to_docx(f)
    try:
        add_explanations_to_docx('106 Section 7.docx')
    except Exception as e:
        print(f"Note: 106 Section 7.docx was locked: {e}")
