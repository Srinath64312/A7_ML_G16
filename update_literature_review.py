import docx
from docx.shared import Pt, Inches, RGBColor
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import copy

TABLE_DATA = [
    [
        "No.", "Title of Paper", "Novelty", "Benefit", "Algorithm Used"
    ],
    [
        "1.",
        "Knowledge Tracing: Procedural Knowledge (Corbett & Anderson, 1994)",
        "Formulated the classic two-state Hidden Markov Model tracking latent mastery with slip and guess parameters.",
        "Provides transparent, mathematically interpretable per-skill mastery updates.",
        "Bayesian Knowledge Tracing (BKT) with EM parameter fitting"
    ],
    [
        "2.",
        "Statistical Theories of Mental Test Scores (Birnbaum / Lord & Novick, 1968)",
        "Introduced latent trait psychometrics relating learner ability to item discrimination, difficulty, and guessing.",
        "Accurately calibrates problem difficulty independently of student cohort distributions.",
        "3-Parameter Logistic (3-PL) IRT with regularized gradient descent"
    ],
    [
        "3.",
        "AutoTutor: Mixed-Initiative Dialogue (Graesser et al., 2005)",
        "Pioneered conversational intelligent tutoring combining latent semantic analysis and mixed-initiative dialogue scaffolding.",
        "Enhances learner engagement and conceptual understanding through interactive Socratic dialogue turns.",
        "Latent Semantic Analysis (LSA) with Mixed-Initiative Dialogue Rules"
    ],
    [
        "4.",
        "RL for Tutoring Dialogue Systems (Chi et al., 2011)",
        "Modeled pedagogical decision-making in intelligent tutors as a Markov Decision Process trained on student logs.",
        "Discovers empirical, data-driven pedagogical policies that statistically enhance post-test learning gains.",
        "Empirical Reinforcement Learning (Q-Learning / Policy Iteration)"
    ],
    [
        "5.",
        "Deep Knowledge Tracing (Piech et al., 2015)",
        "First utilized recurrent neural networks (RNN/LSTM) to model student knowledge over extended interaction trajectories.",
        "Captures complex non-linear multi-skill relationships and temporal dynamics without manual prerequisite graphs.",
        "Recurrent Neural Networks (RNN / LSTM) with BPTT"
    ],
    [
        "6.",
        "Faster Teaching via POMDP Planning (Rafferty et al., 2016)",
        "Formulated automated instructional pacing and pedagogical scaffolding as a Partially Observable Markov Decision Process.",
        "Minimizes practice duration required for learners to reach prescribed mastery thresholds.",
        "POMDP Planning with Value Iteration and Bayesian State Beliefs"
    ],
    [
        "7.",
        "Dynamic Key-Value Memory Networks (Zhang et al., 2017)",
        "Separated static concept representations (Key matrix) from dynamically updated mastery states (Value matrix).",
        "Enhances model interpretability and enables fine-grained tracking across multi-concept assessment items.",
        "Dynamic Key-Value Memory Networks (DKVMN) with Memory Attention"
    ],
    [
        "8.",
        "Learning to Teach (Fan et al., 2018)",
        "Formulated teaching as a bi-level reinforcement learning problem where an RL teacher selects data for a learner model.",
        "Accelerates learner convergence and knowledge acquisition over heuristic and static curriculum baselines.",
        "Actor-Critic Policy Gradient Reinforcement Learning"
    ],
    [
        "9.",
        "A Self-Attentive Model for KT (Pandey & Karypis, 2019)",
        "Introduced Transformer self-attention to relate current exercise responses directly to relevant past interaction events.",
        "Prevents vanishing gradients across long sequences and enables high-throughput parallel training.",
        "Self-Attentive Knowledge Tracing (SAKT) with Scaled Dot-Product Attention"
    ],
    [
        "10.",
        "EdNet: Large-Scale Dataset in Education (Choi et al., 2020)",
        "Released a massive multi-turn benchmark containing over 131 million student interactions from 784,000 learners.",
        "Establishes a standardized dataset for benchmarking knowledge tracing, response latency, and adaptive policies.",
        "Hierarchical Educational Data Mining & Trajectory Analytics"
    ],
    [
        "11.",
        "Context-Aware Attentive KT (Ghosh, Heffernan & Lan, 2020)",
        "Combined context-aware attention with cognitive exponential decay functions to model question similarity and forgetting.",
        "Boosts prediction accuracy on standard benchmarks while preserving temporal recency sensitivity.",
        "Context-Aware Attentive Knowledge Tracing (AKT) with Psychometric Decay"
    ],
    [
        "12.",
        "Knowledge Tracing: A Survey (Abdelrahman, Wang & Nunes, 2023)",
        "Conducted a comprehensive taxonomy of KT paradigms across probabilistic, deep, memory, and graph models.",
        "Pinpoints key open challenges including lack of interpretability and disconnection from downstream pedagogical action.",
        "Systematic Taxonomical Meta-Evaluation & Synthesis"
    ],
    [
        "13.",
        "Doubly Constrained Offline RL for Learning Paths (Yun et al., 2024)",
        "Applied offline RL with dual constraints to eliminate policy distribution shift and extrapolation errors on historical logs.",
        "Ensures stable, safe pedagogical difficulty recommendations without catastrophic policy collapse.",
        "Doubly Constrained Conservative Q-Learning (CQL) / Offline RL"
    ],
    [
        "14.",
        "Generating In-Context Feedback with LLMs (Reddig, Arora & MacLellan, 2025)",
        "Utilized few-shot prompting with LLMs to diagnose misconception patterns and generate adaptive Socratic hints.",
        "Delivers tailored natural language feedback without requiring manual authoring of rule templates.",
        "In-Context Learning & Few-Shot Prompt Optimization with LLMs"
    ],
    [
        "15.",
        "Joint DRL & KT for Learning Paths (Zhao et al., 2026)",
        "Proposed end-to-end joint optimization uniting Deep Knowledge Tracing state estimation with Deep Q-Network sequencing.",
        "Outperforms decoupled pipelines by aligning latent knowledge representations directly with pedagogical reward signals.",
        "Joint DKT-DQN Optimization with Multi-Task Loss & Experience Replay"
    ]
]

GISTS_DATA = [
    (
        "1", "Corbett & Anderson (1994) – Bayesian Knowledge Tracing (BKT)",
        "Introduced Bayesian Knowledge Tracing using a two-state Hidden Markov Model to mathematically estimate latent student mastery from sequential problem responses.",
        "Established interpretable per-skill tracking by decomposing observations into initial mastery, learning transition, slip, and guess probabilities.",
        "Serves as our framework's baseline psychometric engine for interpretable single-skill tracking, overcoming its skill-independence limitation via joint deep models."
    ),
    (
        "2", "Birnbaum (1968) / Lord & Novick (1968) – 3-Parameter Logistic IRT",
        "Formulated latent trait psychometric calibration modeling student success as a logistic function of ability, discrimination, difficulty, and pseudo-guessing.",
        "Decoupled item calibration from specific student sample distributions, enabling objective and standardized difficulty measurement across diverse question pools.",
        "Directly provides the mathematical foundation for calibrating our question bank into 5 distinct difficulty levels aligned with student latent abilities."
    ),
    (
        "3", "Graesser et al. (2005) – AutoTutor: Mixed-Initiative Dialogue",
        "Pioneered conversational intelligent tutoring through AutoTutor, utilizing latent semantic analysis and scripted mixed-initiative dialogue turns.",
        "Demonstrated that interactive dialogue-driven scaffolding significantly outperforms static textbook and unidirectional e-learning instruction.",
        "Highlights the necessity of combining conversational pedagogical feedback with dynamic underlying cognitive student models in modern AI tutors."
    ),
    (
        "4", "Chi et al. (2011) – Reinforcement Learning for Tutorial Dialogue",
        "Formulated pedagogical decision-making in intelligent tutors as a Markov Decision Process trained directly on empirical student interaction logs.",
        "Demonstrated that reinforcement learning agents discover non-intuitive pedagogical policies that achieve statistically higher student learning gains than hand-crafted rules.",
        "Informs our RL agent's state-action formalization for selecting exercise difficulty to maximize longitudinal knowledge acquisition."
    ),
    (
        "5", "Piech et al. (2015) – Deep Knowledge Tracing (DKT)",
        "Introduced Deep Knowledge Tracing, employing recurrent neural networks (RNNs/LSTMs) to model student mastery across sequential practice sessions.",
        "Achieved substantial predictive gains over classical BKT (AUC improvement of ~0.10) by automatically learning inter-skill transfer without manual dependency graphs.",
        "Forms the core sequential tracking backbone of our system, implemented via a high-efficiency Gated Recurrent Unit (DKT-GRU) network."
    ),
    (
        "6", "Rafferty et al. (2016) – Faster Teaching via POMDP Planning",
        "Formulated personalized instructional pacing as a Partially Observable Markov Decision Process (POMDP) where student knowledge states are latent.",
        "Proved mathematically and empirically that belief-state planning accelerates student time-to-mastery compared to static curriculum ordering.",
        "Inspires our formulation of the continuous mastery belief state as the foundation for our reinforcement learning reward and action-selection policy."
    ),
    (
        "7", "Zhang et al. (2017) – Dynamic Key-Value Memory Networks (DKVMN)",
        "Proposed Dynamic Key-Value Memory Networks, decoupling static concept representations from dynamically updated student mastery values.",
        "Provided fine-grained interpretability into multi-concept exercises while outperforming traditional DKT in predictive accuracy across standard benchmarks.",
        "Validates the importance of maintaining separated, explicit skill-state vectors alongside continuous latent representations for robust curriculum sequencing."
    ),
    (
        "8", "Fan et al. (2018) – Learning to Teach",
        "Conceptualized pedagogical curriculum sequencing as a bi-level reinforcement learning framework where an AI teacher optimizes exercises for a learning agent.",
        "Showed that dynamic RL-guided training instance selection significantly accelerates learner model convergence over heuristic scheduling baselines.",
        "Provides theoretical justification for using closed-loop reinforcement learning to choose optimal exercise difficulties based on real-time learner states."
    ),
    (
        "9", "Pandey & Karypis (2019) – Self-Attentive Knowledge Tracing (SAKT)",
        "Introduced Self-Attentive Knowledge Tracing, using Transformer multi-head self-attention to capture historical interaction dependencies.",
        "Achieved competitive predictive accuracy with substantially faster training times compared to recurrent LSTM-based knowledge tracing architectures.",
        "Emphasizes the significance of attention mechanisms in modeling long-term student learning histories, motivating our multi-signal state representations."
    ),
    (
        "10", "Choi et al. (2020) – EdNet Benchmark Dataset",
        "Released EdNet, an unprecedented benchmark dataset containing over 131 million hierarchical student interactions from 784,000 learners on an AI platform.",
        "Provided comprehensive multi-modal data including response times, hint requests, and purchase behavior across diverse learning trajectories.",
        "Establishes the empirical necessity for evaluating knowledge tracing and RL policies on large-scale, real-world educational interaction datasets."
    ),
    (
        "11", "Ghosh, Heffernan & Lan (2020) – Context-Aware Attentive KT (AKT)",
        "Proposed Context-Aware Attentive Knowledge Tracing, combining distance-aware attention mechanisms with psychometric cognitive decay functions.",
        "Achieved state-of-the-art AUC scores on ASSISTments by weighting both contextual question similarity and temporal forgetting intervals.",
        "Demonstrates the critical value of incorporating response latency and recency effects into knowledge estimation, which we embed into our DKT-GRU inputs."
    ),
    (
        "12", "Abdelrahman, Wang & Nunes (2023) – Comprehensive KT Survey",
        "Published a comprehensive survey categorizing knowledge tracing models across probabilistic, deep recurrent, memory-augmented, and graph neural architectures.",
        "Identified key structural limitations in existing literature, specifically the disconnect between passive predictive models and proactive instructional actions.",
        "Directly informs our architecture's mission to bridge the gap between deep knowledge estimation and closed-loop reinforcement learning decision-making."
    ),
    (
        "13", "Yun et al. (2024) – Doubly Constrained Offline Reinforcement Learning",
        "Applied doubly constrained offline reinforcement learning to learning path recommendation, eliminating policy extrapolation errors on logged datasets.",
        "Demonstrated that constraining policy drift yields stable, safe pedagogical trajectories that outperform standard unconstrained Q-learning on historical logs.",
        "Validates our design of bounded state discretization and Boltzmann Softmax exploration to maintain stable, pedagogically sound difficulty transitions."
    ),
    (
        "14", "Reddig, Arora & MacLellan (2025) – In-Context Feedback with LLMs",
        "Evaluated large language models for generating real-time, in-context pedagogical feedback and error diagnosis in intelligent tutoring systems.",
        "Confirmed that contextual student history conditioning prevents LLMs from revealing direct answers while delivering constructive Socratic hints.",
        "Highlights the complementary role of generative feedback alongside quantitative difficulty recommendation in complete end-to-end intelligent tutoring."
    ),
    (
        "15", "Zhao et al. (2026) – Joint Optimization of DRL and Knowledge Tracing",
        "Developed an integrated framework jointly optimizing deep knowledge tracing state estimation and deep reinforcement learning exercise recommendations.",
        "Achieved superior student mastery acceleration and reward convergence compared to isolated, decoupled recommendation pipelines.",
        "Directly aligns with our proposed unified framework integrating 3-PL IRT psychometrics, DKT-GRU sequential estimation, and Boltzmann Softmax Q-learning."
    )
]

REFERENCES_DATA = [
    "[1] Corbett, A.T., Anderson, J.R.: Knowledge Tracing: Modeling the Acquisition of Procedural Knowledge. User Modeling and User-Adapted Interaction 4(4), 253–278 (1994)",
    "[2] Birnbaum, A.: Some Latent Trait Models and Their Use in Inferring an Examinee's Ability. In: Lord, F.M., Novick, M.R. (eds.) Statistical Theories of Mental Test Scores, pp. 397–479. Addison-Wesley, Reading (1968)",
    "[3] Graesser, A.C., Chipman, P., Haynes, B.C., Olney, A.: AutoTutor: An Intelligent Tutoring System with Mixed-Initiative Dialogue. IEEE Transactions on Education 48(4), 612–618 (2005)",
    "[4] Chi, M., VanLehn, K., Litman, D., Jordan, P.: An Evaluation of Empirically Derived Policy in a Tutorial Dialogue System. In: Proceedings of the 15th International Conference on Artificial Intelligence in Education (AIED 2011), pp. 43–50. Springer, Berlin (2011)",
    "[5] Piech, C., Bassen, J., Huang, J., Ganguli, S., Sahami, M., Guibas, L.J., Sohl-Dickstein, J.: Deep Knowledge Tracing. In: Advances in Neural Information Processing Systems (NeurIPS 2015), vol. 28, pp. 505–513. Curran Associates, Inc. (2015)",
    "[6] Rafferty, A.N., Brunskill, E., Griffiths, T.L., Shafto, P.: Faster Teaching via POMDP Planning. Cognitive Science 40(6), 1290–1332 (2016)",
    "[7] Zhang, J., Shi, X., King, I., Yeung, D.Y.: Dynamic Key-Value Memory Networks for Knowledge Tracing. In: Proceedings of the 26th International Conference on World Wide Web (WWW 2017), pp. 765–774 (2017)",
    "[8] Fan, Y., Tian, F., Qin, T., Li, X.Y., Liu, T.Y.: Learning to Teach. In: Proceedings of the 6th International Conference on Learning Representations (ICLR 2018), pp. 1–15 (2018)",
    "[9] Pandey, S., Karypis, G.: A Self-Attentive Model for Knowledge Tracing. In: Proceedings of the 12th International Conference on Educational Data Mining (EDM 2019), pp. 384–389 (2019)",
    "[10] Choi, Y., Lee, Y., Cho, J., Baek, J., Kim, B., Cha, Y., Shin, D., Bae, C., Heo, J.: EdNet: A Large-Scale Hierarchical Dataset in Education. In: Proceedings of the 21st International Conference on Artificial Intelligence in Education (AIED 2020), pp. 69–73. Springer, Cham (2020)",
    "[11] Ghosh, A., Heffernan, N., Lan, A.S.: Context-Aware Attentive Knowledge Tracing. In: Proceedings of the 26th ACM SIGKDD International Conference on Knowledge Discovery and Data Mining (KDD 2020), pp. 2330–2339 (2020)",
    "[12] Abdelrahman, G., Wang, Q., Nunes, B.: Knowledge Tracing: A Survey. ACM Computing Surveys 55(11), 1–37 (2023)",
    "[13] Yun, H., Zhao, X., Wang, Y., Sun, J.: Doubly Constrained Offline Reinforcement Learning for Learning Path Recommendation. Knowledge-Based Systems 284, 111246 (2024)",
    "[14] Reddig, J., Arora, A., MacLellan, C.J.: Generating In-Context, Personalized Feedback for Intelligent Tutors with Large Language Models. International Journal of Artificial Intelligence in Education 35(1), 112–139 (2025)",
    "[15] Zhao, L., Zhang, M., Liu, H., Chen, X.: Personalized Learning Path Recommendation Based on Joint Optimization of Deep Reinforcement Learning and Knowledge Tracing. Scientific Reports 16, 2845 (2026)"
]

def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = tcPr.first_child_found_in('w:tcBorders')
    if tcBorders is None:
        tcBorders = OxmlElement('w:tcBorders')
        tcPr.append(tcBorders)
    for edge, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        if val is not None:
            edge_el = OxmlElement(f'w:{edge}')
            edge_el.set(qn('w:val'), val.get('val', 'single'))
            edge_el.set(qn('w:sz'), str(val.get('sz', 4)))
            edge_el.set(qn('w:space'), '0')
            edge_el.set(qn('w:color'), val.get('color', '000000'))
            tcBorders.append(edge_el)

def set_cell_margins(cell, top=100, bottom=100, left=80, right=80):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for edge, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{edge}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def update_document(filename):
    print(f"Processing {filename}...")
    doc = docx.Document(filename)
    
    # 1. Update Table 0
    t = doc.tables[0]
    
    # Remove existing rows in t
    while len(t.rows) > 0:
        p = t.rows[0]._tr
        t._tbl.remove(p)
        
    col_widths = [320040, 1051560, 1051560, 960120, 960120] # dxa
    
    for r_idx, row_data in enumerate(TABLE_DATA):
        row = t.add_row()
        trPr = row._tr.get_or_add_trPr()
        jc = OxmlElement('w:jc')
        jc.set(qn('w:val'), 'center')
        trPr.append(jc)
        
        is_header = (r_idx == 0)
        is_last = (r_idx == len(TABLE_DATA) - 1)
        
        for c_idx, cell_value in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.width = col_widths[c_idx]
            
            # borders
            if is_header:
                set_cell_borders(cell, top={'val': 'single', 'sz': 12}, bottom={'val': 'single', 'sz': 6})
            elif is_last:
                set_cell_borders(cell, bottom={'val': 'single', 'sz': 12})
            else:
                pass # interior rows no borders
                
            set_cell_margins(cell, top=80, bottom=80, left=60, right=60)
            
            p = cell.paragraphs[0]
            p.text = ""
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            p.paragraph_format.line_spacing = 1.0
            
            run = p.add_run(cell_value)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(8.5)
            if is_header:
                run.bold = True
                
    # 2. Update Literature Review intro and Gists
    # Let's find Section 2 paragraphs and replace / insert appropriately
    # Let's inspect the paragraphs around section 2
    body = doc._body._element
    
    # Find paragraph indices
    p_sec2_idx = None
    p_sec3_idx = None
    p_ref_idx = None
    
    for i, p in enumerate(doc.paragraphs):
        text_strip = p.text.strip()
        if text_strip == "2 Literature Review" or text_strip.startswith("2 Literature Review"):
            p_sec2_idx = i
        elif text_strip == "3 Proposed Methodology" or text_strip.startswith("3 Proposed Methodology"):
            p_sec3_idx = i
        elif text_strip == "References" or text_strip.startswith("References"):
            p_ref_idx = i
            
    print(f"Found Section 2 at P{p_sec2_idx}, Section 3 at P{p_sec3_idx}, References at P{p_ref_idx}")
    
    # Update Section 2 intro paragraph (p_sec2_idx + 1)
    p_intro = doc.paragraphs[p_sec2_idx + 1]
    p_intro.text = (
        "Educational data mining (EDM) and intelligent tutoring systems (ITS) have evolved across three foundational methodological "
        "paradigms: psychometric test theory, probabilistic and deep sequential knowledge tracing, and reinforcement learning for instructional planning. "
        "Early psychometric frameworks established latent trait models for item calibration, while Bayesian Knowledge Tracing introduced interpretable "
        "single-skill belief updates. Subsequent deep recurrent and attention architectures substantially improved mastery prediction across multi-skill "
        "interaction sequences. Concurrently, reinforcement learning and POMDP formulations transformed pedagogical sequencing from static heuristic delivery "
        "into dynamic sequential decision-making. Table 1 summarizes fifteen foundational and contemporary works that directly ground the architecture "
        "of our proposed closed-loop intelligent tutoring framework."
    )
    for r in p_intro.runs:
        r.font.name = 'Times New Roman'
        r.font.size = Pt(10)
        
    p_caption = doc.paragraphs[p_sec2_idx + 2]
    p_caption.text = "Table 1. Summary of foundational and contemporary research grounding the intelligent tutoring framework."
    for r in p_caption.runs:
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9)
        
    # Now between Table 0 and Section 3, let's look at existing paragraphs
    # Let's clear any old paragraphs between Table 0 and Section 3, and add the structured 15 gists and synthesis.
    # Note: doc.paragraphs has elements before Table 0 and after Table 0.
    # Let's see which paragraphs are between Table 0 and Section 3:
    # In doc.paragraphs, p_sec2_idx + 3 is the paragraph right after Table 0 caption/table.
    
    # Let's inspect paragraphs from p_sec2_idx + 3 up to p_sec3_idx
    paras_to_replace = doc.paragraphs[p_sec2_idx + 3 : p_sec3_idx]
    print(f"Number of paragraphs between Table 0 and Section 3: {len(paras_to_replace)}")
    for pi, p in enumerate(paras_to_replace):
        print(f"  Old P{pi}: {p.text[:60]}")
        
    # We will replace the first paragraph with the Gists Header, and add paragraphs for each of the 15 gists + synthesis
    # To keep exact document order cleanly, let's use paragraph insertion before Section 3
    sec3_para = doc.paragraphs[p_sec3_idx]
    
    # Clear old intermediate paragraphs
    for p in paras_to_replace:
        p_elem = p._element
        p_elem.getparent().remove(p_elem)
        
    # Now insert the new structured content before sec3_para
    def insert_para_before(ref_para, text="", bold_prefix="", runs=None, space_after=Pt(3), line_spacing=1.0):
        new_p = docx.text.paragraph.Paragraph(OxmlElement('w:p'), doc._body)
        ref_para._element.addprevious(new_p._element)
        new_p.paragraph_format.space_before = Pt(0)
        new_p.paragraph_format.space_after = space_after
        new_p.paragraph_format.line_spacing = line_spacing
        
        if runs:
            for txt, bld, itl, sz in runs:
                r = new_p.add_run(txt)
                r.font.name = 'Times New Roman'
                r.font.size = sz if sz else Pt(10)
                r.bold = bld
                r.italic = itl
        else:
            if bold_prefix:
                r_pre = new_p.add_run(bold_prefix)
                r_pre.font.name = 'Times New Roman'
                r_pre.font.size = Pt(10)
                r_pre.bold = True
            if text:
                r_txt = new_p.add_run(text)
                r_txt.font.name = 'Times New Roman'
                r_txt.font.size = Pt(10)
        return new_p

    # Add Gist Section Header
    insert_para_before(
        sec3_para,
        bold_prefix="Essence and Key Gists of the 15 Research Papers:",
        space_after=Pt(4)
    )
    
    # Add each of the 15 papers with exactly 3 distinct lines
    for num, title, line1, line2, line3 in GISTS_DATA:
        # Paragraph for paper header
        runs_header = [
            (f"• [{num}] {title}", True, False, Pt(10))
        ]
        insert_para_before(sec3_para, runs=runs_header, space_after=Pt(1))
        
        # Line 1: Objective & Innovation
        runs_l1 = [
            ("   1. Objective & Innovation: ", True, False, Pt(9.5)),
            (line1, False, False, Pt(9.5))
        ]
        insert_para_before(sec3_para, runs=runs_l1, space_after=Pt(1))
        
        # Line 2: Empirical Findings & Benefit
        runs_l2 = [
            ("   2. Empirical Findings: ", True, False, Pt(9.5)),
            (line2, False, False, Pt(9.5))
        ]
        insert_para_before(sec3_para, runs=runs_l2, space_after=Pt(1))
        
        # Line 3: System Relevance & Research Gap
        runs_l3 = [
            ("   3. System Relevance: ", True, False, Pt(9.5)),
            (line3, False, False, Pt(9.5))
        ]
        insert_para_before(sec3_para, runs=runs_l3, space_after=Pt(4))
        
    # Add Synthesis & Research Gap Section
    insert_para_before(
        sec3_para,
        bold_prefix="Literature Synthesis & Research Gap:",
        space_after=Pt(3)
    )
    
    synthesis_text = (
        "Across the fifteen examined works, educational AI has established powerful predictive mastery models [1, 5, 7, 9, 11] "
        "and conversational feedback engines [3, 14]. However, traditional Deep Knowledge Tracing [5] and attention mechanisms [9, 11] "
        "function strictly as passive outcome predictors without an active decision policy. Conversely, standard BKT [1] assumes strict "
        "skill independence, classical 3-PL IRT [2] provides static psychometric parameters without tracking temporal mastery progression, "
        "and standalone LLM tutors [14] risk pedagogical hallucination without quantitative state grounding. While recent literature explores "
        "offline RL [13] and joint optimization [15], there remains a critical research gap in realizing a lightweight, real-time, closed-loop "
        "tutoring architecture that seamlessly integrates 3-PL IRT difficulty calibration, sequential DKT-GRU mastery estimation, and "
        "Boltzmann Softmax Q-learning curriculum sequencing within Vygotsky's Zone of Proximal Development (ZPD). Our proposed framework "
        "directly unites these components into a cohesive, computationally efficient pedagogical engine."
    )
    insert_para_before(
        sec3_para,
        text=synthesis_text,
        space_after=Pt(6)
    )
    
    # 3. Update References Section
    # Find the updated References heading index
    ref_idx = None
    for i, p in enumerate(doc.paragraphs):
        if p.text.strip() == "References" or p.text.strip().startswith("References"):
            ref_idx = i
            break
            
    print(f"References section found at paragraph {ref_idx}")
    
    # Remove existing references after ref_idx
    ref_paras_to_remove = doc.paragraphs[ref_idx + 1 :]
    for p in ref_paras_to_remove:
        p_elem = p._element
        p_elem.getparent().remove(p_elem)
        
    # Add new 15 references
    for ref_str in REFERENCES_DATA:
        p_new = doc.add_paragraph()
        p_new.paragraph_format.space_before = Pt(0)
        p_new.paragraph_format.space_after = Pt(2)
        p_new.paragraph_format.line_spacing = 1.0
        r = p_new.add_run(ref_str)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(9)
        
    doc.save(filename)
    print(f"Successfully updated and saved {filename}!")

if __name__ == '__main__':
    update_document('106 Section 7.docx')
    update_document('new srinath 106 THINK-AI.docx')
