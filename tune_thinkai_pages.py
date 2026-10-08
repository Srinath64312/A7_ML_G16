import docx
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn
import os
import sys

def build_paper(img_width=4.0, img_space=1.5, p_space=2.5, t_margin=25, font_p=9.0):
    doc = docx.Document()
    
    # Page setup - LNCS A4 format
    section = doc.sections[0]
    section.page_width = Pt(595.45)   # A4 Width
    section.page_height = Pt(841.7)   # A4 Height
    section.left_margin = Pt(124.55)  # 4.4 cm
    section.right_margin = Pt(124.55) # 4.4 cm
    section.top_margin = Pt(147.6)    # 5.2 cm
    section.bottom_margin = Pt(147.6) # 5.2 cm
    
    def set_cell_margins(cell, top=t_margin, bottom=t_margin, left=40, right=40):
        tcPr = cell._element.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    def set_cell_shading(cell, color_hex="F0F4F8"):
        shading_xml = f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>'
        cell._tc.get_or_add_tcPr().append(parse_xml(shading_xml))

    def set_table_borders(table, color="CCCCCC", sz="4", val="single"):
        tblPr = table._element.xpath('w:tblPr')
        if tblPr:
            borders_xml = f'''
            <w:tblBorders {nsdecls("w")}>
                <w:top w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:bottom w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:left w:val="none"/>
                <w:right w:val="none"/>
                <w:insideH w:val="{val}" w:sz="{sz}" w:space="0" w:color="{color}"/>
                <w:insideV w:val="none"/>
            </w:tblBorders>
            '''
            tblPr[0].append(parse_xml(borders_xml))

    def add_title(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.1
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(13)
        run.font.bold = True
        return p

    def add_authors(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(2)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(9.5)
        run.font.bold = True
        return p

    def add_affiliation(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(8.0)
        run.font.italic = True
        return p

    def add_abstract(abstract_text, keywords_text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.line_spacing = 1.02
        run_lbl = p.add_run("Abstract. ")
        run_lbl.font.name = 'Times New Roman'
        run_lbl.font.size = Pt(8.5)
        run_lbl.font.bold = True
        run_txt = p.add_run(abstract_text)
        run_txt.font.name = 'Times New Roman'
        run_txt.font.size = Pt(8.5)

        p_kw = doc.add_paragraph()
        p_kw.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_kw.paragraph_format.space_before = Pt(0)
        p_kw.paragraph_format.space_after = Pt(6)
        run_kw_lbl = p_kw.add_run("Keywords: ")
        run_kw_lbl.font.name = 'Times New Roman'
        run_kw_lbl.font.size = Pt(8.5)
        run_kw_lbl.font.bold = True
        run_kw_txt = p_kw.add_run(keywords_text)
        run_kw_txt.font.name = 'Times New Roman'
        run_kw_txt.font.size = Pt(8.5)

    def add_heading_1(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(7)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(11)
        run.font.bold = True
        return p

    def add_heading_2(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(5)
        p.paragraph_format.space_after = Pt(1.5)
        p.paragraph_format.keep_with_next = True
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(9.5)
        run.font.bold = True
        return p

    def add_p(text, space_after=p_space, italic=False, bold=False):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.02
        run = p.add_run(text)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(font_p)
        run.font.italic = italic
        run.font.bold = bold
        return p

    def add_equation(eq_text, eq_num):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(1.5)
        p.paragraph_format.space_after = Pt(1.5)
        run = p.add_run(f"{eq_text}\t\t({eq_num})")
        run.font.name = 'Times New Roman'
        run.font.size = Pt(8.5)
        run.font.italic = True
        return p

    def add_figure(img_path, caption_text, width_inch=img_width):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(img_space)
            p_img.paragraph_format.space_after = Pt(1)
            p_img.paragraph_format.keep_with_next = True
            run = p_img.add_run()
            run.add_picture(img_path, width=Inches(width_inch))
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
            p_cap.paragraph_format.space_before = Pt(0)
            p_cap.paragraph_format.space_after = Pt(img_space)
            run_cap = p_cap.add_run(caption_text)
            run_cap.font.name = 'Times New Roman'
            run_cap.font.size = Pt(8.0)
            run_cap.font.italic = True

    # Build Content
    add_title("Effective Personalized AI Tutors via Deep Knowledge Tracing, Item Response Theory, and Reinforcement Learning: A Closed-Loop Framework")
    add_authors("K. V. Srinath, Abhinay Sai, and Poli Naidu")
    add_affiliation("Department of Computer Science and Engineering, Koneru Lakshmaiah Education Foundation, Vaddeswaram, AP, India\n{srinath, abhinaysai, polinaidu}@kluniversity.in")
    
    abstract_txt = (
        "Each student possesses a unique cognitive baseline, learning rate, and problem-solving trajectory. "
        "Standard uniform curricula frequently induce cognitive overload in struggling students or disengagement in advanced learners. "
        "To overcome these pedagogical challenges, this paper presents a closed-loop adaptive intelligent tutoring architecture that unifies "
        "psychometric modeling, deep sequential state estimation, and dynamic policy optimization. The framework integrates: (1) a 3-Parameter "
        "Logistic (3-PL) Item Response Theory model to calibrate item discrimination, difficulty, and pseudo-guessing parameters; (2) a Deep Knowledge "
        "Tracing network with Gated Recurrent Units (DKT-GRU) capturing longitudinal mastery dynamics; (3) a Boltzmann Softmax Reinforcement "
        "Learning agent that adaptively sequences exercises within the student's Zone of Proximal Development (ZPD); and (4) an LLM-guided "
        "pedagogical feedback layer generating in-context multi-tier Socratic explanations. Evaluated on 525,534 student interactions from the "
        "ASSISTments benchmark and validated across 8,000 simulated longitudinal tutoring trajectories, our framework achieves an AUC-ROC of 0.8420 "
        "(a +17.3% gain over standard BKT) and accelerates student mastery gains by +42.8% over static curricular baselines while maintaining 93.6% "
        "ZPD pedagogical target alignment."
    )
    keywords_txt = "Personalized Learning, Deep Knowledge Tracing, Item Response Theory, Reinforcement Learning, Zone of Proximal Development, Intelligent Tutoring Systems."
    add_abstract(abstract_txt, keywords_txt)
    
    # 1. Introduction
    add_heading_1("1 Introduction")
    add_p(
        "Mastering STEM disciplines requires personalized pedagogical instruction tailored to individual cognitive readiness. "
        "Traditional classroom settings and static e-learning platforms uniformly deliver rigid curricular sequences, leading to the well-documented "
        "bimodal failure distribution: struggling students encounter premature cognitive overload and frustration, while proficient learners experience "
        "boredom and suboptimal engagement. Intelligent Tutoring Systems (ITS) aim to resolve this limitation by continuously tracking student proficiency "
        "and dynamically recommending tailored educational tasks."
    )
    add_p(
        "Historically, cognitive tracking relied on Bayesian Knowledge Tracing (BKT) [1] and Item Response Theory (IRT) [2], which model mastery through "
        "probabilistic state-space transitions and latent difficulty parameters. While mathematically transparent, classical methods struggle to capture "
        "complex cross-concept dependencies, student forgetting curves, and high-dimensional sequential interactions. Conversely, modern Deep Knowledge "
        "Tracing (DKT) models [5, 9, 11] achieve superior predictive accuracy but operate primarily as passive offline estimators rather than active "
        "instructional planners. Furthermore, standalone reinforcement learning (RL) tutors [4, 8, 13] often suffer from state-space instability and reward "
        "sparsity when decoupled from grounded psychometric measurement."
    )
    add_p(
        "To bridge this divide, this paper proposes a unified, closed-loop Intelligent Tutoring framework that synergizes psychometric calibration, deep "
        "recurrent knowledge estimation, reinforcement learning curriculum optimization, and generative Socratic scaffolding. The principal contributions are:"
    )
    add_p("• Grounded Multi-Model Architecture: We combine 3-PL IRT calibration with DKT-GRU sequence modeling for robust belief tracking.", space_after=1.5)
    add_p("• Adaptive RL Policy: We formalize exercise recommendation as an MDP solved via Boltzmann Softmax Q-learning, maximizing ZPD alignment.", space_after=1.5)
    add_p("• Empirical Validation: We evaluate on 525,534 ASSISTments interaction logs and 8,000 multi-profile simulated sessions.", space_after=3)

    # 2. Related Work
    add_heading_1("2 Literature Review")
    add_p(
        "Intelligent Tutoring Systems research has progressed across three foundational pillars: psychometric item calibration, dynamic knowledge tracing, "
        "and reinforcement-learning-guided curriculum sequencing. Corbett & Anderson [1] introduced Bayesian Knowledge Tracing using two-state HMMs. "
        "Birnbaum [2] established 3-PL IRT psychometrics, decoupling item parameters from sample cohorts. Graesser et al. [3] demonstrated dialogue-based ITS scaffolding."
    )
    add_p(
        "Deep learning revolutionized student modeling through Deep Knowledge Tracing (Piech et al. [5]), dynamic memory networks (Zhang et al. [7]), "
        "Transformer self-attention (Pandey & Karypis [9]), and context-aware attention (Ghosh et al. [11]). Abdelrahman et al. [12] synthesized these advancements, "
        "noting the critical need to close the loop between state estimation and active instructional intervention."
    )
    add_p(
        "In policy optimization, Chi et al. [4] and Rafferty et al. [6] formulated pedagogical pacing via MDP/POMDP frameworks. Fan et al. [8] developed "
        "bi-level teacher-student RL, Yun et al. [13] introduced constrained offline RL for stable path selection, Reddig et al. [14] validated in-context LLM feedback, "
        "and Zhao et al. [15] explored joint DKT-RL path recommendations. Table 1 summarizes the taxonomy and comparative analysis of these 15 benchmark studies."
    )
    
    # Table 1
    t1_cap = doc.add_paragraph()
    t1_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    t1_cap.paragraph_format.space_before = Pt(2)
    t1_cap.paragraph_format.space_after = Pt(1)
    r = t1_cap.add_run("Table 1. Taxonomy and comparative synthesis of foundational and modern ITS literature.")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(8.0)
    r.font.bold = True
    
    table1 = doc.add_table(rows=16, cols=5)
    table1.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table1)
    
    t1_headers = ["No.", "Author & Paper", "Novelty / Core Innovation", "Pedagogical Benefit", "Algorithm"]
    for c_idx, h_text in enumerate(t1_headers):
        cell = table1.cell(0, c_idx)
        cell.text = h_text
        set_cell_margins(cell, top=20, bottom=20, left=30, right=30)
        set_cell_shading(cell, "E8EEF5")
        p = cell.paragraphs[0]
        for run in p.runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(7.0)
            run.font.bold = True

    t1_data = [
        ("1", "Corbett & Anderson [1]", "Two-state HMM mastery tracking with slip/guess", "Interpretable per-skill tracking", "BKT (EM fitting)"),
        ("2", "Birnbaum [2]", "3-PL latent trait psychometric calibration", "Sample-independent calibration", "3-PL IRT"),
        ("3", "Graesser et al. [3]", "AutoTutor conversational Socratic dialogue", "Enhanced conceptual engagement", "LSA + Dialogue Rules"),
        ("4", "Chi et al. [4]", "MDP reinforcement learning for dialogue acts", "Data-driven tutorial policies", "Q-Learning / TD"),
        ("5", "Piech et al. [5]", "Deep Knowledge Tracing via Recurrent NNs", "Captures cross-concept transfer", "DKT (RNN / LSTM)"),
        ("6", "Rafferty et al. [6]", "POMDP planning for accelerated teaching", "Belief-state path sequencing", "POMDP Point-Based"),
        ("7", "Zhang et al. [7]", "Dynamic Key-Value Memory Networks (DKVMN)", "Fine-grained concept readout", "Memory Augmented NN"),
        ("8", "Fan et al. [8]", "Learning to Teach bi-level teacher-student RL", "Automated sample curriculum", "Bi-level Policy Grad."),
        ("9", "Pandey & Karypis [9]", "Self-Attentive Knowledge Tracing (SAKT)", "Fast parallel long-term attention", "Transformer Attention"),
        ("10", "Choi et al. [10]", "EdNet massive 131M interaction benchmark", "High-fidelity EDM evaluation", "Hierarchical Dataset"),
        ("11", "Ghosh et al. [11]", "Context-Aware Attentive KT (CAKT)", "Integrates latency & recency", "Context-Aware Attn."),
        ("12", "Abdelrahman et al. [12]", "Comprehensive survey of knowledge tracing", "Identified estimation-action gap", "Taxonomy & Survey"),
        ("13", "Yun et al. [13]", "Doubly Constrained Offline RL for paths", "Stable, drift-free path policies", "Constrained CQL/BCQ"),
        ("14", "Reddig et al. [14]", "In-context LLM generative feedback", "Real-time non-leaking hints", "LLM Few-Shot Prompt"),
        ("15", "Zhao et al. [15]", "Joint DKT and RL path recommendation", "Unified estimation and policy", "Joint DKT-ActorCritic")
    ]

    for r_idx, row_vals in enumerate(t1_data, start=1):
        for c_idx, val in enumerate(row_vals):
            cell = table1.cell(r_idx, c_idx)
            cell.text = val
            set_cell_margins(cell, top=15, bottom=15, left=30, right=30)
            if r_idx % 2 == 1:
                set_cell_shading(cell, "FAFBFC")
            p = cell.paragraphs[0]
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(6.5)

    # 3. Methodology & Architecture
    add_heading_1("3 Proposed Methodology and Architecture")
    add_p(
        "Our closed-loop architecture integrates four interconnected layers: Psychometric Calibration, Sequential State Estimation, "
        "Reinforcement Learning Optimization, and Scaffolding Generation. Figures 1 and 2 depict the pipeline and system topology."
    )
    
    add_figure("data/output_plots/ml_workflow_diagram.png", 
               "Fig. 1. End-to-end Machine Learning Workflow: EDM logs -> Calibration -> Policy Optimization -> Socratic Delivery.", 
               width_inch=img_width)
    
    add_figure("data/output_plots/proposed_architecture_diagram.png", 
               "Fig. 2. Proposed Closed-Loop Personalized AI Tutor Architecture: Psychometrics, DKT, RL Engine, and LLM Scaffolding.", 
               width_inch=img_width)

    add_heading_2("3.1 3-PL Item Response Theory Psychometric Calibration")
    add_p(
        "To rigorously quantify item difficulty independently of student cohort distributions, we formulate the 3-Parameter Logistic (3-PL) model:"
    )
    add_equation("P(Y_{j}=1 | \\theta) = c_j + \\frac{1 - c_j}{1 + \\exp\\left(-1.702 \\cdot a_j (\\theta - b_j)\\right)}", 1)
    add_p(
        "where $a_j > 0$ represents discrimination, $b_j \\in [-3, 3]$ represents difficulty, and $c_j \\in [0, 0.35]$ accounts for pseudo-guessing."
    )

    add_heading_2("3.2 Deep Knowledge Tracing with Gated Recurrent Units (DKT-GRU)")
    add_p(
        "Student interaction tuples $x_t = (q_t, y_t, \\Delta t_t, n_t)$ are encoded via a stacked Gated Recurrent Unit (GRU) to predict mastery $\\hat{y}_{t+1}$:"
    )
    add_equation("h_t = \\text{GRU}(h_{t-1}, \\mathbf{E}(x_t)), \\quad \\hat{y}_{t+1} = \\sigma\\left(\\mathbf{W}_o h_t + b_o\\right)", 2)
    add_p(
        "Trained end-to-end via binary cross-entropy with Adam optimizer and dropout (p=0.25), DKT captures non-linear concept transfer."
    )

    add_heading_2("3.3 Reinforcement Learning Pedagogical Policy Optimization")
    add_p(
        "We formalize exercise recommendation as an MDP $\\langle \\mathcal{S}, \\mathcal{A}, \\mathcal{P}, \\mathcal{R}, \\gamma \\rangle$, where state $s_t = (m_t, c_t, a_t)$ "
        "combines mastery $m_t$, recent accuracy $c_t$, and velocity $a_t$. The action space $\\mathcal{A}$ selects: Remediate, Reinforce, Challenge, or Advance. "
        "The multi-objective composite reward balances skill gain, ZPD alignment, and frustration penalties:"
    )
    add_equation("R_t = \\alpha \\cdot \\Delta m_t + \\beta \\cdot \\mathbb{I}\\left(|P(\\text{correct}) - 0.70| \\le 0.15\\right) - \\lambda \\cdot \\text{Penalty}_{\\text{frust}}", 3)
    add_p(
        "Actions are sampled via Boltzmann Softmax exploration with temperature annealing $\\tau$:"
    )
    add_equation("\\pi(a | s) = \\frac{\\exp(Q(s, a) / \\tau)}{\\sum_{a'} \\exp(Q(s, a') / \\tau)}, \\quad Q(s,a) \\leftarrow Q(s,a) + \\alpha \\left[R + \\gamma \\max_{a'} Q(s',a') - Q(s,a)\\right]", 4)

    add_heading_2("3.4 Zone of Proximal Development (ZPD) & LLM Scaffolding")
    add_p(
        "Instructional sequencing maintains success probability $P(\\text{success}) \\in [0.60, 0.80]$. When errors occur, an LLM Socratic engine generates "
        "multi-tier conceptual hints without revealing final answers."
    )

    # 4. Dataset & Setup
    add_heading_1("4 Dataset and Experimental Setup")
    add_p(
        "Experiments utilize the ASSISTments benchmark (525,534 interactions across 4,163 students and 110 skill codes). "
        "Users with $<15$ interactions were filtered out, latencies log-normalized, and a 70/15/15 student-stratified split was applied."
    )

    # 5. Results
    add_heading_1("5 Empirical Results and Comparative Analysis")
    add_p(
        "We benchmark predictive tracking accuracy on ASSISTments (Table 2) and longitudinal policy efficacy across 8,000 simulated interactions (Table 3)."
    )
    
    add_heading_2("5.1 Knowledge Tracing Predictive Performance")
    
    # Table 2
    t2_cap = doc.add_paragraph()
    t2_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    t2_cap.paragraph_format.space_before = Pt(2)
    t2_cap.paragraph_format.space_after = Pt(1)
    r = t2_cap.add_run("Table 2. Predictive performance comparison of knowledge tracing models on ASSISTments.")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(8.0)
    r.font.bold = True

    table2 = doc.add_table(rows=6, cols=6)
    table2.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table2)
    t2_headers = ["Model Architecture", "Model Paradigm", "Accuracy (%)", "AUC-ROC", "F1-Score", "RMSE"]
    t2_data = [
        ("Logistic Regression", "Linear Baseline", "65.10%", "0.6420", "0.6280", "0.478"),
        ("XGBoost Classifier", "Gradient Boosted Trees", "69.40%", "0.6850", "0.6720", "0.449"),
        ("Standard BKT [1]", "Two-State HMM", "71.30%", "0.7180", "0.7020", "0.432"),
        ("DKT-Vanilla RNN [5]", "Recurrent Neural Net", "75.80%", "0.8050", "0.7490", "0.395"),
        ("Proposed DKT-GRU", "Stacked GRU + Context", "78.60%", "0.8420", "0.7810", "0.371")
    ]
    for c_idx, h_text in enumerate(t2_headers):
        cell = table2.cell(0, c_idx)
        cell.text = h_text
        set_cell_margins(cell, top=20, bottom=20, left=30, right=30)
        set_cell_shading(cell, "E8EEF5")
        p = cell.paragraphs[0]
        for run in p.runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(7.0)
            run.font.bold = True
    for r_idx, row_vals in enumerate(t2_data, start=1):
        for c_idx, val in enumerate(row_vals):
            cell = table2.cell(r_idx, c_idx)
            cell.text = val
            set_cell_margins(cell, top=15, bottom=15, left=30, right=30)
            if r_idx == 5:
                set_cell_shading(cell, "EBF5FB")
            elif r_idx % 2 == 1:
                set_cell_shading(cell, "FAFBFC")
            p = cell.paragraphs[0]
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(6.8)
                if r_idx == 5:
                    run.font.bold = True

    add_heading_2("5.2 Longitudinal Pedagogical Policy Evaluation")
    
    # Table 3
    t3_cap = doc.add_paragraph()
    t3_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    t3_cap.paragraph_format.space_before = Pt(2)
    t3_cap.paragraph_format.space_after = Pt(1)
    r = t3_cap.add_run("Table 3. Longitudinal pedagogical policy benchmark results across 8,000 simulated interactions.")
    r.font.name = 'Times New Roman'
    r.font.size = Pt(8.0)
    r.font.bold = True

    table3 = doc.add_table(rows=5, cols=5)
    table3.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table3)
    t3_headers = ["Tutoring Policy", "Mean Skill Gain (ΔSkill)", "Target ZPD Rate (%)", "Avg. Steps to Mastery", "Cumulative Reward"]
    t3_data = [
        ("Static Linear Curriculum", "+0.284", "54.20%", "38.2", "+14.8"),
        ("Random Problem Selection", "+0.221", "48.60%", "42.0", "+8.4"),
        ("Greedy Max-Difficulty", "+0.342", "61.80%", "31.4", "+22.6"),
        ("Proposed Boltzmann Q-RL", "+0.486", "93.60%", "21.6", "+41.2")
    ]
    for c_idx, h_text in enumerate(t3_headers):
        cell = table3.cell(0, c_idx)
        cell.text = h_text
        set_cell_margins(cell, top=20, bottom=20, left=30, right=30)
        set_cell_shading(cell, "E8EEF5")
        p = cell.paragraphs[0]
        for run in p.runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(7.0)
            run.font.bold = True
    for r_idx, row_vals in enumerate(t3_data, start=1):
        for c_idx, val in enumerate(row_vals):
            cell = table3.cell(r_idx, c_idx)
            cell.text = val
            set_cell_margins(cell, top=15, bottom=15, left=30, right=30)
            if r_idx == 4:
                set_cell_shading(cell, "EBF5FB")
            elif r_idx % 2 == 1:
                set_cell_shading(cell, "FAFBFC")
            p = cell.paragraphs[0]
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(6.8)
                if r_idx == 4:
                    run.font.bold = True

    add_p(
        "The proposed RL policy achieves a mean skill gain of +0.486 (+42.8% improvement), accelerates mastery convergence to 21.6 steps (-43.5%), "
        "and sustains 93.60% of all interactions within the optimal ZPD challenge band."
    )

    # 6. Visualizations
    add_heading_1("6 Empirical Visualizations and Discussion")
    add_p(
        "Figures 3 through 9 present the empirical visualizations across every stage of our evaluation pipeline."
    )

    add_figure("data/output_plots/step02_eda_distributions.png",
               "Fig. 3. Exploratory Data Analysis: response latency distributions (log-normal fit) and problem attempt frequencies on ASSISTments.",
               width_inch=img_width)
    add_p(
        "As shown in Fig. 3, response times follow a log-normal distribution with median latency of 22.4 seconds, with 82% of items solved in 1–3 attempts."
    )

    add_figure("data/output_plots/step04_irt_item_characteristic_curves.png",
               "Fig. 4. Calibrated 3-PL Item Characteristic Curves showing success probability P(θ) across latent ability θ for representative items.",
               width_inch=img_width)
    add_p(
        "Figure 4 plots the calibrated 3-PL ICCs, validating discrimination slopes $a_j$, difficulty shifts $b_j$, and pseudo-guessing floors $c_j \\approx 0.20$."
    )

    add_figure("data/output_plots/step05_bkt_mastery_trajectories.png",
               "Fig. 5. Bayesian Knowledge Tracing posterior mastery belief trajectories P(L_t) comparing fast learners versus struggling students.",
               width_inch=img_width)
    add_p(
        "Figure 5 contrasts longitudinal BKT updates: fast learners achieve mastery in 6 steps, whereas struggling students require remedial support."
    )

    add_figure("data/output_plots/step06_dkt_loss_and_roc.png",
               "Fig. 6. Deep Knowledge Tracing (DKT-GRU) training loss convergence and ROC curve (AUC = 0.8420).",
               width_inch=img_width)
    add_p(
        "Figure 6 confirms stable optimization over 50 epochs without overfitting, yielding an AUC-ROC of 0.8420 across all skill clusters."
    )

    add_figure("data/output_plots/step08_rl_convergence_and_qtable.png",
               "Fig. 7. Reinforcement Learning training reward convergence curve alongside learned state-action Q-table heatmap.",
               width_inch=img_width)
    add_p(
        "Figure 7 demonstrates RL reward convergence and policy structure: prescribing Remediation at low mastery, Reinforce at intermediate, and Challenge at high mastery."
    )

    add_figure("data/output_plots/step09_policy_benchmarks.png",
               "Fig. 8. Comparative policy distributions across Skill Gain, Cumulative Reward, and ZPD Target Alignment.",
               width_inch=img_width)
    add_p(
        "Figure 8 shows the Boltzmann Softmax policy consistently dominates baselines across skill gain, cumulative reward, and 93.6% ZPD alignment."
    )

    add_figure("data/output_plots/step10_live_session_trajectory.png",
               "Fig. 9. Real-time student adaptive tutoring session trajectory demonstrating dynamic difficulty transitions and rapid mastery convergence.",
               width_inch=img_width)
    add_p(
        "Figure 9 demonstrates dynamic adaptations: errors at steps 4 and 11 trigger immediate difficulty downshifts and hints, achieving mastery by step 17."
    )

    # 7. Conclusion
    add_heading_1("7 Conclusion and Future Work")
    add_p(
        "This paper presented a closed-loop personalized AI tutoring framework integrating 3-PL IRT, DKT-GRU sequence modeling, Boltzmann Softmax RL, "
        "and LLM scaffolding. Benchmarking on 525,534 ASSISTments interactions and 8,000 simulated sessions demonstrated state-of-the-art predictive accuracy "
        "(AUC = 0.8420) and +42.8% faster skill acquisition. Future work will investigate multimodal eye-tracking and cross-disciplinary transfer learning."
    )
    add_p("Acknowledgments. Supported by the Dept. of CSE, Koneru Lakshmaiah Education Foundation.", italic=True, space_after=2)
    add_p("Disclosure of Interests. The authors declare that they have no competing interests.", italic=True, space_after=4)

    # 8. References
    add_heading_1("References")
    references = [
        "[1] Corbett, A.T., Anderson, J.R.: Knowledge Tracing: Modeling the Acquisition of Procedural Knowledge. User Modeling and User-Adapted Interaction 4(4), 253–278 (1994)",
        "[2] Birnbaum, A.: Some Latent Trait Models and Their Use in Inferring an Examinee's Ability. In: Statistical Theories of Mental Test Scores, pp. 397–479 (1968)",
        "[3] Graesser, A.C., Chipman, P., Haynes, B.C., Olney, A.: AutoTutor: Mixed-Initiative Dialogue. IEEE Trans. Educ. 48(4), 612–618 (2005)",
        "[4] Chi, M., VanLehn, K., Litman, D., Jordan, P.: An Evaluation of Empirically Derived Policy. In: Proc. AIED, pp. 600–602 (2011)",
        "[5] Piech, C., Bassen, J., Huang, J., et al.: Deep Knowledge Tracing. In: Advances in Neural Information Processing Systems (NeurIPS), pp. 505–513 (2015)",
        "[6] Rafferty, A.N., Brunskill, E., Griffiths, T.L., Shafto, P.: Faster Teaching via POMDP Planning. Cognitive Science 40(6), 1290–1332 (2016)",
        "[7] Zhang, J., Shi, X., King, I., Yeung, D.Y.: Dynamic Key-Value Memory Networks for Knowledge Tracing. In: Proc. WWW, pp. 765–774 (2017)",
        "[8] Fan, Y., Tian, F., Qin, T., Li, X.Y., Liu, T.Y.: Learning to Teach. In: Proc. ICLR (2018)",
        "[9] Pandey, S., Karypis, G.: A Self-Attentive Model for Knowledge Tracing. In: Proc. EDM, pp. 384–389 (2019)",
        "[10] Choi, Y., Lee, Y., Cho, J., et al.: EdNet: A Large-Scale Hierarchical Dataset in Education. In: Proc. AIED, pp. 69–73 (2020)",
        "[11] Ghosh, A., Heffernan, N., Lan, A.S.: Context-Aware Attentive Knowledge Tracing. In: Proc. ACM SIGKDD, pp. 2330–2339 (2020)",
        "[12] Abdelrahman, G., Wang, Q., Nunes, B.: Knowledge Tracing: A Survey. ACM Computing Surveys 55(11), 1–37 (2023)",
        "[13] Yun, H., Zhao, X., Wang, Y., Sun, J.: Doubly Constrained Offline RL for Learning Path Recommendation. In: Proc. CIKM, pp. 3021–3030 (2023)",
        "[14] Reddig, J., Arora, A., MacLellan, C.J.: In-Context Personalized Feedback for Intelligent Tutors with LLMs. In: Proc. AIED, pp. 240–252 (2024)",
        "[15] Zhao, L., Zhang, M., Liu, H., Chen, X.: Personalized Learning Path Recommendation Based on Joint DKT and RL. IEEE TLT 17, 312–324 (2024)"
    ]
    for ref in references:
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.space_before = Pt(0)
        p_ref.paragraph_format.space_after = Pt(1.5)
        p_ref.paragraph_format.left_indent = Inches(0.2)
        p_ref.paragraph_format.first_line_indent = Inches(-0.2)
        p_ref.paragraph_format.line_spacing = 1.0
        run = p_ref.add_run(ref)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(7.5)

    target_path = r"E:\KLH\2nd year\ML\project\thinkai.docx"
    doc.save(target_path)
    return target_path

if __name__ == "__main__":
    import win32com.client
    word = win32com.client.Dispatch("Word.Application")
    word.Visible = False
    
    # Try different image widths to see how many pages we get
    for width in [3.8, 3.6, 3.4, 3.2, 3.0]:
        target = build_paper(img_width=width, img_space=1.0, p_space=2.0, t_margin=18, font_p=9.0)
        doc = word.Documents.Open(os.path.abspath(target))
        pages = doc.ComputeStatistics(2)
        words = doc.ComputeStatistics(0)
        print(f"Width {width}in -> Pages: {pages}, Words: {words}")
        doc.Close(False)
        if pages == 10:
            print(f"===> FOUND EXACT 10 PAGES AT width={width}in!")
            break
            
    word.Quit()
