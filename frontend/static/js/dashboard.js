let diffChart = null;
let perfChart = null;
let rewardChart = null;
let gainChart = null;
let tradeoffChart = null;
let studentRadarChart = null;
let iccChart = null;
let dktLossChart = null;
let dktCompChart = null;

const TOPICS = [
    "Linear Equations Graphs",
    "Properties of Exponents",
    "Addition and Subtraction Fractions",
    "Area of Circles",
    "Probability of Independent Events",
    "Multiplication and Division Integers",
    "Java",
    "DSA",
    "Front-End",
    "DBMS",
    "Computer Networks",
    "Operating Systems"
];

// DOM Elements
const tabStudentBtn = document.getElementById("tab-student-btn");
const tabResearcherBtn = document.getElementById("tab-researcher-btn");
const studentViewSection = document.getElementById("student-view-section");
const researcherViewSection = document.getElementById("researcher-view-section");

const setupDataBtn = document.getElementById("setup-data-btn");
const dataStatusText = document.getElementById("data-status-text");
const datasetStatsSection = document.getElementById("dataset-stats-section");
const runSimBtn = document.getElementById("run-sim-btn");
const simStatusText = document.getElementById("sim-status-text");
const simulationResultsSection = document.getElementById("simulation-results-section");
const qtableContainer = document.getElementById("qtable-container");

const trainDktBtn = document.getElementById("train-dkt-btn");
const dktResultsGrid = document.getElementById("dkt-results-grid");

// Stat Elements
const statTotalInteractions = document.getElementById("stat-total-interactions");
const statTotalStudents = document.getElementById("stat-total-students");
const statTotalSkills = document.getElementById("stat-total-skills");
const statAvgCorrectness = document.getElementById("stat-avg-correctness");

// Color Palette for Policy Lines
const policyColors = {
    "Q-Learning": "#6366f1",
    "DQN": "#06b6d4",
    "Random": "#94a3b8",
    "Fixed-Difficulty": "#f59e0b",
    "Rule-Based": "#10b981"
};

const skillColors = [
    "#6366f1", "#06b6d4", "#10b981", "#f59e0b",
    "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"
];

// ── Tab Switching ──────────────────────────────────────────────────────────
tabStudentBtn.addEventListener("click", () => {
    tabStudentBtn.className = "btn btn-primary";
    tabResearcherBtn.className = "btn btn-secondary";
    studentViewSection.style.display = "block";
    researcherViewSection.style.display = "none";
    renderStudentDashboard();
});

tabResearcherBtn.addEventListener("click", () => {
    tabResearcherBtn.className = "btn btn-primary";
    tabStudentBtn.className = "btn btn-secondary";
    researcherViewSection.style.display = "block";
    studentViewSection.style.display = "none";
    checkDataStatus();
});

// ── Student Dashboard Renderer ──────────────────────────────────────────────
function renderStudentDashboard() {
    if (!window.GameStore) return;
    
    const xp = GameStore.getXP();
    const streak = GameStore.getStreak();
    const level = GameStore.getLevel();
    const accuracy = GameStore.getAccuracy();

    const sXp = document.getElementById("s-stat-xp");
    const sStreak = document.getElementById("s-stat-streak");
    const sLevel = document.getElementById("s-stat-level");
    const sAcc = document.getElementById("s-stat-accuracy");

    if (sXp) sXp.innerText = "⚡ " + xp.toLocaleString();
    if (sStreak) sStreak.innerText = "🔥 " + streak;
    if (sLevel) {
        sLevel.innerText = level.icon + " " + level.name;
        sLevel.style.color = level.color;
    }
    if (sAcc) sAcc.innerText = accuracy + "%";

    const radarCtx = document.getElementById("student-radar-chart").getContext("2d");
    if (studentRadarChart) studentRadarChart.destroy();

    const radarTopics = ["Java", "DSA", "Front-End", "DBMS", "Linear Equations Graphs", "Properties of Exponents"];
    const masteryData = radarTopics.map(t => Math.round(GameStore.getMastery(t) * 100));

    studentRadarChart = new Chart(radarCtx, {
        type: 'radar',
        data: {
            labels: radarTopics,
            datasets: [{
                label: 'Mastery (%)',
                data: masteryData,
                backgroundColor: 'rgba(99, 102, 241, 0.25)',
                borderColor: '#6366f1',
                pointBackgroundColor: '#06b6d4',
                pointBorderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    pointLabels: { color: '#94a3b8', font: { size: 11, family: 'Outfit' } },
                    ticks: { beginAtZero: true, max: 100, stepSize: 20, backdropColor: 'transparent', color: '#64748b' }
                }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });

    const tableEl = document.getElementById("student-history-table");
    if (tableEl) {
        const history = GameStore.getSessionHistory();
        if (!history || history.length === 0) {
            tableEl.innerHTML = '<div style="color:var(--text-muted);font-style:italic;">No session history yet. Complete a quiz in the Tutor!</div>';
        } else {
            tableEl.innerHTML = "";
            history.slice(0, 8).forEach(entry => {
                const row = document.createElement("div");
                row.style.display = "flex";
                row.style.justifyContent = "space-between";
                row.style.alignItems = "center";
                row.style.padding = "0.5rem 0.75rem";
                row.style.background = "rgba(255,255,255,0.02)";
                row.style.borderRadius = "0.4rem";
                row.style.border = "1px solid rgba(255,255,255,0.04)";

                const acc = Math.round((entry.correct / entry.total) * 100);
                row.innerHTML = `
                    <div>
                        <span style="font-weight:600;color:var(--primary);">${entry.topic}</span>
                        <span style="color:var(--text-muted);font-size:0.75rem;margin-left:0.5rem;">${entry.date || 'Recent'}</span>
                    </div>
                    <div style="font-family:var(--font-mono);font-size:0.8rem;">
                        <span style="color:${acc >= 70 ? 'var(--success)' : 'var(--warning)'};font-weight:700;">${entry.correct}/${entry.total}</span>
                        <span style="color:var(--text-muted);">(${acc}%)</span>
                    </div>
                `;
                tableEl.appendChild(row);
            });
        }
    }
}

// ── Check Dataset Status & Populate Analytics ────────────────────────────────
async function checkDataStatus() {
    try {
        const response = await fetch("/api/data_stats");
        const data = await response.json();

        if (data.status === "ready") {
            dataStatusText.innerText = "✓ Calibrated (20,000 Interactions Loaded)";
            dataStatusText.style.color = "var(--success)";
            datasetStatsSection.style.display = "block";
            runSimBtn.disabled = false;
            simStatusText.innerText = "Ready to simulate policies.";
            renderDatasetStats(data.stats);
            fetchAndRenderSkillParameters();
            fetchAndRenderDktMetrics();
        } else {
            dataStatusText.innerText = "Dataset not calibrated. Click to download & calibrate.";
            dataStatusText.style.color = "var(--warning)";
            datasetStatsSection.style.display = "none";
            runSimBtn.disabled = true;
        }
    } catch (e) {
        console.error("Error checking data status:", e);
        dataStatusText.innerText = "Error contacting backend API.";
        dataStatusText.style.color = "var(--danger)";
    }
}

// Setup Data Click
setupDataBtn.addEventListener("click", async () => {
    setupDataBtn.disabled = true;
    dataStatusText.innerText = "⏳ Calibrating 1-PL IRT & BKT parameters on 20,000 logs...";
    dataStatusText.style.color = "var(--warning)";

    try {
        const response = await fetch("/api/download_data", { method: "POST" });
        const data = await response.json();
        alert(data.message);
        checkDataStatus();
    } catch (e) {
        console.error("Error setting up data:", e);
        alert("Failed to download or preprocess dataset.");
    } finally {
        setupDataBtn.disabled = false;
    }
});

// Render Dataset Summary
function renderDatasetStats(stats) {
    statTotalInteractions.innerText = stats.num_interactions.toLocaleString();
    statTotalStudents.innerText = stats.num_students.toLocaleString();
    statTotalSkills.innerText = stats.num_skills;
    statAvgCorrectness.innerText = (stats.avg_correctness * 100).toFixed(1) + "%";

    // Difficulty Distribution Chart
    const diffCtx = document.getElementById("difficulty-dist-chart").getContext("2d");
    if (diffChart) diffChart.destroy();

    const diffLabels = Object.keys(stats.difficulty_distribution);
    const diffValues = Object.values(stats.difficulty_distribution);

    diffChart = new Chart(diffCtx, {
        type: 'bar',
        data: {
            labels: diffLabels,
            datasets: [{
                label: 'Interactions',
                data: diffValues,
                backgroundColor: ['#10b981', '#06b6d4', '#6366f1', '#f59e0b', '#f43f5e'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: '#94a3b8', font: { family: 'Outfit' } }, grid: { display: false } },
                y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            }
        }
    });

    // Performance Distribution Chart
    const perfCtx = document.getElementById("performance-dist-chart").getContext("2d");
    if (perfChart) perfChart.destroy();

    const perfLabels = Object.keys(stats.student_performance_bins);
    const perfValues = Object.values(stats.student_performance_bins);

    perfChart = new Chart(perfCtx, {
        type: 'doughnut',
        data: {
            labels: perfLabels,
            datasets: [{
                data: perfValues,
                backgroundColor: ['#f43f5e', '#f59e0b', '#6366f1', '#06b6d4', '#10b981'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
            }
        }
    });
}

// Fetch & Render Item Characteristic Curves (ICC) and Empirical BKT Table
async function fetchAndRenderSkillParameters() {
    try {
        const res = await fetch("/api/skill_parameters");
        if (!res.ok) return;
        const data = await res.json();

        // 1. Populate Empirical BKT Table
        const tbody = document.getElementById("empirical-bkt-tbody");
        if (tbody && data.bkt_params) {
            tbody.innerHTML = "";
            const skills = Object.keys(data.bkt_params);
            skills.forEach(skill => {
                const p = data.bkt_params[skill];
                const tr = document.createElement("tr");
                tr.style.borderBottom = "1px solid rgba(255,255,255,0.04)";
                tr.innerHTML = `
                    <td style="padding:0.6rem 0.5rem;font-weight:600;color:var(--text-main);">${skill}</td>
                    <td style="padding:0.6rem 0.5rem;font-family:var(--font-mono);color:var(--primary);">${(p.p_init * 100).toFixed(1)}%</td>
                    <td style="padding:0.6rem 0.5rem;font-family:var(--font-mono);color:var(--success);">${(p.p_transit * 100).toFixed(1)}%</td>
                    <td style="padding:0.6rem 0.5rem;font-family:var(--font-mono);color:var(--warning);">${(p.p_slip * 100).toFixed(1)}%</td>
                    <td style="padding:0.6rem 0.5rem;font-family:var(--font-mono);color:var(--secondary);">${(p.p_guess * 100).toFixed(1)}%</td>
                    <td style="padding:0.6rem 0.5rem;font-family:var(--font-mono);color:#94a3b8;">${p.avg_response_sec}s</td>
                `;
                tbody.appendChild(tr);
            });
        }

        // 2. Render Item Characteristic Curves (ICC)
        if (data.icc_data && data.theta_vals) {
            const iccCanvas = document.getElementById("icc-chart");
            if (iccCanvas) {
                const iccCtx = iccCanvas.getContext("2d");
                if (iccChart) iccChart.destroy();

                const datasets = [];
                const skills = Object.keys(data.icc_data);
                skills.forEach((skill, idx) => {
                    const color = skillColors[idx % skillColors.length];
                    datasets.push({
                        label: `${skill} (β=${data.icc_data[skill].beta})`,
                        data: data.icc_data[skill].curve,
                        borderColor: color,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        pointRadius: 0,
                        tension: 0.3
                    });
                });

                iccChart = new Chart(iccCtx, {
                    type: 'line',
                    data: {
                        labels: data.theta_vals.map(t => "θ=" + t),
                        datasets: datasets
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: { color: '#94a3b8', font: { family: 'Outfit', size: 10 }, boxWidth: 12 }
                            }
                        },
                        scales: {
                            x: {
                                title: { display: true, text: 'Student Latent Ability (θ)', color: '#94a3b8' },
                                ticks: { color: '#64748b', maxTicksLimit: 9 },
                                grid: { color: 'rgba(255, 255, 255, 0.04)' }
                            },
                            y: {
                                title: { display: true, text: 'Probability P(Correct | θ)', color: '#94a3b8' },
                                min: 0, max: 1.0,
                                ticks: { color: '#64748b' },
                                grid: { color: 'rgba(255, 255, 255, 0.05)' }
                            }
                        }
                    }
                });
            }
        }
    } catch (e) {
        console.error("Error fetching skill parameters:", e);
    }
}

// Train & Evaluate Deep Knowledge Tracing (DKT)
if (trainDktBtn) {
    trainDktBtn.addEventListener("click", async () => {
        trainDktBtn.disabled = true;
        trainDktBtn.innerText = "⏳ Training DKT Recurrent Neural Network...";
        await fetchAndRenderDktMetrics(true);
        trainDktBtn.disabled = false;
        trainDktBtn.innerText = "🔄 Run DKT Sequence Evaluation";
    });
}

async function fetchAndRenderDktMetrics(forceRetrain = false) {
    try {
        const url = forceRetrain ? "/api/dkt_evaluation" : "/api/dkt_evaluation";
        const method = forceRetrain ? "POST" : "GET";
        const res = await fetch(url, { method: method });
        if (!res.ok) return;
        const json = await res.json();
        const data = json.data;
        if (!data) return;

        if (dktResultsGrid) dktResultsGrid.style.display = "block";

        document.getElementById("dkt-auc").innerText = data.dkt_metrics.auc.toFixed(3);
        document.getElementById("dkt-acc").innerText = (data.dkt_metrics.accuracy * 100).toFixed(1) + "%";
        document.getElementById("bkt-auc").innerText = data.bkt_baseline.auc.toFixed(3);
        document.getElementById("dkt-loss").innerText = data.dkt_metrics.bce_loss.toFixed(3);

        // Loss History Chart
        const lossCanvas = document.getElementById("dkt-loss-chart");
        if (lossCanvas && data.loss_history) {
            const lossCtx = lossCanvas.getContext("2d");
            if (dktLossChart) dktLossChart.destroy();

            dktLossChart = new Chart(lossCtx, {
                type: 'line',
                data: {
                    labels: data.loss_history.map((_, i) => "Epoch " + (i + 1)),
                    datasets: [{
                        label: 'DKT Cross-Entropy Loss',
                        data: data.loss_history,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.3,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        // DKT vs BKT Comparison Bar Chart
        const compCanvas = document.getElementById("dkt-comparison-chart");
        if (compCanvas) {
            const compCtx = compCanvas.getContext("2d");
            if (dktCompChart) dktCompChart.destroy();

            dktCompChart = new Chart(compCtx, {
                type: 'bar',
                data: {
                    labels: ['ROC AUC (Discrimination)', 'Accuracy (Threshold 0.5)'],
                    datasets: [
                        {
                            label: 'Deep Knowledge Tracing (DKT RNN)',
                            data: [data.dkt_metrics.auc, data.dkt_metrics.accuracy],
                            backgroundColor: '#6366f1'
                        },
                        {
                            label: 'Classical BKT Baseline',
                            data: [data.bkt_baseline.auc, data.bkt_baseline.accuracy],
                            backgroundColor: '#94a3b8'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
                        y: { min: 0.4, max: 1.0, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } }
                    },
                    plugins: {
                        legend: { labels: { color: '#94a3b8' } }
                    }
                }
            });
        }
    } catch (e) {
        console.error("Error evaluating DKT:", e);
    }
}

// ── Run 8,000 Step Policy Simulation ─────────────────────────────────────────
runSimBtn.addEventListener("click", async () => {
    runSimBtn.disabled = true;
    simStatusText.innerText = "⏳ Simulating 200 student trajectories across 5 policies (8,000 steps)...";
    simStatusText.style.color = "var(--warning)";

    try {
        const response = await fetch("/api/run_simulation", { method: "POST" });
        const res = await response.json();

        if (res.status === "success") {
            simStatusText.innerText = "✓ Simulation complete! Rendering comparison charts.";
            simStatusText.style.color = "var(--success)";
            simulationResultsSection.style.display = "block";
            renderSimulationResults(res.data);
            fetchQTable();
        } else {
            simStatusText.innerText = "Simulation failed: " + res.message;
            simStatusText.style.color = "var(--danger)";
        }
    } catch (e) {
        console.error("Error running simulation:", e);
        simStatusText.innerText = "Error executing simulation.";
        simStatusText.style.color = "var(--danger)";
    } finally {
        runSimBtn.disabled = false;
    }
});

// Render Simulation Comparison Curves
function renderSimulationResults(data) {
    const epochs = data["Q-Learning"].map(d => "Epoch " + d.epoch);

    // 1. Reward Curve Chart
    const rewardCtx = document.getElementById("reward-curve-chart").getContext("2d");
    if (rewardChart) rewardChart.destroy();

    const rewardDatasets = Object.keys(data).map(policy => ({
        label: policy,
        data: data[policy].map(d => d.reward),
        borderColor: policyColors[policy] || '#fff',
        backgroundColor: 'transparent',
        borderWidth: policy === "Q-Learning" || policy === "DQN" ? 3 : 1.5,
        tension: 0.3,
        pointRadius: 2
    }));

    rewardChart = new Chart(rewardCtx, {
        type: 'line',
        data: { labels: epochs, datasets: rewardDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#94a3b8', font: { family: 'Outfit' } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                y: { title: { display: true, text: 'Mean Reward', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            },
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
            }
        }
    });

    // 2. Learning Gain Curve Chart
    const gainCtx = document.getElementById("gain-curve-chart").getContext("2d");
    if (gainChart) gainChart.destroy();

    const gainDatasets = Object.keys(data).map(policy => {
        let cumGain = 0;
        const cumData = data[policy].map(d => {
            cumGain += d.learning_gain;
            return cumGain;
        });

        return {
            label: policy,
            data: cumData,
            borderColor: policyColors[policy] || '#fff',
            backgroundColor: 'transparent',
            borderWidth: policy === "Q-Learning" || policy === "DQN" ? 3 : 1.5,
            tension: 0.3,
            pointRadius: 2
        };
    });

    gainChart = new Chart(gainCtx, {
        type: 'line',
        data: { labels: epochs, datasets: gainDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { ticks: { color: '#94a3b8', font: { family: 'Outfit' } }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                y: { title: { display: true, text: 'Cumulative Knowledge Gain (Δθ)', color: '#94a3b8' }, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            },
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
            }
        }
    });

    // 3. Trade-off Scatter/Bubble Chart
    const tradeoffCtx = document.getElementById("tradeoff-chart").getContext("2d");
    if (tradeoffChart) tradeoffChart.destroy();

    const tradeoffData = Object.keys(data).map(policy => {
        const last10 = data[policy].slice(-10);
        const avgAcc = last10.reduce((sum, d) => sum + d.correctness, 0) / last10.length;
        const avgEng = last10.reduce((sum, d) => sum + d.engagement, 0) / last10.length;

        return {
            label: policy,
            data: [{ x: avgAcc * 100, y: avgEng * 100 }],
            backgroundColor: policyColors[policy] || '#fff',
            pointRadius: 10,
            pointHoverRadius: 12
        };
    });

    tradeoffChart = new Chart(tradeoffCtx, {
        type: 'scatter',
        data: { datasets: tradeoffData },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: { title: { display: true, text: 'Accuracy Rate (%)', color: '#94a3b8' }, min: 40, max: 95, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } },
                y: { title: { display: true, text: 'Engagement Trait (%)', color: '#94a3b8' }, min: 30, max: 100, ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255, 255, 255, 0.05)' } }
            },
            plugins: {
                legend: { labels: { color: '#94a3b8', font: { family: 'Outfit' } } }
            }
        }
    });
}

// Fetch & Render Q-Table Heatmap
async function fetchQTable() {
    try {
        const res = await fetch("/api/get_q_table");
        const data = await res.json();
        renderQTable(data.q_table);
    } catch (e) {
        console.error("Error fetching Q-table:", e);
    }
}

function renderQTable(matrix) {
    if (!matrix || matrix.length === 0) return;
    let html = `
        <table class="qtable">
            <thead>
                <tr>
                    <th>Mastery Bin (State)</th>
                    <th>L1 (Easiest)</th>
                    <th>L2 (Easy)</th>
                    <th>L3 (Medium)</th>
                    <th>L4 (Hard)</th>
                    <th>L5 (Hardest)</th>
                </tr>
            </thead>
            <tbody>
    `;

    const allValues = matrix.flat();
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);

    matrix.forEach((row, sIdx) => {
        const bestActionIdx = row.indexOf(Math.max(...row));
        html += `<tr><td><strong>Bin ${sIdx + 1} (${sIdx*10}-${(sIdx+1)*10}%)</strong></td>`;
        row.forEach((qVal, aIdx) => {
            const norm = maxVal > minVal ? (qVal - minVal) / (maxVal - minVal) : 0.5;
            const bgAlpha = (0.1 + 0.6 * norm).toFixed(2);
            const isBest = aIdx === bestActionIdx;
            const borderStyle = isBest ? "border: 2px solid #6366f1;" : "";

            html += `
                <td style="background: rgba(99, 102, 241, ${bgAlpha}); ${borderStyle}">
                    ${qVal.toFixed(2)} ${isBest ? '★' : ''}
                </td>
            `;
        });
        html += `</tr>`;
    });

    html += `</tbody></table>`;
    qtableContainer.innerHTML = html;
}

// Initialize on Load
renderStudentDashboard();
