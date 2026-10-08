// Topic Lists — CS Curriculum & ASSISTments Benchmark
const TOPICS_MATH = [
    "Linear Equations Graphs",
    "Properties of Exponents",
    "Addition and Subtraction Fractions",
    "Area of Circles",
    "Probability of Independent Events",
    "Multiplication and Division Integers",
    "Venn Diagram",
    "Equation Solving Two Steps"
];

const TOPICS_CS = [
    "Java", 
    "DSA", 
    "Front-End", 
    "DBMS", 
    "Computer Networks", 
    "Operating Systems"
];

let activeTrack = "math";
let availableTopics = [...TOPICS_MATH];

let sessionId = null;
let currentTopic = "";
let hintsUsed = 0;
let timeStart = 0;
let correctCount = 0;
let totalCount = 0;
let sessionXPEarned = 0;
let isAnswerSubmitted = false;
let lastMastery = 0.25;

// DOM Elements
const topicSelector = document.getElementById("topic-selector");
const practiceCard = document.getElementById("practice-card");
const placeholderCard = document.getElementById("start-tutor-placeholder");
const activeTopicBadge = document.getElementById("active-topic-badge");
const activeDifficultyBadge = document.getElementById("active-difficulty-badge");
const questionText = document.getElementById("question-text");
const choicesGrid = document.getElementById("choices-grid");
const submitBtn = document.getElementById("submit-btn");
const hintBtn = document.getElementById("hint-btn");
const hintBox = document.getElementById("hint-box");
const hintText = document.getElementById("hint-text");
const feedbackPanel = document.getElementById("feedback-panel");
const feedbackIcon = document.getElementById("feedback-icon");
const feedbackTitle = document.getElementById("feedback-title");
const feedbackHint = document.getElementById("feedback-hint");
const masteryPct = document.getElementById("mastery-pct");
const masteryFill = document.getElementById("mastery-fill");
const correctCountEl = document.getElementById("correct-count");
const totalCountEl = document.getElementById("total-count");
const sessionXpDisplay = document.getElementById("session-xp-display");
const trackMathBtn = document.getElementById("track-math-btn");
const trackCsBtn = document.getElementById("track-cs-btn");

// Track Switching
if (trackMathBtn && trackCsBtn) {
    trackMathBtn.addEventListener("click", () => setTrack("math"));
    trackCsBtn.addEventListener("click", () => setTrack("cs"));
}

function setTrack(track) {
    activeTrack = track;
    if (track === "math") {
        trackMathBtn.className = "btn btn-primary";
        trackCsBtn.className = "btn btn-secondary";
        availableTopics = TOPICS_MATH;
    } else {
        trackCsBtn.className = "btn btn-primary";
        trackMathBtn.className = "btn btn-secondary";
        availableTopics = TOPICS_CS;
    }
    initTopicPills();
}

// Initialize Topic Pills
function initTopicPills() {
    if (!topicSelector) return;
    topicSelector.innerHTML = "";
    availableTopics.forEach(topic => {
        const pill = document.createElement("div");
        pill.className = "topic-pill";
        if (topic === currentTopic) pill.classList.add("active");
        pill.innerText = topic;
        pill.addEventListener("click", () => startSession(topic));
        topicSelector.appendChild(pill);
    });
}

// Fetch dynamic topics from backend
async function fetchTopicsConfig() {
    try {
        const res = await fetch("/api/topics");
        if (res.ok) {
            const data = await res.json();
            if (data.tracks && data.tracks.math && data.tracks.cs) {
                // Ensure synced with backend
                availableTopics = activeTrack === "math" ? data.tracks.math.topics : data.tracks.cs.topics;
            }
        }
    } catch (e) {
        console.warn("Using offline topic list fallback");
    }
    initTopicPills();
}

// Start a New Tutoring Session
async function startSession(topic) {
    if (window.GameStore) {
        GameStore.recordActivity();
    }

    document.querySelectorAll(".topic-pill").forEach(p => {
        if (p.innerText.trim() === topic) {
            p.classList.add("active");
        } else {
            p.classList.remove("active");
        }
    });

    currentTopic = topic;
    correctCount = 0;
    totalCount = 0;
    sessionXPEarned = 0;
    updateStatsDisplay();
    if (feedbackPanel) feedbackPanel.className = "feedback-panel";
    if (hintBox) hintBox.style.display = "none";
    submitBtn.disabled = true;

    try {
        const response = await fetch("/api/student/start_session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                topic: topic,
                policy: document.getElementById("policy-select").value 
            })
        });
        const data = await response.json();
        
        if (data.error) {
            alert(data.error);
            return;
        }

        sessionId = data.session_id;
        placeholderCard.style.display = "none";
        practiceCard.style.display = "block";
        
        loadQuestion(data);
    } catch (e) {
        console.error("Error starting tutoring session:", e);
        alert("Failed to start session. Ensure the backend server is running.");
    }
}

// Load Question into UI
function loadQuestion(data) {
    isAnswerSubmitted = false;
    hintsUsed = 0;
    timeStart = Date.now();
    
    // Update Badges
    activeTopicBadge.innerText = data.topic;
    activeDifficultyBadge.innerText = "Level " + data.difficulty;
    
    // Update Question text
    questionText.innerText = data.question;
    
    // Render Choices with index (1-4)
    choicesGrid.innerHTML = "";
    data.choices.forEach((choice, idx) => {
        const btn = document.createElement("button");
        btn.className = "choice-btn";
        btn.innerHTML = `<span style="opacity:0.6;font-family:var(--font-mono);margin-right:0.5rem;font-size:0.8rem;">[${idx + 1}]</span> ${choice}`;
        btn.dataset.rawChoice = choice;
        btn.dataset.idx = idx + 1;
        btn.addEventListener("click", () => selectChoice(btn));
        choicesGrid.appendChild(btn);
    });
    
    // Update Mastery Indicator
    lastMastery = data.mastery;
    const masteryVal = data.mastery * 100;
    masteryPct.innerText = masteryVal.toFixed(0) + "%";
    masteryFill.style.width = masteryVal + "%";
    
    // Reset Boxes
    if (hintBox) hintBox.style.display = "none";
    if (hintText) hintText.innerText = data.hint;
    if (feedbackPanel) feedbackPanel.className = "feedback-panel";
    submitBtn.disabled = true;
    submitBtn.innerText = "Submit Answer (Enter ↵)";
    hintBtn.disabled = false;
}

// Handle Choice Selection
function selectChoice(selectedBtn) {
    if (isAnswerSubmitted) return;
    if (window.SoundFX) SoundFX.playClick();
    
    document.querySelectorAll(".choice-btn").forEach(btn => {
        btn.classList.remove("selected");
    });
    selectedBtn.classList.add("selected");
    submitBtn.disabled = false;
}

// Handle Submit Answer
async function submitAnswer() {
    const selectedBtn = document.querySelector(".choice-btn.selected");
    if (!selectedBtn || isAnswerSubmitted) return;
    
    isAnswerSubmitted = true;
    submitBtn.disabled = true;
    hintBtn.disabled = true;
    
    const answer = selectedBtn.dataset.rawChoice || selectedBtn.innerText;
    const timeTaken = (Date.now() - timeStart) / 1000.0;
    const policy = document.getElementById("policy-select").value;
    
    try {
        const response = await fetch("/api/student/submit_answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                session_id: sessionId,
                answer: answer,
                time_taken: timeTaken,
                hints_used: hintsUsed
            })
        });
        const data = await response.json();
        
        // Highlight correct and incorrect choices
        document.querySelectorAll(".choice-btn").forEach(btn => {
            const raw = btn.dataset.rawChoice || btn.innerText;
            if (raw === data.correct_answer) {
                btn.classList.add("correct-flash");
            } else if (btn.classList.contains("selected")) {
                btn.classList.add("wrong-flash");
            }
        });
        
        // Update stats and trigger audio
        totalCount++;
        if (data.correct) {
            correctCount++;
            sessionXPEarned += 10;
            if (window.SoundFX) SoundFX.playCorrect();
            if (window.GameStore) {
                GameStore.addXP(10);
            }
        } else {
            if (window.SoundFX) SoundFX.playWrong();
        }

        if (window.GameStore) {
            GameStore.recordAnswer(data.correct);
            GameStore.setMastery(currentTopic, data.mastery);
        }
        updateStatsDisplay();
        
        // Show Answer Feedback Panel
        if (feedbackPanel) {
            if (data.correct) {
                feedbackPanel.className = "feedback-panel show feedback-correct";
                feedbackIcon.innerHTML = "🎉";
                feedbackTitle.innerText = "Excellent! Correct Answer (+10 XP)";
                feedbackHint.innerText = data.explanation || "Great mastery of this concept!";
            } else {
                feedbackPanel.className = "feedback-panel show feedback-wrong";
                feedbackIcon.innerHTML = "💡";
                feedbackTitle.innerText = `Incorrect. Correct answer: ${data.correct_answer}`;
                feedbackHint.innerText = data.explanation || data.next_hint || "Review the step-by-step hint in the problem card.";
            }
        }
        
        // Update Mastery Indicator
        const newMasteryVal = data.mastery * 100;
        masteryPct.innerText = newMasteryVal.toFixed(0) + "%";
        masteryFill.style.width = newMasteryVal + "%";
        
        // Load next question after delay
        submitBtn.innerText = "Loading next problem...";
        setTimeout(() => {
            loadQuestion({
                topic: currentTopic,
                question: data.next_question,
                choices: data.next_choices,
                difficulty: data.next_difficulty,
                hint: data.next_hint,
                mastery: data.mastery
            });
        }, 3400);
        
    } catch (e) {
        console.error("Error submitting answer:", e);
        alert("Failed to submit answer.");
    }
}

// Request Hint
function requestHint() {
    hintsUsed++;
    hintBox.style.display = "block";
}

function updateStatsDisplay() {
    correctCountEl.innerText = correctCount;
    totalCountEl.innerText = totalCount;
    if (sessionXpDisplay) {
        sessionXpDisplay.innerText = "+" + sessionXPEarned + " XP";
    }
}

// Keyboard shortcuts: 1-4 for choices, Enter for submit
document.addEventListener("keydown", (e) => {
    if (practiceCard.style.display === "none") return;
    if (["1", "2", "3", "4"].includes(e.key) && !isAnswerSubmitted) {
        const idx = parseInt(e.key) - 1;
        const btns = document.querySelectorAll(".choice-btn");
        if (btns[idx]) {
            selectChoice(btns[idx]);
        }
    } else if (e.key === "Enter" && !submitBtn.disabled && !isAnswerSubmitted) {
        submitAnswer();
    }
});

// Setup Event Listeners
submitBtn.addEventListener("click", submitAnswer);
hintBtn.addEventListener("click", requestHint);

// Initialize on load
fetchTopicsConfig();

// Check for topic parameter in URL (redirected from Study Hub)
const urlParams = new URLSearchParams(window.location.search);
const topicParam = urlParams.get('topic');
if (topicParam) {
    if (TOPICS_CS.includes(topicParam)) {
        setTrack("cs");
    } else if (TOPICS_MATH.includes(topicParam)) {
        setTrack("math");
    }
    setTimeout(() => {
        startSession(topicParam);
    }, 200);
}
