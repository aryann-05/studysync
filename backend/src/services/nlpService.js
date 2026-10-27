import axios from "axios";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import FormData from "form-data";
import config from "../config/env.js";

const require = createRequire(import.meta.url);
let pdfParse;
try {
  pdfParse = require("pdf-parse");
} catch {
  pdfParse = null;
}


/**
 * Extract raw text from file (PDF, TXT, or fallback)
 */
export const extractRawTextFromFile = async (filePath, originalName) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return "";
  }

  const ext = path.extname(originalName).toLowerCase();

  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      return pdfData.text || "";
    } else {
      // TXT or other text-based files
      return fs.readFileSync(filePath, "utf-8");
    }
  } catch (err) {
    console.warn(`Error extracting text from ${originalName}:`, err.message);
    return "";
  }
};

/**
 * Comprehensive domain-aware topic explanation engine that produces:
 * 1. A clear explanation of what the topic covers (description)
 * 2. An array of specific concepts, subtopics, and techniques included (content_covered)
 */
export const buildTopicExplanation = (topicTitle, moduleName = "", rawDetails = []) => {
  const title = (topicTitle || "").trim();
  const lower = title.toLowerCase();
  const modLower = (moduleName || "").toLowerCase();

  // Clean rawDetails if provided from the syllabus document
  const extractedDetails = Array.isArray(rawDetails)
    ? rawDetails
        .map((d) => d.replace(/^[\d\.\-\*•–—\)\(\s]+/, "").trim())
        .filter((d) => d.length >= 3 && d.length <= 120)
    : [];

  // 1. Data Structures: Trees & BST
  if (lower.includes("tree") || lower.includes("bst") || lower.includes("avl") || lower.includes("heap")) {
    return {
      description: "Explores hierarchical tree data structures, binary search trees (BST), balanced height variations, and tree traversal algorithms.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Tree node anatomy, root, depth, height, and degrees",
        "Binary tree traversals: In-order, Pre-order, Post-order, Level-order",
        "Binary Search Tree (BST) operations: Search, Insert, and Delete",
        "Self-balancing search trees (AVL rotations, Red-Black trees)",
        "Binary heaps, priority queues, and heapify operations",
      ],
    };
  }

  // 2. Data Structures: Graphs
  if (lower.includes("graph") || lower.includes("bfs") || lower.includes("dfs") || lower.includes("dijkstra") || lower.includes("spanning tree")) {
    return {
      description: "Covers graph representations, traversal mechanisms, pathfinding algorithms, and network optimization techniques.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Graph representations: Adjacency Matrix and Adjacency List",
        "Breadth-First Search (BFS) and Depth-First Search (DFS) traversals",
        "Shortest path algorithms (Dijkstra's and Bellman-Ford)",
        "Minimum Spanning Trees (Kruskal's and Prim's algorithms)",
        "Topological sorting, cycle detection, and connectivity analysis",
      ],
    };
  }

  // 3. Algorithms: Sorting & Searching
  if (lower.includes("sort") || lower.includes("search") || lower.includes("binary search") || lower.includes("asymptotic")) {
    return {
      description: "Analyzes fundamental search routines and comparison-based sorting algorithms along with asymptotic complexity (Big-O) bounds.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Linear Search and logarithmic Binary Search",
        "Quadratic sorts: Bubble Sort, Selection Sort, Insertion Sort",
        "Divide-and-conquer sorts: Merge Sort and Quick Sort",
        "Non-comparison and linear sorts: Counting Sort and Radix Sort",
        "Time and space complexity: Best, Average, and Worst-case Big-O bounds",
      ],
    };
  }

  // 4. Algorithms: Dynamic Programming & Greedy / Recursion
  if (lower.includes("dynamic programming") || lower.includes("greedy") || lower.includes("recursion") || lower.includes("backtracking") || lower.includes("divide and conquer")) {
    return {
      description: "Focuses on optimal problem decomposition, overlapping subproblems, memoization, greedy choices, and recursive state spaces.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Recursion fundamentals, call stacks, and base cases",
        "Top-down memoization vs bottom-up tabulation strategies",
        "Classic DP problems: 0/1 Knapsack, Longest Common Subsequence (LCS)",
        "Greedy algorithms: Activity selection, Fractional Knapsack, Huffman coding",
        "Backtracking techniques: N-Queens, subset generation, graph coloring",
      ],
    };
  }

  // 5. Data Structures: Linear (Arrays, Linked Lists, Stacks, Queues)
  if (lower.includes("array") || lower.includes("linked list") || lower.includes("stack") || lower.includes("queue")) {
    return {
      description: "Examines linear data structures, sequential and linked memory representations, pointer operations, and LIFO/FIFO access patterns.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Contiguous array indexing, dynamic resizing, and buffer allocations",
        "Singly, doubly, and circular linked lists with pointer mutations",
        "Stack operations (Push, Pop, Peek) and call-stack expression evaluation",
        "Queue implementations: Simple, Circular, Deque, and Priority Queues",
        "Memory overhead and algorithmic runtime trade-offs",
      ],
    };
  }

  // 6. Data Structures: Hashing
  if (lower.includes("hash") || lower.includes("map") || lower.includes("dictionary")) {
    return {
      description: "Explores hash tables, mathematical hash functions, collision resolution strategies, and constant-time average lookup mechanics.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Hash functions, distribution uniformity, and prime modulo division",
        "Collision resolution: Separate Chaining vs Open Addressing",
        "Probing techniques: Linear probing, Quadratic probing, Double hashing",
        "Load factor thresholds, dynamic rehashing, and table expansion",
        "Practical hash map applications and key-value indexing",
      ],
    };
  }

  // 7. Databases: Normalization & Relational Design
  if (lower.includes("normal") || lower.includes("dependency") || lower.includes("functional dependency") || lower.includes("bcnf")) {
    return {
      description: "Covers relational database schema design, functional dependencies, redundancy elimination, and normal form decompositions.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Functional dependencies, Armstrong's axioms, and attribute closures",
        "First Normal Form (1NF) and atomic domain values",
        "Second Normal Form (2NF) and eliminating partial key dependencies",
        "Third Normal Form (3NF) and transitive dependency elimination",
        "Boyce-Codd Normal Form (BCNF) and lossless-join decomposition",
      ],
    };
  }

  // 8. Databases: SQL & Relational Model & Transactions
  if (lower.includes("sql") || lower.includes("dbms") || lower.includes("database") || lower.includes("transaction") || lower.includes("relational") || lower.includes("acid") || lower.includes("concurrency")) {
    return {
      description: "Covers relational database management systems, declarative SQL querying, transaction safety (ACID), and concurrency protocols.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Relational algebra, schemas, primary keys, and foreign keys",
        "SQL DDL, DML, complex joins, subqueries, group by, and views",
        "ACID properties: Atomicity, Consistency, Isolation, and Durability",
        "Concurrency control: Serializability, Two-Phase Locking (2PL), Deadlocks",
        "Indexing techniques: B-Tree indexes, Clustered vs Non-clustered, Query plans",
      ],
    };
  }

  // 9. Operating Systems: Process & CPU Scheduling
  if (lower.includes("process") || lower.includes("thread") || lower.includes("scheduling") || lower.includes("cpu schedul") || lower.includes("deadlock")) {
    return {
      description: "Examines process lifecycles, CPU scheduling policies, thread synchronization, inter-process communication, and deadlock handling.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Process states, Process Control Block (PCB), and context switching",
        "CPU scheduling algorithms: FCFS, SJF, Round Robin, Multilevel queues",
        "Inter-Process Communication (IPC): Shared memory and message passing",
        "Concurrency: Critical section problem, Semaphores, and Mutexes",
        "Deadlock characterization, Prevention, Banker's algorithm, and Recovery",
      ],
    };
  }

  // 10. Operating Systems: Memory Management & Virtual Memory
  if (lower.includes("memory") || lower.includes("virtual memory") || lower.includes("paging") || lower.includes("segmentation") || lower.includes("page replacement")) {
    return {
      description: "Analyzes physical memory partitioning, virtual memory translation, hardware paging/segmentation, and page fault replacement algorithms.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Contiguous memory allocation, internal and external fragmentation",
        "Paging hardware, page tables, and Translation Lookaside Buffers (TLB)",
        "Segmentation architecture and protection mechanisms",
        "Virtual memory, demand paging, and page fault handling routines",
        "Page replacement algorithms: FIFO, Least Recently Used (LRU), Optimal",
      ],
    };
  }

  // 11. Operating Systems: Storage & File Systems
  if (lower.includes("file") || lower.includes("disk") || lower.includes("i/o") || lower.includes("raid") || lower.includes("directory")) {
    return {
      description: "Explores file system structures, directory organization, disk storage allocation methods, and disk arm scheduling algorithms.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "File attributes, operations, access methods, and directory hierarchies",
        "File allocation methods: Contiguous, Linked, and Indexed allocation",
        "Free space management: Bit vectors, grouped lists, and counting",
        "Disk scheduling: FCFS, Shortest Seek Time First (SSTF), SCAN, C-SCAN",
        "RAID levels, fault tolerance, and disk buffer caching",
      ],
    };
  }

  // 12. Computer Networks: Layers & OSI / TCP/IP
  if (lower.includes("network") || lower.includes("osi") || lower.includes("tcp") || lower.includes("udp") || lower.includes("routing") || lower.includes("protocol") || lower.includes("ip address")) {
    return {
      description: "Covers layered communication models, packet switching, routing protocols, transport reliability, and application protocols.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "OSI 7-layer architecture and TCP/IP 4-layer reference model",
        "Data link layer: Framing, error detection (CRC), flow control, MAC addresses",
        "Network layer: IPv4/IPv6 addressing, CIDR subnetting, and packet routing",
        "Transport layer: TCP reliable delivery (3-way handshake) vs UDP datagrams",
        "Application layer protocols: HTTP/HTTPS, DNS, DHCP, and FTP",
      ],
    };
  }

  // 13. Object-Oriented Programming (OOP)
  if (lower.includes("oop") || lower.includes("object oriented") || lower.includes("class") || lower.includes("inheritance") || lower.includes("polymorphism") || lower.includes("encapsulation") || lower.includes("interface")) {
    return {
      description: "Covers object-oriented paradigms, class and object abstraction, inheritance hierarchies, runtime polymorphism, and encapsulation.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Classes, object instantiation, constructors, and access specifiers",
        "Encapsulation, information hiding, getters, setters, and state management",
        "Inheritance hierarchies, code reuse, method overriding, and 'super' references",
        "Compile-time overloading and dynamic runtime polymorphism",
        "Abstract classes, interfaces, multiple inheritance, and contract design",
      ],
    };
  }

  // 14. Software Engineering, Testing & QA
  if (lower.includes("testing") || lower.includes("qa") || lower.includes("sdlc") || lower.includes("agile") || lower.includes("scrum") || lower.includes("software engineering") || lower.includes("quality")) {
    return {
      description: "Examines software development methodologies, requirements engineering, test case design, and quality assurance verification standards.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "SDLC phases: Requirements, Design, Implementation, Testing, Maintenance",
        "Process models: Agile, Scrum sprints, Kanban, and Waterfall models",
        "Testing levels: Unit testing, Integration testing, System, and Acceptance (UAT)",
        "Test design techniques: Boundary Value Analysis and Equivalence Partitioning",
        "Defect lifecycle, regression test automation, and CI/CD quality gates",
      ],
    };
  }

  // 15. Web Development & Full-Stack
  if (lower.includes("web") || lower.includes("html") || lower.includes("css") || lower.includes("react") || lower.includes("javascript") || lower.includes("api") || lower.includes("frontend") || lower.includes("backend")) {
    return {
      description: "Covers modern full-stack web technologies, responsive client interfaces, asynchronous JavaScript, and RESTful web API design.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Semantic HTML5, CSS layout grids, Flexbox, and responsive viewports",
        "Modern JavaScript/TypeScript: DOM manipulation, Event loop, Promises, Async/Await",
        "Component-based UI architectures, state management, and props workflows",
        "RESTful API design principles, JSON serialization, and HTTP status codes",
        "Client-server security: CORS, JWT authentication, and input sanitization",
      ],
    };
  }

  // 16. Cloud Computing, Virtualization & Containers
  if (lower.includes("cloud") || lower.includes("docker") || lower.includes("kubernetes") || lower.includes("virtualization") || lower.includes("microservice") || lower.includes("aws") || lower.includes("azure")) {
    return {
      description: "Explores cloud computing deployment models, distributed microservices, containerization, and elastic resource orchestration.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Cloud service architectures: IaaS, PaaS, SaaS, and serverless computing",
        "Virtualization fundamentals, hypervisors, and hardware emulation",
        "Containerization with Docker: Images, containers, and Dockerfiles",
        "Container orchestration: Kubernetes pods, deployments, and services",
        "Elastic scalability, load balancing, fault tolerance, and cloud storage",
      ],
    };
  }

  // 17. Artificial Intelligence & Machine Learning
  if (lower.includes("machine learning") || lower.includes("neural") || lower.includes("ai") || lower.includes("deep learning") || lower.includes("regression") || lower.includes("classification")) {
    return {
      description: "Examines machine learning algorithms, statistical training workflows, feature engineering, and predictive model evaluation.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Supervised, unsupervised, and reinforcement learning paradigms",
        "Regression analysis and classification algorithms (Logistic, Decision Trees)",
        "Model training, cross-validation, hyperparameter tuning, and overfitting",
        "Evaluation metrics: Accuracy, Precision, Recall, F1-Score, and ROC-AUC",
        "Neural network foundations: Perceptrons, activation functions, and backpropagation",
      ],
    };
  }

  // 18. Cybersecurity & Cryptography
  if (lower.includes("security") || lower.includes("crypto") || lower.includes("cipher") || lower.includes("encryption") || lower.includes("authentication") || lower.includes("vulnerability")) {
    return {
      description: "Focuses on computer security principles, cryptographic encryption standards, secure authentication, and defensive vulnerability mitigation.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "CIA triad: Confidentiality, Integrity, and Availability",
        "Symmetric encryption (AES, DES) and Asymmetric encryption (RSA, ECC)",
        "Cryptographic hashes (SHA-256), HMAC, and digital signatures",
        "Authentication mechanisms: Passwords, tokens, OAuth2, and Multi-factor (MFA)",
        "Common cyber threats: SQL Injection, XSS, CSRF, MITM, and mitigation tactics",
      ],
    };
  }

  // 19. Mathematics, Probability & Statistics
  if (lower.includes("math") || lower.includes("calculus") || lower.includes("matrix") || lower.includes("statistics") || lower.includes("probability") || lower.includes("linear algebra")) {
    return {
      description: "Covers mathematical foundations, matrix computations, probability distributions, and statistical analytical models.",
      content_covered: extractedDetails.length > 0 ? extractedDetails : [
        "Matrix operations, vector spaces, and linear transformations",
        "Eigenvalues, eigenvectors, and matrix decomposition",
        "Probability distributions (Normal, Binomial, Poisson)",
        "Statistical hypothesis testing, p-values, and confidence intervals",
        "Differential calculus and gradient-based optimization concepts",
      ],
    };
  }

  // Dynamic academic fallback synthesis
  const cleanModule = (moduleName || "Course Curriculum").replace(/^(module|unit|chapter|part|section)\s*\d*[:\s\-]*/i, "").trim();
  const contentList = extractedDetails.length > 0
    ? extractedDetails
    : [
        `Theoretical foundations and core terminology of ${title}`,
        `Essential architectures, principles, and structural models`,
        `Standard implementation methods, workflows, and algorithmic procedures`,
        `Practical problem solving, case studies, and exam preparation focus`,
      ];

  return {
    description: `Covers the fundamental principles, theoretical concepts, and practical methodologies of ${title} within ${cleanModule}.`,
    content_covered: contentList,
  };
};

/**
 * Intelligent syllabus parser and summarizer that extracts module and topic hierarchies
 */
export const parseAndSummarizeText = (rawText, originalName) => {
  const baseTitle = originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

  if (!rawText || rawText.trim().length < 30) {
    return generateFallbackHierarchy(null, originalName);
  }

  const lines = rawText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  const modules = [];
  let currentModule = null;

  // Patterns indicating a module or unit header
  const moduleRegex = /^(module|unit|chapter|part|section)\s*([0-9ivx]+)?[:\s\-–—]*(.*)/i;
  const uppercaseHeaderRegex = /^[A-Z0-9\s,:–—\-]{4,60}$/;

  for (const line of lines) {
    const isModuleMatch = moduleRegex.test(line);
    const isUpperMatch = uppercaseHeaderRegex.test(line) && line.split(" ").length <= 8;

    if (isModuleMatch || (isUpperMatch && !currentModule)) {
      if (currentModule && currentModule.topics.length > 0) {
        modules.push(currentModule);
      }
      currentModule = {
        module_name: line,
        topics: [],
      };
      continue;
    }

    // Line is likely a topic under the current module
    let cleanTopic = line
      .replace(/^[\d\.\-\*•–—\)\(]+/, "")
      .trim();

    // Check if line contains inline subtopics separated by colon or dash
    let inlineSubtopics = [];
    if (cleanTopic.includes(":") || cleanTopic.includes(" - ")) {
      const parts = cleanTopic.includes(":") ? cleanTopic.split(":") : cleanTopic.split(" - ");
      if (parts[0].trim().length >= 3 && parts[1].trim().length >= 3) {
        cleanTopic = parts[0].trim();
        inlineSubtopics = parts[1]
          .split(/[,;]/)
          .map((s) => s.trim())
          .filter((s) => s.length >= 2);
      }
    }

    if (cleanTopic.length >= 4 && cleanTopic.length <= 120) {
      if (!currentModule) {
        currentModule = {
          module_name: `Module 1: Foundations of ${baseTitle}`,
          topics: [],
        };
      }

      // Avoid duplicate topic titles in the same module
      if (!currentModule.topics.some((t) => t.title.toLowerCase() === cleanTopic.toLowerCase())) {
        const lower = cleanTopic.toLowerCase();
        let difficulty = 1.0;
        let hours = 1.5;

        if (lower.includes("advanced") || lower.includes("algorithm") || lower.includes("design") || lower.includes("analysis")) {
          difficulty = 1.25;
          hours = 2.5;
        } else if (lower.includes("introduction") || lower.includes("overview") || lower.includes("basics")) {
          difficulty = 1.0;
          hours = 1.5;
        } else if (lower.includes("implementation") || lower.includes("practical") || lower.includes("system")) {
          difficulty = 1.15;
          hours = 2.0;
        }

        const explanation = buildTopicExplanation(cleanTopic, currentModule.module_name, inlineSubtopics);

        currentModule.topics.push({
          title: cleanTopic,
          description: explanation.description,
          content_covered: explanation.content_covered,
          estimated_hours: hours,
          difficulty_weight: difficulty,
        });
      }
    }
  }

  if (currentModule && currentModule.topics.length > 0) {
    modules.push(currentModule);
  }

  // If extraction yielded too few structured topics, merge with intelligent fallback
  if (modules.length === 0 || modules.reduce((sum, m) => sum + m.topics.length, 0) < 3) {
    return generateFallbackHierarchy(null, originalName);
  }

  // Calculate summary metrics
  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);
  const totalHours = modules.reduce(
    (sum, m) =>
      sum + m.topics.reduce((tSum, t) => tSum + t.estimated_hours * t.difficulty_weight, 0),
    0
  );
  const avgDifficulty =
    modules.reduce(
      (sum, m) => sum + m.topics.reduce((tSum, t) => tSum + t.difficulty_weight, 0),
      0
    ) / totalTopics;

  const easyCount = modules.flatMap((m) => m.topics).filter((t) => t.difficulty_weight <= 1.0).length;
  const hardCount = modules.flatMap((m) => m.topics).filter((t) => t.difficulty_weight >= 1.2).length;
  const mediumCount = Math.max(0, totalTopics - easyCount - hardCount);

  const summaryPoints = [
    `Curriculum Structure: Extracted ${modules.length} modules covering ${totalTopics} key conceptual topics.`,
    `Workload Estimate: Total required effort estimated at ~${Math.round(totalHours * 10) / 10} study hours (weighted average difficulty: ${(Math.round(avgDifficulty * 100) / 100).toFixed(2)}x).`,
    `Core Focus Areas: Spans ${modules.slice(0, 3).map((m) => `"${m.module_name.replace(/^(module|unit|chapter)\s*\d*[:\s\-]*/i, "").trim()}"`).join(", ")}${modules.length > 3 ? `, plus ${modules.length - 3} more modules` : ""}.`,
    `Complexity Distribution: Comprises ${easyCount} foundational, ${mediumCount} intermediate, and ${hardCount} advanced topics.`,
    `Adaptive SM-2 Strategy: Spaced repetition intervals (1d, 3d, 7d, 14d) automatically adjust based on post-session confidence ratings.`,
  ];

  return {
    course_name: baseTitle,
    summary: {
      total_modules: modules.length,
      total_topics: totalTopics,
      total_estimated_hours: Math.round(totalHours * 10) / 10,
      average_difficulty: Math.round(avgDifficulty * 100) / 100,
      overview: `Curriculum extracted for "${baseTitle}". Spans ${modules.length} modules covering ${totalTopics} key conceptual topics requiring ~${Math.round(totalHours)} study hours.`,
      summary_points: summaryPoints,
    },
    modules,
  };
};

/**
 * Fallback parser for syllabus text/files when Python NLP microservice is offline
 */
const generateFallbackHierarchy = (filePath, originalName) => {
  const baseTitle = originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");

  const modules = [
    {
      module_name: `Module 1: Foundations of ${baseTitle}`,
      topics: [
        {
          title: `Core Principles & Introduction to ${baseTitle}`,
          description: `Introduces the foundational concepts, theoretical background, and architectural core of ${baseTitle}.`,
          content_covered: [
            "Theoretical foundations and core domain terminology",
            "Core architecture and execution models",
            "Fundamental design principles and building blocks",
            "Basic setup, workflow pipelines, and introductory examples",
          ],
          estimated_hours: 2.0,
          difficulty_weight: 1.0,
        },
        {
          title: `Key Architectures & Fundamentals`,
          description: `Examines structural frameworks, underlying components, and operational mechanics central to ${baseTitle}.`,
          content_covered: [
            "Structural frameworks and component breakdown",
            "Data representations and control flows",
            "Interface definitions and communication protocols",
            "Comparative analysis of architectural patterns",
          ],
          estimated_hours: 2.5,
          difficulty_weight: 1.1,
        },
      ],
    },
    {
      module_name: `Module 2: Advanced Topics & Algorithms`,
      topics: [
        {
          title: `Analytical Methods & Processing Models`,
          description: `Dives into algorithmic procedures, mathematical modeling, and analytical techniques for solving domain problems.`,
          content_covered: [
            "Algorithmic procedures and computational logic",
            "Complexity metrics and asymptotic performance analysis",
            "Data processing pipelines and state transformations",
            "Optimization techniques and bottleneck identification",
          ],
          estimated_hours: 3.0,
          difficulty_weight: 1.3,
        },
        {
          title: `Practical Implementation & Optimization`,
          description: `Focuses on concrete implementation strategies, error handling, performance tuning, and scalable designs.`,
          content_covered: [
            "Implementation patterns and code organization",
            "Resource management and efficiency tuning",
            "Error recovery, edge-case mitigation, and validation",
            "Unit testing and benchmarking methodologies",
          ],
          estimated_hours: 2.5,
          difficulty_weight: 1.2,
        },
      ],
    },
    {
      module_name: `Module 3: System Design & Evaluation`,
      topics: [
        {
          title: `Synthesis, Testing & Case Studies`,
          description: `Integrates multiple concepts through end-to-end evaluation, testing frameworks, and real-world application case studies.`,
          content_covered: [
            "End-to-end system synthesis and integration",
            "Verification, validation, and test coverage strategies",
            "Real-world case studies and industry applications",
            "Synthesis, review, and exam preparation checklists",
          ],
          estimated_hours: 2.0,
          difficulty_weight: 1.1,
        },
      ],
    },
  ];

  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);
  const totalHours = modules.reduce(
    (sum, m) =>
      sum + m.topics.reduce((tSum, t) => tSum + t.estimated_hours * t.difficulty_weight, 0),
    0
  );

  const summaryPoints = [
    `Curriculum Structure: Extracted 3 foundational modules covering ${totalTopics} key conceptual topics.`,
    `Workload Estimate: Total study investment of ~${Math.round(totalHours * 10) / 10} hours with an average difficulty factor of 1.14x.`,
    `Core Focus Areas: Spans Foundations, Advanced Topics & Algorithms, and System Design & Evaluation.`,
    `Complexity Distribution: Structured from introductory concepts to analytical methods and practical implementation.`,
    `Adaptive SM-2 Strategy: Daily study pacing with automated SuperMemo spaced review sessions to reinforce long-term memory.`,
  ];

  return {
    course_name: baseTitle,
    summary: {
      total_modules: modules.length,
      total_topics: totalTopics,
      total_estimated_hours: Math.round(totalHours * 10) / 10,
      average_difficulty: 1.14,
      overview: `Curriculum extracted for "${baseTitle}". Spans ${modules.length} modules covering ${totalTopics} key conceptual topics requiring ~${Math.round(totalHours)} study hours.`,
      summary_points: summaryPoints,
    },
    modules,
  };
};

/**
 * Validate the structure returned by NLP service
 */
const validateNLPStructure = (data) => {
  if (!data || !Array.isArray(data.modules) || data.modules.length === 0) {
    return false;
  }
  for (const mod of data.modules) {
    if (!mod.module_name || !Array.isArray(mod.topics) || mod.topics.length === 0) {
      return false;
    }
    for (const t of mod.topics) {
      if (!t.title || typeof t.estimated_hours !== "number" || typeof t.difficulty_weight !== "number") {
        return false;
      }
    }
  }
  return true;
};

/**
 * Parse syllabus document via external Python NLP service, with retries, pdf-parse, and fallback
 */
export const parseSyllabusDocument = async (filePath, originalName) => {
  const url = config.nlpServiceUrl;
  const maxRetries = 2;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const formData = new FormData();
      if (fs.existsSync(filePath)) {
        formData.append("file", fs.createReadStream(filePath), originalName);
      } else {
        formData.append("file_name", originalName);
      }

      const response = await axios.post(url, formData, {
        headers: formData.getHeaders ? formData.getHeaders() : {},
        timeout: 10000,
      });

      if (response.data && validateNLPStructure(response.data)) {
        // Ensure all topics have rich description and content_covered
        for (const mod of response.data.modules) {
          for (const t of mod.topics) {
            if (!t.description || !t.content_covered || !Array.isArray(t.content_covered) || t.content_covered.length === 0) {
              const exp = buildTopicExplanation(t.title, mod.module_name);
              t.description = t.description || exp.description;
              t.content_covered = (Array.isArray(t.content_covered) && t.content_covered.length > 0)
                ? t.content_covered
                : exp.content_covered;
            }
          }
        }
        return response.data;
      }
    } catch (err) {
      lastError = err;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }

  // Extract real text from file
  const rawText = await extractRawTextFromFile(filePath, originalName);
  return parseAndSummarizeText(rawText, originalName);
};

export default {
  extractRawTextFromFile,
  parseAndSummarizeText,
  parseSyllabusDocument,
  buildTopicExplanation,
};
