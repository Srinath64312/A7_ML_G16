/**
 * flashcards.js — Interactive 3D Flashcards for rapid recall
 */

const FLASHCARD_DECKS = {
    "Java": [
        {
            q: "What are the 4 fundamental pillars of OOP in Java?",
            a: "Encapsulation, Inheritance, Polymorphism, Abstraction",
            exp: "Encapsulation hides data (private + getters/setters). Inheritance enables code reuse with extends. Polymorphism allows dynamic dispatch (@Override). Abstraction hides complexity via abstract class/interface."
        },
        {
            q: "What is the difference between == and .equals() in Java?",
            a: "== checks memory reference address; .equals() checks actual value/content",
            exp: "For primitive types (int, boolean), == compares values. For objects/Strings, == checks if both reference the exact same memory location, while .equals() compares the logical content."
        },
        {
            q: "Why is String immutable in Java?",
            a: "Security, Thread-Safety, Caching, and String Constant Pool optimization",
            exp: "Because Strings cannot be altered once created, they can be safely shared across multiple threads and cached in the String Pool without synchronization overhead."
        },
        {
            q: "What is the difference between ArrayList and LinkedList in Java?",
            a: "ArrayList uses a dynamic array; LinkedList uses a doubly-linked list",
            exp: "ArrayList: O(1) random access by index, but O(n) for middle insertions. LinkedList: O(1) for adding/removing at ends, but O(n) for random indexed access."
        },
        {
            q: "What is the purpose of the 'finally' block in exception handling?",
            a: "Executes cleanup code regardless of whether an exception occurred or was caught",
            exp: "The finally block always runs after try/catch (useful for closing file streams, database connections, and sockets), even if a return statement is present."
        }
    ],
    "DSA": [
        {
            q: "What is the Big-O time complexity of Quick Sort (Average vs Worst)?",
            a: "Average: O(n log n) | Worst: O(n²)",
            exp: "Worst case occurs when the pivot chosen is consistently the smallest or largest element (e.g. already sorted array with naive pivot). Randomized pivot prevents this."
        },
        {
            q: "What is the primary difference between BFS and DFS?",
            a: "BFS uses a Queue (FIFO, level-by-level); DFS uses a Stack/Recursion (LIFO, goes deep first)",
            exp: "BFS guarantees shortest path in unweighted graphs. DFS is ideal for topological sorting, cycle detection, and maze backtracking."
        },
        {
            q: "What is a Hash Collision and how is it resolved?",
            a: "When two distinct keys produce the same hash index. Resolved via Chaining or Open Addressing",
            exp: "Separate Chaining stores collisions in linked lists at each bucket. Open Addressing (Linear/Quadratic Probing) finds the next available slot."
        },
        {
            q: "What is the height of a balanced Binary Search Tree (AVL / Red-Black)?",
            a: "O(log n) height",
            exp: "Self-balancing rotations ensure search, insertion, and deletion always take guaranteed O(log n) time, preventing degradation to an O(n) linked list."
        },
        {
            q: "When should Dynamic Programming (DP) be used over Divide & Conquer?",
            a: "When subproblems overlap and have Optimal Substructure",
            exp: "Divide & Conquer solves independent subproblems (like Merge Sort). DP caches solutions to overlapping subproblems (Memoization / Tabulation) to avoid recomputation."
        }
    ],
    "Front-End": [
        {
            q: "What is the CSS Box Model order from inside to outside?",
            a: "Content → Padding → Border → Margin",
            exp: "Using 'box-sizing: border-box' ensures that padding and border are included within the element's specified width and height, preventing layout breakage."
        },
        {
            q: "What is the JavaScript Event Loop?",
            a: "The mechanism coordinating single-threaded execution, Call Stack, Web APIs, and Task/Microtask Queues",
            exp: "Synchronous code runs on the Call Stack. Async callbacks (Promise microtasks, setTimeout macrotasks) are pushed from queues to the stack once it clears."
        },
        {
            q: "What is the difference between 'let', 'const', and 'var' in JS?",
            a: "let/const are block-scoped & not hoisted to global; var is function-scoped & hoisted",
            exp: "const prevents variable re-assignment (though object properties remain mutable). Always prefer const and let to avoid unintended scope leakage."
        },
        {
            q: "What does CSS 'justify-content' vs 'align-items' control in Flexbox?",
            a: "justify-content aligns along Main Axis; align-items aligns along Cross Axis",
            exp: "If flex-direction is row (default), justify-content controls horizontal layout and align-items controls vertical layout."
        },
        {
            q: "What is Event Delegation in the DOM?",
            a: "Attaching a single event listener to a parent element to handle events on its children via bubbling",
            exp: "Leverages event bubbling: instead of adding 100 listeners to 100 <li> items, add 1 listener to the <ul> and inspect e.target. Saves memory and handles dynamic items."
        }
    ],
    "DBMS": [
        {
            q: "What does each letter in ACID transaction properties mean?",
            a: "Atomicity (all-or-none), Consistency (valid state), Isolation (independent), Durability (persists)",
            exp: "ACID guarantees that database transactions are processed reliably even during crashes, power failures, or concurrent user access."
        },
        {
            q: "What is the difference between 2NF and 3NF Normalization?",
            a: "2NF removes Partial Dependencies; 3NF removes Transitive Dependencies",
            exp: "2NF ensures all non-key attributes depend on the WHOLE candidate key. 3NF ensures non-key attributes do not depend on other non-key attributes."
        },
        {
            q: "What is the difference between Clustered and Non-Clustered Indexes?",
            a: "Clustered index physically sorts the table rows (1 per table); Non-clustered creates a separate lookup pointer tree (multiple allowed)",
            exp: "Primary keys automatically create a Clustered Index in SQL. Secondary columns use Non-Clustered B-Trees pointing to row IDs."
        },
        {
            q: "What is the CAP Theorem in distributed databases?",
            a: "A distributed data store can only provide 2 out of 3: Consistency, Availability, Partition Tolerance",
            exp: "In the presence of network partitions (P), a database must choose between returning consistent data across all nodes (C) or responding immediately (A)."
        },
        {
            q: "What is the difference between WHERE and HAVING clauses in SQL?",
            a: "WHERE filters rows before aggregation; HAVING filters groups after GROUP BY",
            exp: "You cannot use aggregate functions (SUM, COUNT, AVG) inside a WHERE clause; you must use HAVING for aggregated conditions."
        }
    ],
    "Computer Networks": [
        {
            q: "Name all 7 layers of the OSI model from bottom to top (Layer 1 to 7)",
            a: "Physical, Data Link, Network, Transport, Session, Presentation, Application",
            exp: "Mnemonic: 'Please Do Not Throw Sausage Pizza Away'. Layer 3 (Network) uses IP packets; Layer 4 (Transport) uses TCP/UDP segments."
        },
        {
            q: "Describe the TCP 3-Way Handshake connection process",
            a: "1. Client sends SYN → 2. Server replies with SYN-ACK → 3. Client sends ACK",
            exp: "Synchronizes sequence numbers and ensures both client and server are ready for full-duplex reliable communication before data transmission."
        },
        {
            q: "What is the difference between TCP and UDP?",
            a: "TCP is connection-oriented, reliable, and ordered; UDP is connectionless, fast, with zero delivery guarantee",
            exp: "TCP is used for HTTP, email, and files where accuracy is critical. UDP is used for real-time video streaming, DNS, and online gaming."
        },
        {
            q: "How many usable host IP addresses are available in a /24 subnet?",
            a: "254 usable hosts (2⁸ - 2 = 256 - 2)",
            exp: "A /24 subnet has 8 host bits (32 - 24 = 8). 2⁸ = 256 total addresses, minus 2 (the Network address and Broadcast address)."
        },
        {
            q: "What is the role of ARP (Address Resolution Protocol)?",
            a: "Resolves a known IP address (Layer 3) to its physical MAC address (Layer 2)",
            exp: "Devices on a local Ethernet segment use ARP broadcast queries to find the target device's hardware MAC address."
        }
    ],
    "Operating Systems": [
        {
            q: "What are the 4 necessary conditions for Deadlock to occur (Coffman conditions)?",
            a: "Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait",
            exp: "Breaking any ONE of these four conditions guarantees that a deadlock cannot occur in the system."
        },
        {
            q: "What is the difference between a Process and a Thread?",
            a: "A Process has its own address space and resources; a Thread is a lightweight unit sharing memory with its parent process",
            exp: "Context switching between threads is much faster than between processes because virtual memory mappings don't need to be swapped."
        },
        {
            q: "What is Virtual Memory and Paging?",
            a: "Technique that maps virtual addresses to physical RAM frames, using disk swap space when memory is full",
            exp: "Memory is divided into fixed-size pages (commonly 4KB). The Memory Management Unit (MMU) translates virtual addresses to physical frame addresses via Page Tables."
        },
        {
            q: "What is Thrashing in an Operating System?",
            a: "When the OS spends more time swapping pages between RAM and disk than executing actual instructions",
            exp: "Occurs when total working set sizes exceed physical RAM. Resolved by reducing degree of multiprogramming or adding more RAM."
        },
        {
            q: "What is the difference between Preemptive and Non-Preemptive CPU Scheduling?",
            a: "Preemptive can interrupt a running process (e.g. Round Robin, SRTF); Non-preemptive runs until completion/yield (e.g. FCFS, SJF)",
            exp: "Preemptive scheduling enables responsive multitasking for interactive user systems by using timer interrupts and time quantums."
        }
    ]
};

let currentTopic = "Java";
let currentIndex = 0;
let isFlipped = false;
let masteredCount = 0;
let reviewCount = 0;
let deckXPEarned = 0;

const flashcardContainer = document.getElementById("flashcard-container");
const flashcardEl = document.getElementById("flashcard");
const fcQuestion = document.getElementById("fc-question");
const fcAnswer = document.getElementById("fc-answer");
const fcExplanation = document.getElementById("fc-explanation");
const fcBadgeFront = document.getElementById("fc-badge-front");
const fcBadgeBack = document.getElementById("fc-badge-back");
const cardCounter = document.getElementById("card-counter");
const fcMasteredCountEl = document.getElementById("fc-mastered-count");
const fcReviewCountEl = document.getElementById("fc-review-count");
const flashcardTopicsEl = document.getElementById("flashcard-topics");

function initTopics() {
    flashcardTopicsEl.innerHTML = "";
    Object.keys(FLASHCARD_DECKS).forEach(topic => {
        const pill = document.createElement("div");
        pill.className = "topic-pill" + (topic === currentTopic ? " active" : "");
        pill.innerText = topic;
        pill.addEventListener("click", () => selectTopic(topic));
        flashcardTopicsEl.appendChild(pill);
    });
}

function selectTopic(topic) {
    currentTopic = topic;
    document.querySelectorAll("#flashcard-topics .topic-pill").forEach(p => {
        p.classList.toggle("active", p.innerText === topic);
    });
    restartDeck();
}

function restartDeck() {
    currentIndex = 0;
    masteredCount = 0;
    reviewCount = 0;
    deckXPEarned = 0;
    isFlipped = false;
    document.getElementById("deck-complete-overlay").classList.remove("show");
    updateCounter();
    loadCard();
}

function loadCard() {
    const deck = FLASHCARD_DECKS[currentTopic];
    if (!deck || currentIndex >= deck.length) {
        finishDeck();
        return;
    }

    isFlipped = false;
    flashcardEl.classList.remove("is-flipped");

    const item = deck[currentIndex];
    fcBadgeFront.innerText = currentTopic.toUpperCase();
    fcBadgeBack.innerText = currentTopic.toUpperCase() + " · KEY CONCEPT";
    fcQuestion.innerText = item.q;
    fcAnswer.innerText = item.a;
    fcExplanation.innerText = item.exp;

    updateCounter();
}

function flipCard() {
    isFlipped = !isFlipped;
    flashcardEl.classList.toggle("is-flipped", isFlipped);
    if (window.SoundFX) SoundFX.playClick();
}

function markCard(isMastered) {
    if (isMastered) {
        masteredCount++;
        deckXPEarned += 5;
        if (window.GameStore) GameStore.addXP(5);
        if (window.SoundFX) SoundFX.playCorrect();
    } else {
        reviewCount++;
        if (window.SoundFX) SoundFX.playWrong();
    }

    currentIndex++;
    loadCard();
}

function updateCounter() {
    const deck = FLASHCARD_DECKS[currentTopic] || [];
    const total = deck.length;
    cardCounter.innerText = `Card ${Math.min(currentIndex + 1, total)} / ${total}`;
    fcMasteredCountEl.innerText = `✓ ${masteredCount} Mastered`;
    fcReviewCountEl.innerText = `↺ ${reviewCount} Review`;
}

function finishDeck() {
    const overlay = document.getElementById("deck-complete-overlay");
    document.getElementById("deck-stat-mastered").innerText = masteredCount;
    document.getElementById("deck-stat-review").innerText = reviewCount;
    document.getElementById("deck-stat-xp").innerText = "+" + deckXPEarned;
    document.getElementById("deck-summary-text").innerText = `You mastered ${masteredCount} out of ${FLASHCARD_DECKS[currentTopic].length} concepts in ${currentTopic}!`;
    overlay.classList.add("show");

    if (window.GameStore) {
        GameStore.recordActivity();
        const masteryScore = masteredCount / FLASHCARD_DECKS[currentTopic].length;
        const currentM = GameStore.getMastery(currentTopic);
        GameStore.setMastery(currentTopic, Math.max(currentM, masteryScore * 0.7));
    }

    if (window.SoundFX) {
        SoundFX.playLevelUp();
    }
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault();
        flipCard();
    } else if (e.key === "ArrowRight") {
        markCard(true);
    } else if (e.key === "ArrowLeft") {
        markCard(false);
    }
});

// Init
initTopics();
loadCard();
