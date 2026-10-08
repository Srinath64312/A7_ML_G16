const TOPICS = ["Java", "DSA", "Front-End", "DBMS", "Computer Networks", "Operating Systems"];

// Mock DB for DBMS Sandbox
const MOCK_DB = {
    students: [
        { id: 1, name: "Poli Naidu", major: "AI & ML", gpa: 3.9 },
        { id: 2, name: "Srinath K.", major: "CS & Eng", gpa: 3.8 },
        { id: 3, name: "Abhinay Sai", major: "Data Science", gpa: 3.95 },
        { id: 4, name: "Ananya Rao", major: "Cybersecurity", gpa: 3.6 },
        { id: 5, name: "Rahul Varma", major: "AI & ML", gpa: 3.4 }
    ],
    courses: [
        { code: "25CS2107E", title: "Reinforcement Learning & AI", credits: 4 },
        { code: "25CS2108E", title: "Advanced Data Structures", credits: 4 },
        { code: "25CS2109E", title: "Database Systems", credits: 3 }
    ]
};

// Topic Documentation Database — CS curriculum from BabuHub
const DOCS = {
    "Java": {
        icon: "☕",
        title: "Java — Object-Oriented Programming & JVM Internals",
        intro: "Java is a strongly-typed, class-based, object-oriented language. Bytecode compiled from Java runs on any operating system equipped with a Java Virtual Machine (JVM), enabling 'Write Once, Run Anywhere'.",
        concepts: `
            <ul>
                <li><strong>Classes &amp; Objects:</strong> A class is a blueprint defining fields (state) and methods (behavior). Objects are instantiated on the <em>Heap</em> using the <code>new</code> operator.</li>
                <li><strong>OOP Pillars:</strong>
                    <ul>
                        <li><em>Encapsulation</em> — Hide internal state using <code>private</code> access modifiers and expose safe access through public getters/setters.</li>
                        <li><em>Inheritance</em> — Derive subclasses with <code>extends</code> to share attributes and behavior. Java supports single class inheritance.</li>
                        <li><em>Polymorphism</em> — Method overloading (compile-time) and method overriding with <code>@Override</code> (runtime dynamic dispatch).</li>
                        <li><em>Abstraction</em> — Declare interfaces and abstract classes to define common APIs without exposing implementation details.</li>
                    </ul>
                </li>
                <li><strong>Memory Model (Stack vs Heap):</strong>
                    <ul>
                        <li><em>Stack:</em> Stores primitive local variables and references to heap objects. Cleared automatically as stack frames return.</li>
                        <li><em>Heap:</em> Stores all class instances and arrays. Managed automatically by the Garbage Collector (GC).</li>
                    </ul>
                </li>
                <li><strong>Collections Framework:</strong> Standard interfaces include <code>List</code> (ArrayList, LinkedList), <code>Set</code> (HashSet, TreeSet), and <code>Map</code> (HashMap, TreeMap).</li>
            </ul>
        `,
        formula: "Stack Frame: [Local Vars + Operand Stack]  ➔  Heap: [Object Header + Instance Fields + Method Table]",
        calcTitle: "JVM Stack & Heap Memory Simulator",
        inputs: [
            { label: "Class Name", id: "java-class", type: "text", value: "Student" },
            { label: "Instance Variable 1", id: "java-field1", type: "text", value: "name = \"Poli\"" },
            { label: "Instance Variable 2", id: "java-field2", type: "text", value: "gpa = 3.9" }
        ],
        calculate: () => {
            const cls = document.getElementById("java-class").value || "Object";
            const f1 = document.getElementById("java-field1").value || "id = 1";
            const f2 = document.getElementById("java-field2").value || "active = true";
            const heapAddr = "0x" + Math.floor(Math.random() * 0xFFFFFF + 0x100000).toString(16).toUpperCase();
            
            const html = `
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-top:0.5rem;text-align:left;">
                    <div style="background:rgba(99,102,241,0.06);border:1px solid rgba(99,102,241,0.25);border-radius:0.75rem;padding:0.85rem;">
                        <span style="color:var(--secondary);font-weight:700;font-size:0.8rem;text-transform:uppercase;">Stack Frame (Thread-1)</span>
                        <div style="font-family:var(--font-mono);font-size:0.85rem;margin-top:0.5rem;padding:0.5rem;background:rgba(0,0,0,0.3);border-radius:0.35rem;">
                            ref: <span style="color:var(--warning);">${cls.toLowerCase()}Ref</span> ➔ <span style="color:var(--success);font-weight:700;">${heapAddr}</span>
                        </div>
                    </div>
                    <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.25);border-radius:0.75rem;padding:0.85rem;">
                        <span style="color:var(--success);font-weight:700;font-size:0.8rem;text-transform:uppercase;">Heap Memory (${heapAddr})</span>
                        <div style="font-family:var(--font-mono);font-size:0.85rem;margin-top:0.5rem;padding:0.5rem;background:rgba(0,0,0,0.3);border-radius:0.35rem;line-height:1.4;">
                            <strong style="color:var(--secondary);">class ${cls}</strong> {<br>
                            &nbsp;&nbsp;${f1};<br>
                            &nbsp;&nbsp;${f2};<br>
                            }
                        </div>
                    </div>
                </div>
            `;
            return {
                output: `Allocated instance of ${cls} at Heap Address: ${heapAddr}`,
                steps: html
            };
        }
    },
    "DSA": {
        icon: "🌲",
        title: "Data Structures & Algorithms — Sorting & Complexity Lab",
        intro: "Data structures organize data for optimal access and modification. Choosing the right algorithm balances time complexity (CPU cycles) and space complexity (RAM usage).",
        concepts: `
            <ul>
                <li><strong>Asymptotic Complexity (Big-O):</strong>
                    <ul>
                        <li><code>O(1)</code> — Hash table lookup, array indexing.</li>
                        <li><code>O(log n)</code> — Binary search on sorted arrays, AVL/Red-Black tree lookups.</li>
                        <li><code>O(n)</code> — Linear scan, unindexed search.</li>
                        <li><code>O(n log n)</code> — Merge Sort (guaranteed), Quick Sort (average), Heap Sort.</li>
                        <li><code>O(n²)</code> — Bubble Sort, Selection Sort, Insertion Sort (worst case).</li>
                    </ul>
                </li>
                <li><strong>Tree &amp; Graph Traversals:</strong>
                    <ul>
                        <li><em>BFS (Breadth-First Search):</em> Level-order traversal using a <code>Queue</code>. Computes shortest unweighted paths.</li>
                        <li><em>DFS (Depth-First Search):</em> Deep recursive traversal using a <code>Stack</code>. Used in topological sorting and cycle detection.</li>
                    </ul>
                </li>
                <li><strong>Dynamic Programming:</strong> Solves complex problems by combining solutions to overlapping subproblems (Memoization top-down or Tabulation bottom-up).</li>
            </ul>
        `,
        formula: "Quick Sort: T(n) = 2T(n/2) + O(n) avg ➔ O(n log n)  |  Binary Search: T(n) = T(n/2) + O(1) ➔ O(log n)",
        calcTitle: "Live Sorting Complexity & Visualizer",
        inputs: [
            { label: "Array Size (n elements)", id: "dsa-n", type: "number", value: 12 },
            { label: "Algorithm", id: "dsa-algo", type: "text", value: "Quick Sort" }
        ],
        calculate: () => {
            const n = Math.min(25, Math.max(5, parseInt(document.getElementById("dsa-n").value) || 10));
            const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 85) + 15);
            const sorted = [...arr].sort((a, b) => a - b);
            
            const bars = arr.map((val, i) => `
                <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;">
                    <div style="height:${val}px;width:14px;background:linear-gradient(to top,#6366f1,#06b6d4);border-radius:3px 3px 0 0;"></div>
                    <span style="font-size:0.65rem;color:var(--text-muted);font-family:var(--font-mono);">${val}</span>
                </div>
            `).join("");

            const sortedBars = sorted.map((val, i) => `
                <div style="display:flex;flex-direction:column;align-items:center;gap:0.25rem;">
                    <div style="height:${val}px;width:14px;background:linear-gradient(to top,#10b981,#34d399);border-radius:3px 3px 0 0;"></div>
                    <span style="font-size:0.65rem;color:var(--text-muted);font-family:var(--font-mono);">${val}</span>
                </div>
            `).join("");

            const stepsHtml = `
                <div style="margin-top:0.75rem;">
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.35rem;font-weight:700;">Unsorted Array (Input):</div>
                    <div style="display:flex;gap:0.35rem;align-items:flex-end;height:110px;background:rgba(0,0,0,0.25);padding:0.5rem;border-radius:0.5rem;overflow-x:auto;">
                        ${bars}
                    </div>
                    <div style="font-size:0.8rem;color:var(--success);margin-top:0.75rem;margin-bottom:0.35rem;font-weight:700;">Sorted Array (O(n log n) Output):</div>
                    <div style="display:flex;gap:0.35rem;align-items:flex-end;height:110px;background:rgba(0,0,0,0.25);padding:0.5rem;border-radius:0.5rem;overflow-x:auto;">
                        ${sortedBars}
                    </div>
                </div>
            `;
            return {
                output: `For n = ${n}: O(n log n) ≈ ${Math.round(n * Math.log2(n))} ops  vs  O(n²) = ${n * n} ops`,
                steps: stepsHtml
            };
        }
    },
    "Front-End": {
        icon: "🌐",
        title: "Front-End Development — DOM, CSS Engine & Layouts",
        intro: "Front-end engineering creates dynamic client-side applications. Modern browsers combine the DOM (Document Object Model), CSSOM (CSS Object Model), and the JavaScript V8 runtime into a high-performance render pipeline.",
        concepts: `
            <ul>
                <li><strong>CSS Specificity Hierarchy:</strong> Inline styles (1000) &gt; ID selectors (100) &gt; Classes, Attributes &amp; Pseudo-classes (10) &gt; Element &amp; Pseudo-elements (1).</li>
                <li><strong>Layout Engines:</strong>
                    <ul>
                        <li><em>Flexbox (1D):</em> Distributes space along a single main axis or cross axis (ideal for headers, toolbars, card rows).</li>
                        <li><em>CSS Grid (2D):</em> Aligns elements across rows AND columns simultaneously (ideal for responsive dashboard layouts).</li>
                    </ul>
                </li>
                <li><strong>JavaScript Asynchronous Architecture:</strong> Single-threaded non-blocking event loop. Microtasks (Promises, queueMicrotask) execute before Macrotasks (setTimeout, setInterval, I/O events).</li>
                <li><strong>Web Performance Optimization:</strong> Minimize DOM reflows and repaints. Use debounce/throttle on scroll events, image lazy loading, and modern bundlers (Vite/Webpack).</li>
            </ul>
        `,
        formula: "Specificity Weight: (Inline × 1000) + (IDs × 100) + (Classes × 10) + (Tags × 1)",
        calcTitle: "Live CSS Box Model & Specificity Calculator",
        inputs: [
            { label: "Content Width (px)", id: "fe-width", type: "number", value: 200 },
            { label: "Padding (px)", id: "fe-pad", type: "number", value: 20 },
            { label: "Border (px)", id: "fe-border", type: "number", value: 4 },
            { label: "Margin (px)", id: "fe-margin", type: "number", value: 16 }
        ],
        calculate: () => {
            const w = parseInt(document.getElementById("fe-width").value) || 150;
            const p = parseInt(document.getElementById("fe-pad").value) || 10;
            const b = parseInt(document.getElementById("fe-border").value) || 2;
            const m = parseInt(document.getElementById("fe-margin").value) || 10;
            const totalW = w + (p * 2) + (b * 2) + (m * 2);
            
            const stepsHtml = `
                <div style="display:flex;justify-content:center;margin-top:1rem;">
                    <div style="background:rgba(245,158,11,0.15);border:1px dashed #f59e0b;padding:${m}px;border-radius:0.75rem;text-align:center;">
                        <span style="font-size:0.7rem;color:#f59e0b;font-weight:700;">MARGIN (${m}px)</span>
                        <div style="background:rgba(244,63,94,0.15);border:1px solid #f43f5e;padding:${b}px;border-radius:0.5rem;margin-top:0.25rem;">
                            <span style="font-size:0.7rem;color:#f43f5e;font-weight:700;">BORDER (${b}px)</span>
                            <div style="background:rgba(16,185,129,0.15);border:1px solid #10b981;padding:${p}px;border-radius:0.35rem;margin-top:0.25rem;">
                                <span style="font-size:0.7rem;color:#10b981;font-weight:700;">PADDING (${p}px)</span>
                                <div style="background:rgba(6,182,212,0.25);border:1px solid #06b6d4;padding:0.75rem 1.5rem;border-radius:0.25rem;margin-top:0.25rem;font-family:var(--font-mono);font-size:0.85rem;color:#fff;">
                                    CONTENT: ${w}px
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            return {
                output: `Total Element Footprint Width: ${totalW}px (${w} + 2×${p} + 2×${b} + 2×${m})`,
                steps: stepsHtml
            };
        }
    },
    "DBMS": {
        icon: "🗄️",
        title: "Database Management Systems — SQL & Relational Models",
        intro: "Database Management Systems guarantee data integrity, high-throughput concurrent transactions (ACID), and resilient storage using B-Tree indexing and query optimization.",
        concepts: `
            <ul>
                <li><strong>Relational Normalization:</strong>
                    <ul>
                        <li><em>1NF:</em> Atomic values in every cell, no repeating groups.</li>
                        <li><em>2NF:</em> In 1NF + all non-key attributes fully functionally dependent on the entire composite primary key (no partial dependencies).</li>
                        <li><em>3NF:</em> In 2NF + no transitive dependencies (non-key attributes cannot depend on other non-key attributes).</li>
                        <li><em>BCNF:</em> Every determinant is a candidate key.</li>
                    </ul>
                </li>
                <li><strong>ACID Guarantees:</strong>
                    <ul>
                        <li><em>Atomicity:</em> All SQL statements in a transaction commit together or roll back completely.</li>
                        <li><em>Consistency:</em> Preserves all database integrity constraints and foreign keys.</li>
                        <li><em>Isolation:</em> Concurrent transactions execute without mutual interference (Read Committed, Serializable).</li>
                        <li><em>Durability:</em> Write-Ahead Logging (WAL) ensures committed transactions survive power outages.</li>
                    </ul>
                </li>
                <li><strong>Indexing:</strong> Clustered indexes determine physical row layout on disk. Non-clustered indexes store auxiliary B-Trees with pointers to primary key row addresses.</li>
            </ul>
        `,
        formula: "ACID Transactions + B-Tree Query Optimization: O(log_B N) Disk I/O Block Transfers",
        calcTitle: "Live SQL Query Sandbox",
        inputs: [
            { label: "SQL Query", id: "dbms-query", type: "text", value: "SELECT name, major, gpa FROM students WHERE gpa >= 3.8" }
        ],
        calculate: () => {
            const q = (document.getElementById("dbms-query").value || "").trim();
            const students = MOCK_DB.students;
            let rows = students;
            
            if (q.toLowerCase().includes("gpa >= 3.8")) {
                rows = students.filter(s => s.gpa >= 3.8);
            } else if (q.toLowerCase().includes("major = 'ai & ml'")) {
                rows = students.filter(s => s.major === "AI & ML");
            }
            
            const tableRows = rows.map(r => `
                <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
                    <td style="padding:0.4rem 0.75rem;font-family:var(--font-mono);">${r.id}</td>
                    <td style="padding:0.4rem 0.75rem;font-weight:600;color:var(--secondary);">${r.name}</td>
                    <td style="padding:0.4rem 0.75rem;">${r.major}</td>
                    <td style="padding:0.4rem 0.75rem;font-family:var(--font-mono);color:var(--success);">${r.gpa}</td>
                </tr>
            `).join("");

            const tableHtml = `
                <div style="margin-top:0.75rem;overflow-x:auto;">
                    <table style="width:100%;border-collapse:collapse;font-size:0.85rem;text-align:left;background:rgba(0,0,0,0.25);border-radius:0.5rem;">
                        <thead>
                            <tr style="background:rgba(255,255,255,0.05);color:var(--text-muted);font-size:0.75rem;text-transform:uppercase;">
                                <th style="padding:0.5rem 0.75rem;">ID</th>
                                <th style="padding:0.5rem 0.75rem;">Name</th>
                                <th style="padding:0.5rem 0.75rem;">Major</th>
                                <th style="padding:0.5rem 0.75rem;">GPA</th>
                            </tr>
                        </thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                </div>
            `;
            return {
                output: `SQL Engine: Returned ${rows.length} row(s) in 0.42ms (Index Scan)`,
                steps: tableHtml
            };
        }
    },
    "Computer Networks": {
        icon: "🌐",
        title: "Computer Networks — Protocols & Packet Encapsulation",
        intro: "Computer networks interconnect endpoints across layered protocol suites (OSI 7-Layer & TCP/IP). Data moves through encapsulation from user application payloads down to physical bit streams.",
        concepts: `
            <ul>
                <li><strong>The 7 OSI Layers:</strong>
                    <ul>
                        <li><em>Layer 7 (Application):</em> HTTP/HTTPS, DNS, SSH, SMTP.</li>
                        <li><em>Layer 6 (Presentation):</em> TLS/SSL encryption, JSON/Protobuf serialization.</li>
                        <li><em>Layer 5 (Session):</em> RPC session management, NetBIOS.</li>
                        <li><em>Layer 4 (Transport):</em> TCP (reliable, windowing) &amp; UDP (low latency datagrams).</li>
                        <li><em>Layer 3 (Network):</em> IP routing (IPv4/IPv6), ICMP, BGP, OSPF.</li>
                        <li><em>Layer 2 (Data Link):</em> Ethernet frames, MAC addressing, ARP, switches.</li>
                        <li><em>Layer 1 (Physical):</em> Fiber optics, copper cabling, RF Wi-Fi signals.</li>
                    </ul>
                </li>
                <li><strong>TCP 3-Way Handshake:</strong> SYN (seq=x) ➔ SYN-ACK (seq=y, ack=x+1) ➔ ACK (seq=x+1, ack=y+1).</li>
                <li><strong>CIDR Subnetting:</strong> Prefix notation (e.g. /24) defines network mask bits versus available host bits.</li>
            </ul>
        `,
        formula: "Packet Encapsulation: [Ethernet Header [IP Header [TCP Header [HTTP Payload]]]]",
        calcTitle: "CIDR Subnet & Packet Encapsulator",
        inputs: [
            { label: "IP Address", id: "cn-ip", type: "text", value: "192.168.1.10" },
            { label: "CIDR Prefix", id: "cn-cidr", type: "number", value: 24 }
        ],
        calculate: () => {
            const ip = document.getElementById("cn-ip").value || "192.168.1.1";
            const cidr = Math.min(30, Math.max(8, parseInt(document.getElementById("cn-cidr").value) || 24));
            const hostBits = 32 - cidr;
            const usableHosts = Math.pow(2, hostBits) - 2;

            const packetHtml = `
                <div style="display:flex;flex-direction:column;gap:0.4rem;margin-top:0.75rem;font-family:var(--font-mono);font-size:0.8rem;text-align:left;">
                    <div style="background:rgba(99,102,241,0.12);border:1px solid #6366f1;padding:0.5rem 0.75rem;border-radius:0.4rem;">
                        <span style="color:#818cf8;font-weight:700;">[Layer 2 Frame]</span> MAC Src: 52:54:00:12:34:56 ➔ MAC Dst: 00:1A:2B:3C:4D:5E
                    </div>
                    <div style="background:rgba(6,182,212,0.12);border:1px solid #06b6d4;padding:0.5rem 0.75rem;border-radius:0.4rem;margin-left:1rem;">
                        <span style="color:#22d3ee;font-weight:700;">[Layer 3 IP Packet]</span> Src: ${ip} ➔ Dst: 10.0.0.1 (TTL: 64)
                    </div>
                    <div style="background:rgba(16,185,129,0.12);border:1px solid #10b981;padding:0.5rem 0.75rem;border-radius:0.4rem;margin-left:2rem;">
                        <span style="color:#34d399;font-weight:700;">[Layer 4 TCP Segment]</span> Port: 443 (HTTPS) · Seq: 1001 · Flags: [ACK, PSH]
                    </div>
                    <div style="background:rgba(245,158,11,0.12);border:1px solid #f59e0b;padding:0.5rem 0.75rem;border-radius:0.4rem;margin-left:3rem;">
                        <span style="color:#fbbf24;font-weight:700;">[Layer 7 Payload]</span> GET /api/student/session HTTP/2.0
                    </div>
                </div>
            `;
            return {
                output: `Subnet /${cidr}: ${usableHosts.toLocaleString()} usable hosts (Netmask: 255.255.255.0)`,
                steps: packetHtml
            };
        }
    },
    "Operating Systems": {
        icon: "💻",
        title: "Operating Systems — Concurrency, Scheduling & Memory",
        intro: "Operating Systems abstract hardware through process management, virtual memory translation, interrupt handling, and storage device scheduling.",
        concepts: `
            <ul>
                <li><strong>CPU Scheduling Algorithms:</strong>
                    <ul>
                        <li><em>FCFS (First-Come First-Served):</em> Simple FIFO queue, prone to the convoy effect.</li>
                        <li><em>SJF / SRTF:</em> Selects the job with the shortest CPU burst time; mathematically minimizes average waiting time.</li>
                        <li><em>Round Robin (RR):</em> Preemptively allocates time slices (quantums) in circular order to ensure responsive UI multitasking.</li>
                    </ul>
                </li>
                <li><strong>Deadlocks (Coffman Conditions):</strong> Mutual Exclusion, Hold &amp; Wait, No Preemption, Circular Wait. Breaking any single condition prevents deadlock.</li>
                <li><strong>Virtual Memory &amp; Paging:</strong> Translates virtual pages to physical RAM frames via Page Tables and the Hardware MMU. Misses trigger page faults serviced from swap space.</li>
            </ul>
        `,
        formula: "Average Waiting Time = (Σ (Completion Time - Arrival Time - Burst Time)) / N",
        calcTitle: "Live CPU Scheduling Gantt Simulator",
        inputs: [
            { label: "Process Bursts (ms)", id: "os-bursts", type: "text", value: "8, 4, 6" },
            { label: "Time Quantum (ms)", id: "os-quantum", type: "number", value: 3 }
        ],
        calculate: () => {
            const raw = document.getElementById("os-bursts").value || "8, 4, 6";
            const quantum = parseInt(document.getElementById("os-quantum").value) || 3;
            const bursts = raw.split(",").map(s => parseInt(s.trim())).filter(n => !isNaN(n) && n > 0);
            if (bursts.length === 0) return { output: "Error", steps: "Enter valid bursts." };

            const colors = ["#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ec4899"];
            const gantt = [];
            const remaining = [...bursts];
            let time = 0;
            let done = 0;

            while (done < bursts.length) {
                let ran = false;
                for (let i = 0; i < bursts.length; i++) {
                    if (remaining[i] > 0) {
                        ran = true;
                        const runTime = Math.min(remaining[i], quantum);
                        gantt.push({
                            p: `P${i + 1}`,
                            color: colors[i % colors.length],
                            start: time,
                            dur: runTime
                        });
                        time += runTime;
                        remaining[i] -= runTime;
                        if (remaining[i] === 0) done++;
                    }
                }
                if (!ran) break;
            }

            const ganttBars = gantt.map(g => `
                <div style="flex:${g.dur};background:${g.color};height:32px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-family:var(--font-mono);font-size:0.75rem;border-right:1px solid rgba(0,0,0,0.3);position:relative;" title="${g.p}: ${g.start}ms - ${g.start + g.dur}ms">
                    ${g.p} (${g.dur}m)
                </div>
            `).join("");

            const stepsHtml = `
                <div style="margin-top:0.75rem;">
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.35rem;font-weight:700;">Round Robin (Quantum = ${quantum}ms) Gantt Timeline:</div>
                    <div style="display:flex;border-radius:0.4rem;overflow:hidden;background:rgba(0,0,0,0.3);border:1px solid rgba(255,255,255,0.08);">
                        ${ganttBars}
                    </div>
                    <div style="display:flex;justify-content:space-between;font-family:var(--font-mono);font-size:0.7rem;color:var(--text-muted);margin-top:0.25rem;">
                        <span>0ms</span>
                        <span>Total Execution: ${time}ms</span>
                    </div>
                </div>
            `;
            return {
                output: `Simulated ${bursts.length} processes with Round Robin (Completed at ${time}ms)`,
                steps: stepsHtml
            };
        }
    }
};

// DOM Elements
const studyTopicList = document.getElementById("study-topic-list");
const lessonCard = document.getElementById("lesson-card");
const lessonTitle = document.getElementById("lesson-title");
const lessonIntro = document.getElementById("lesson-intro");
const lessonConcepts = document.getElementById("lesson-concepts");
const lessonFormula = document.getElementById("lesson-formula");
const calcTitle = document.getElementById("calc-title");
const calcInputsContainer = document.getElementById("calc-inputs-container");
const calcOutput = document.getElementById("calc-output");
const calcSteps = document.getElementById("calc-steps");
const testMasteryBtn = document.getElementById("test-mastery-btn");

let activeTopic = "Java";

function initSidebar() {
    studyTopicList.innerHTML = "";
    TOPICS.forEach(topic => {
        const doc = DOCS[topic];
        const masteryScore = window.GameStore ? GameStore.getMastery(topic) : 0;
        const masteryInfo = window.GameStore ? GameStore.getMasteryLabel(masteryScore) : { label: "Not Started", color: "#475569", pct: 0 };
        
        const item = document.createElement("div");
        item.className = "topic-pill";
        item.dataset.topic = topic;
        item.style.textAlign = "left";
        item.style.padding = "0.85rem 1.25rem";
        item.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:700;">${doc ? doc.icon + " " : ""}${topic}</span>
                <span class="mastery-label" style="color:${masteryInfo.color};font-size:0.7rem;">${masteryInfo.label}</span>
            </div>
            <div class="mastery-bar-wrap">
                <div class="mastery-bar-track">
                    <div class="mastery-bar-fill" style="width:${masteryInfo.pct}%;background:${masteryInfo.color};"></div>
                </div>
            </div>
        `;
        item.addEventListener("click", () => {
            if (window.SoundFX) SoundFX.playClick();
            selectTopic(topic);
        });
        studyTopicList.appendChild(item);
    });
}

function filterTopics(query) {
    const q = (query || "").toLowerCase();
    document.querySelectorAll("#study-topic-list .topic-pill").forEach(el => {
        const t = el.dataset.topic.toLowerCase();
        const doc = DOCS[el.dataset.topic];
        const match = t.includes(q) || (doc && doc.intro.toLowerCase().includes(q));
        el.style.display = match ? "block" : "none";
    });
}

function selectTopic(topic) {
    activeTopic = topic;
    document.querySelectorAll("#study-topic-list .topic-pill").forEach(el => {
        el.classList.toggle("active", el.dataset.topic === topic);
    });

    const doc = DOCS[topic];
    if (!doc) return;

    lessonTitle.innerText = `${doc.icon}  ${doc.title}`;
    lessonIntro.innerText = doc.intro;
    lessonConcepts.innerHTML = doc.concepts;
    lessonFormula.innerHTML = doc.formula;
    calcTitle.innerText = doc.calcTitle;

    calcInputsContainer.innerHTML = "";
    doc.inputs.forEach(inp => {
        const wrap = document.createElement("div");
        wrap.style.cssText = "display:flex;flex-direction:column;gap:0.25rem;";
        const label = document.createElement("label");
        label.innerText = inp.label;
        label.style.cssText = "font-size:0.8rem;color:var(--text-muted);font-weight:700;text-transform:uppercase;";
        const input = document.createElement("input");
        input.type = inp.type;
        input.id = inp.id;
        input.value = inp.value;
        input.style.width = inp.type === "text" ? "280px" : "130px";
        input.addEventListener("input", triggerCalculation);
        wrap.appendChild(label);
        wrap.appendChild(input);
        calcInputsContainer.appendChild(wrap);
    });

    lessonCard.style.display = "block";
    triggerCalculation();
    lessonCard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function triggerCalculation() {
    const doc = DOCS[activeTopic];
    if (!doc || !doc.calculate) return;
    try {
        const result = doc.calculate();
        calcOutput.innerHTML = result.output;
        calcSteps.innerHTML = result.steps;
    } catch (e) {
        calcOutput.innerHTML = "Error";
        calcSteps.innerHTML = e.message;
    }
}

testMasteryBtn.addEventListener("click", () => {
    if (window.SoundFX) SoundFX.playClick();
    window.location.href = `tutor.html?topic=${encodeURIComponent(activeTopic)}`;
});

initSidebar();
selectTopic("Java");
