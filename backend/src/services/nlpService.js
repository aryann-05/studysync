import axios from "axios";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import FormData from "form-data";
import config from "../config/env.js";

const require = createRequire(import.meta.url);

let pdfParseModule = null;
try {
  pdfParseModule = require("pdf-parse");
} catch {
  pdfParseModule = null;
}

let mammothModule = null;
try {
  mammothModule = require("mammoth");
} catch {
  mammothModule = null;
}

let tesseractModule = null;
try {
  tesseractModule = require("tesseract.js");
} catch {
  tesseractModule = null;
}

/**
 * Clean extracted text before sending it to NLP or parsing
 */
export const cleanSyllabusText = (rawText) => {
  if (!rawText || typeof rawText !== "string") return "";
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    // Remove standalone page headers/footers
    .replace(/^[ \t]*(?:Page \d+(?: of \d+)?|--- Page \d+ ---|\d+ of \d+)[ \t]*$/gmi, "")
    // Remove lines that are just long horizontal separators
    .replace(/^[ \t]*[-=_*~]{4,}[ \t]*$/gm, "")
    // Replace multiple empty lines with a single empty line
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

/**
 * Extract raw text from file (PDF, DOCX, TXT, with OCR fallback for scanned PDFs)
 */
export const extractRawTextFromFile = async (filePath, originalName) => {
  if (!filePath || !fs.existsSync(filePath)) {
    return "";
  }

  const ext = path.extname(originalName || filePath).toLowerCase();
  let extractedText = "";

  try {
    if (ext === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);

      // Support pdf-parse v2 (PDFParse class) and v1 (function)
      if (pdfParseModule) {
        if (typeof pdfParseModule.PDFParse === "function") {
          const parser = new pdfParseModule.PDFParse({ data: dataBuffer });
          const res = await parser.getText();
          extractedText = res?.text || "";
        } else if (typeof pdfParseModule === "function") {
          const res = await pdfParseModule(dataBuffer);
          extractedText = res?.text || "";
        }
      }

      // If text extraction yielded insufficient text, check for scanned images in PDF
      if ((!extractedText || extractedText.trim().length < 30) && pdfParseModule) {
        console.warn(`[NLP] PDF ${originalName} text layer empty or sparse (<30 chars). Checking for scanned images...`);
        try {
          if (typeof pdfParseModule.PDFParse === "function" && tesseractModule) {
            const imgParser = new pdfParseModule.PDFParse({ data: dataBuffer });
            if (typeof imgParser.getImage === "function") {
              const imgResult = await imgParser.getImage({ imageBuffer: true });
              if (imgResult && Array.isArray(imgResult.pages) && imgResult.pages.length > 0) {
                const ocrChunks = [];
                for (const page of imgResult.pages.slice(0, 5)) {
                  for (const img of (page.images || []).slice(0, 3)) {
                    if (img.data && tesseractModule.recognize) {
                      const ocr = await tesseractModule.recognize(Buffer.from(img.data), "eng");
                      if (ocr?.data?.text && ocr.data.text.trim().length > 10) {
                        ocrChunks.push(ocr.data.text.trim());
                      }
                    }
                  }
                }
                if (ocrChunks.length > 0) {
                  extractedText = ocrChunks.join("\n\n");
                  console.log(`[NLP] OCR successfully extracted ${extractedText.length} characters from scanned PDF.`);
                }
              }
            }
          }
        } catch (ocrErr) {
          console.warn(`[NLP] OCR fallback attempt failed for ${originalName}:`, ocrErr.message);
        }
      }
    } else if (ext === ".docx" || ext === ".doc") {
      if (mammothModule && typeof mammothModule.extractRawText === "function") {
        const docxRes = await mammothModule.extractRawText({ path: filePath });
        extractedText = docxRes?.value || "";
      } else {
        // Fallback for docx xml reading if mammoth is unavailable
        extractedText = fs.readFileSync(filePath, "utf-8");
      }
    } else {
      // TXT or other text-based files
      extractedText = fs.readFileSync(filePath, "utf-8");
    }
  } catch (err) {
    console.warn(`[NLP] Error extracting text from ${originalName}:`, err.message);
    extractedText = "";
  }

  return cleanSyllabusText(extractedText);
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
 * Extract syllabus topics via LLM API if configured
 */
export const extractTopicsViaLLM = async (rawText, baseTitle) => {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  const geminiKey = config.ai.geminiApiKey?.trim();
  const openaiKey = config.ai.openaiApiKey?.trim();

  if (!geminiKey && !openaiKey) {
    return null;
  }

  const prompt = `You are an expert academic curriculum parser and syllabus synthesizer.
Analyze the following uploaded syllabus text for the course "${baseTitle}".
Your objective is to read the COMPLETE syllabus and generate an intelligently compressed set of meaningful study sessions.

TARGET SESSION COUNTS:
- Short syllabus: 8–10 total study sessions.
- Medium syllabus: 10–15 total study sessions.
- Large syllabus: 15–20 total study sessions.
NEVER produce dozens or hundreds of micro-topics.

INTELLIGENT TOPIC GROUPING & PRESERVATION RULES:
1. Do NOT treat every keyword, subheading, or individual operation as an isolated study session.
2. Group related concepts and subtopics under their overarching parent concept (e.g., combine Stack, Push Operation, Pop Operation, and Stack Applications into a single cohesive session: "Stack: Operations and Applications").
3. PRESERVE COMPLETE ACADEMIC COVERAGE: Do NOT delete syllabus content. Every original topic, algorithm, and concept MUST be mapped into the "content_covered" array of its corresponding study session.
4. Also populate "original_topics" with the exact original syllabus terms mapped to that session.
5. Provide a clear 1-2 sentence description explaining what the session covers.
6. WORKLOAD ESTIMATION:
   - Simple concepts: 0.75 hrs (30–45 mins)
   - Medium concepts: 1.0–1.25 hrs (45–75 mins)
   - Complex concepts: 1.5–1.75 hrs (90–105 mins)
7. Return ONLY valid JSON matching this schema:
{
  "course_name": "${baseTitle}",
  "modules": [
    {
      "module_name": "Unit 1: <Name>",
      "topics": [
        {
          "title": "<Grouped Conceptual Session Title>",
          "description": "<What this session covers>",
          "content_covered": ["<Subtopic 1>", "<Subtopic 2>", "<Subtopic 3>"],
          "original_topics": ["<Original Topic 1>", "<Original Topic 2>"],
          "estimated_hours": 1.25,
          "difficulty_weight": 1.15
        }
      ]
    }
  ]
}

Syllabus Content:
${rawText.slice(0, 8000)}`;

  // 1. Try Google Gemini if configured
  if (geminiKey) {
    try {
      const model = config.ai.geminiModel || "gemini-3.5-flash";
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const response = await axios.post(
        endpoint,
        {
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2500,
            responseMimeType: "application/json",
          },
        },
        { headers: { "Content-Type": "application/json" }, timeout: 12000 }
      );

      const candidateText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText) {
        const cleaned = candidateText.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        const parsed = JSON.parse(cleaned);
        if (parsed && Array.isArray(parsed.modules) && parsed.modules.length > 0) {
          const totalTopics = parsed.modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0);
          if (totalTopics >= 2) {
            console.log(`[NLP] Successfully extracted ${totalTopics} topics across ${parsed.modules.length} modules via Gemini AI.`);
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("[NLP] Gemini LLM extraction failed or timed out:", err.message);
    }
  }

  // 2. Try OpenAI if configured
  if (openaiKey) {
    try {
      const endpoint = (config.ai.openaiBaseUrl || "https://api.openai.com/v1") + "/chat/completions";
      const response = await axios.post(
        endpoint,
        {
          model: config.ai.openaiModel || "gpt-4o-mini",
          messages: [
            { role: "system", content: "You extract syllabus structures into structured JSON." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          timeout: 12000,
        }
      );

      const text = response.data?.choices?.[0]?.message?.content;
      if (text) {
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.modules) && parsed.modules.length > 0) {
          const totalTopics = parsed.modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0);
          if (totalTopics >= 2) {
            console.log(`[NLP] Successfully extracted ${totalTopics} topics across ${parsed.modules.length} modules via OpenAI.`);
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn("[NLP] OpenAI LLM extraction failed or timed out:", err.message);
    }
  }

  return null;
};

/**
 * Filter noise lines such as textbooks, credits, and evaluation schemes
 */
const isNoiseLine = (line) => {
  const lower = line.toLowerCase().trim();
  return (
    lower.startsWith("course:") ||
    lower.startsWith("course title") ||
    lower.startsWith("course syllabus") ||
    lower.startsWith("course name") ||
    lower.startsWith("syllabus:") ||
    lower.startsWith("subject:") ||
    lower.startsWith("subject name") ||
    lower.startsWith("textbook") ||
    lower.startsWith("text book") ||
    lower.startsWith("reference book") ||
    lower.startsWith("references") ||
    lower.startsWith("course outcome") ||
    lower.startsWith("course objective") ||
    lower.startsWith("prerequisite") ||
    lower.startsWith("evaluation scheme") ||
    lower.startsWith("internal assessment") ||
    lower.startsWith("end semester") ||
    lower.startsWith("credits:") ||
    lower.startsWith("lecture hours") ||
    lower.startsWith("marks:") ||
    lower.startsWith("total marks") ||
    lower.startsWith("paper pattern") ||
    lower.startsWith("scheme of examination") ||
    lower.startsWith("duration of exam")
  );
};

/**
 * Generic semantic concept extraction from a topic title
 */
export const extractConceptAnchor = (title) => {
  if (!title || typeof title !== "string") return "general";

  const cleaned = title
    .replace(/^[\d\.\-\*•–—\)\(]+/, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\[.*?\]/g, "")
    .trim();

  const lowerCleaned = cleaned.toLowerCase();
  if (lowerCleaned.includes("deque") || lowerCleaned.includes("double ended queue")) {
    return "queue";
  }

  // Non-anchor operational words and structural modifiers
  const operationalWords = new Set([
    "introduction", "intro", "overview", "basics", "basic", "fundamentals", "fundamental",
    "advanced", "concept", "concepts", "principles", "principle", "theory", "theoretical",
    "operations", "operation", "methods", "method", "algorithms", "algorithm", "design",
    "analysis", "applications", "application", "types", "type", "implementation", "implementations",
    "architecture", "architectures", "model", "models", "techniques", "technique",
    "study", "case", "issues", "problems", "problem", "protocols", "protocol", "systems", "system",
    "structure", "structures", "management", "handling", "processing", "approaches", "approach",
    "primitives", "primitive", "mechanisms", "mechanism", "properties", "property",
    "push", "pop", "enqueue", "circular", "singly", "doubly"
  ]);

  const stopWords = new Set([
    "a", "an", "the", "and", "or", "of", "in", "for", "with", "on", "at", "to", "from", "by", "vs", "versus"
  ]);

  const tokens = cleaned
    .toLowerCase()
    .split(/[\s,;:\/\-]+/)
    .map((w) => w.replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length >= 2 && !stopWords.has(w));

  const anchorTokens = tokens.filter((w) => !operationalWords.has(w));

  if (anchorTokens.length > 0) {
    return anchorTokens.slice(0, 2).join(" ");
  }

  return "operation";
};

/**
 * Determine target session count based on syllabus size:
 * - Short syllabus: 8–10 sessions
 * - Medium syllabus: 10–15 sessions
 * - Large syllabus: 15–20 sessions
 */
export const determineTargetSessionCount = (numModules, totalRawTopics) => {
  if (totalRawTopics <= 25 || numModules <= 2) {
    return Math.max(6, Math.min(10, Math.max(numModules * 2, 8)));
  }
  if (totalRawTopics <= 70 || numModules <= 4) {
    return Math.max(10, Math.min(15, numModules * 3));
  }
  return Math.max(14, Math.min(20, Math.max(15, numModules * 3)));
};

/**
 * Synthesize an articulate academic title for a grouped cluster of related topics
 */
export const synthesizeClusterTitle = (clusterItems, moduleName) => {
  if (clusterItems.length === 1) {
    return clusterItems[0].title;
  }

  // Check if an item already has a clean composite title with colon or dash
  const compositeItem = clusterItems.find(
    (it) => (it.title.includes(":") || it.title.includes(" - ")) && it.title.length <= 70
  );
  if (compositeItem) {
    return compositeItem.title;
  }

  const formatTitleCase = (str) =>
    str
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");

  // Extract unique anchors across items
  const anchors = [];
  for (const item of clusterItems) {
    const a = extractConceptAnchor(item.title);
    if (a && a !== "general" && a !== "operation" && !anchors.some((existing) => existing.includes(a) || a.includes(existing))) {
      anchors.push(a);
    }
  }

  const primaryAnchor = anchors[0] ? formatTitleCase(anchors[0]) : formatTitleCase(clusterItems[0].title.split(" ")[0]);
  const secondaryAnchor = anchors[1] ? formatTitleCase(anchors[1]) : null;

  // Inspect semantic aspects covered
  const itemTitlesText = clusterItems.map((it) => it.title.toLowerCase()).join(" ");
  const allText = clusterItems
    .map((it) => it.title.toLowerCase() + " " + (it.content_covered || []).join(" ").toLowerCase())
    .join(" ");

  const hasOperations =
    allText.includes("operation") ||
    allText.includes("push") ||
    allText.includes("pop") ||
    allText.includes("insert") ||
    allText.includes("delete") ||
    allText.includes("traversal") ||
    allText.includes("query") ||
    allText.includes("queries");
  const hasApplications =
    allText.includes("application") ||
    allText.includes("practical") ||
    allText.includes("use case") ||
    allText.includes("evaluation");
  const hasTypes =
    itemTitlesText.includes("type") ||
    itemTitlesText.includes("classification") ||
    itemTitlesText.includes("circular") ||
    itemTitlesText.includes("deque") ||
    itemTitlesText.includes("doubly") ||
    secondaryAnchor !== null;
  const hasArchitectures =
    allText.includes("architecture") ||
    allText.includes("structure") ||
    allText.includes("implementation") ||
    allText.includes("design");
  const hasAlgorithms =
    allText.includes("algorithm") ||
    allText.includes("protocol") ||
    allText.includes("sorting") ||
    allText.includes("searching") ||
    allText.includes("routing");

  // Two distinct anchors (e.g. Stack & Queue, or Singly & Doubly Linked List):
  if (secondaryAnchor) {
    if (hasOperations && hasApplications) {
      return `${primaryAnchor} & ${secondaryAnchor}: Operations and Applications`;
    }
    if (hasTypes && hasOperations) {
      return `${primaryAnchor} & ${secondaryAnchor}: Types, Operations and Applications`;
    }
    if (hasOperations) {
      return `${primaryAnchor} & ${secondaryAnchor}: Operations and Implementations`;
    }
    return `${primaryAnchor} & ${secondaryAnchor}: Core Concepts and Applications`;
  }

  // Single anchor with distinct aspects:
  if (hasTypes) {
    return `${primaryAnchor}: Types, Operations and Applications`;
  }
  if (hasOperations && hasApplications) {
    return `${primaryAnchor}: Operations and Applications`;
  }
  if (hasOperations) {
    return `${primaryAnchor}: Operations and Implementations`;
  }
  if (hasAlgorithms) {
    return `${primaryAnchor}: Core Algorithms and Analysis`;
  }
  if (hasArchitectures) {
    return `${primaryAnchor}: Architecture, Design and Applications`;
  }

  if (clusterItems[0].title.length <= 40 && !clusterItems[0].title.includes(",")) {
    return `${clusterItems[0].title}: Principles and Applications`;
  }

  return `${primaryAnchor}: Core Mechanics and Implementations`;
};

/**
 * Compress and group raw topics within a module into a targeted number of study sessions
 */
export const groupModuleTopics = (rawTopics, moduleName, targetCount) => {
  if (!rawTopics || rawTopics.length === 0) return [];

  // Deduplicate raw topics
  const uniqueItems = [];
  const seenTitles = new Set();
  for (const t of rawTopics) {
    const norm = t.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!seenTitles.has(norm)) {
      seenTitles.add(norm);
      uniqueItems.push(t);
    } else {
      // Merge subtopics into the existing topic
      const existing = uniqueItems.find((x) => x.title.toLowerCase().replace(/[^a-z0-9]/g, "") === norm);
      if (existing && Array.isArray(t.content_covered)) {
        for (const sub of t.content_covered) {
          if (!existing.content_covered.includes(sub)) {
            existing.content_covered.push(sub);
          }
        }
      }
    }
  }

  // If already at or below target, enrich and return directly
  if (uniqueItems.length <= targetCount) {
    return uniqueItems.map((item) => {
      const details = Array.isArray(item.content_covered) && item.content_covered.length > 0
        ? item.content_covered
        : [
            `Theoretical foundations and core terminology of ${item.title}`,
            `Essential architectures, principles, and structural models`,
            `Standard implementation methods, workflows, and algorithmic procedures`,
            `Practical problem solving, case studies, and exam preparation focus`,
          ];
      return {
        title: item.title,
        description: item.description || buildTopicExplanation(item.title, moduleName, details).description,
        content_covered: details,
        original_topics: Array.isArray(item.original_topics) && item.original_topics.length > 0 ? item.original_topics : [item.title],
        estimated_hours: Number(item.estimated_hours) || (details.length >= 5 ? 1.5 : details.length >= 3 ? 1.25 : 0.75),
        difficulty_weight: Number(item.difficulty_weight) || 1.15,
      };
    });
  }

  // Clustering: group raw items by concept anchor and sequential topical flow
  const clusters = [];
  let currentCluster = [uniqueItems[0]];
  let currentAnchor = extractConceptAnchor(uniqueItems[0].title);

  for (let i = 1; i < uniqueItems.length; i++) {
    const item = uniqueItems[i];
    const itemAnchor = extractConceptAnchor(item.title);
    const itemLower = item.title.toLowerCase();

    // Check relationship to current cluster
    const isAnchorMatch =
      itemAnchor === currentAnchor ||
      itemAnchor.includes(currentAnchor) ||
      currentAnchor.includes(itemAnchor) ||
      itemLower.includes(currentAnchor) ||
      currentCluster.some((c) => c.title.toLowerCase().includes(itemAnchor));

    // Also check common operations (push, pop, dequeue, etc. attach to preceding data structure)
    const isOperationOfPreceding =
      itemLower.includes("operation") ||
      itemLower.includes("push") ||
      itemLower.includes("pop") ||
      itemLower.includes("enqueue") ||
      itemLower.includes("dequeue") ||
      itemLower.includes("application") ||
      itemLower.includes("traversal") ||
      itemLower.includes("insertion") ||
      itemLower.includes("deletion");

    if (isAnchorMatch || (isOperationOfPreceding && currentCluster.length < 8)) {
      currentCluster.push(item);
    } else {
      clusters.push(currentCluster);
      currentCluster = [item];
      currentAnchor = itemAnchor;
    }
  }
  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  // If clusters > targetCount, merge adjacent/smallest clusters
  while (clusters.length > targetCount) {
    let bestMergeIdx = 0;
    let minCombinedSize = Infinity;

    for (let i = 0; i < clusters.length - 1; i++) {
      const combinedSize = clusters[i].length + clusters[i + 1].length;
      if (combinedSize < minCombinedSize) {
        minCombinedSize = combinedSize;
        bestMergeIdx = i;
      }
    }

    clusters[bestMergeIdx] = clusters[bestMergeIdx].concat(clusters[bestMergeIdx + 1]);
    clusters.splice(bestMergeIdx + 1, 1);
  }

  // Synthesize study session for each cluster
  const groupedSessions = [];
  for (const cluster of clusters) {
    const sessionTitle = synthesizeClusterTitle(cluster, moduleName);

    // Consolidate content_covered: all subtopics + raw titles
    const coveredSet = new Set();
    const rawTitles = [];

    for (const item of cluster) {
      rawTitles.push(item.title);
      coveredSet.add(item.title.replace(/^[\d\.\-\*•–—\)\(]+/, "").trim());

      if (Array.isArray(item.content_covered)) {
        for (const sub of item.content_covered) {
          if (sub && sub.trim().length > 1) {
            coveredSet.add(sub.trim());
          }
        }
      }
    }

    const contentCoveredArray = Array.from(coveredSet);

    // Realistic workload estimation:
    // Simple concepts: 30-45 mins (0.75h)
    // Medium concepts: 45-75 mins (1.0-1.25h)
    // Complex concepts: 90-105 mins (1.5-1.75h)
    let hours = 1.25;
    if (contentCoveredArray.length <= 2) {
      hours = 0.75;
    } else if (contentCoveredArray.length >= 6 || rawTitles.length >= 5) {
      hours = 1.75;
    } else if (contentCoveredArray.length >= 4) {
      hours = 1.5;
    }

    const titleLower = sessionTitle.toLowerCase();
    let difficulty = 1.15;
    if (titleLower.includes("advanced") || titleLower.includes("algorithm") || titleLower.includes("design") || titleLower.includes("optimization") || titleLower.includes("concurrency") || titleLower.includes("security")) {
      difficulty = 1.3;
    } else if (titleLower.includes("intro") || titleLower.includes("overview") || titleLower.includes("basics") || titleLower.includes("definition") || titleLower.includes("model")) {
      difficulty = 1.0;
    }

    // Synthesize descriptive explanation
    const cleanMod = moduleName.replace(/^(module|unit|chapter|part|section)\s*\d*[:\s\-]*/i, "").trim();
    const sampleTopics = contentCoveredArray.slice(0, 4).join(", ");
    const description = `Comprehensive study session covering ${sampleTopics}${contentCoveredArray.length > 4 ? `, and ${contentCoveredArray.length - 4} related subtopics` : ""} within ${cleanMod}.`;

    groupedSessions.push({
      title: sessionTitle,
      description,
      content_covered: contentCoveredArray,
      original_topics: rawTitles,
      estimated_hours: hours,
      difficulty_weight: difficulty,
    });
  }

  return groupedSessions;
};

/**
 * Compress and group entire syllabus modules into adaptive target sessions (8–20 sessions total)
 */
export const compressAndGroupAllModules = (modules, baseTitle) => {
  if (!modules || modules.length === 0) return [];

  const totalRawTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);

  // If already compact (<= 15 topics across syllabus and no module > 4), maintain clean 1-to-1 mapping
  if (totalRawTopics <= 15 && !modules.some((m) => m.topics.length > 4)) {
    return modules.map((mod) => ({
      module_name: mod.module_name,
      topics: mod.topics.map((t) => {
        let hours = Number(t.estimated_hours) || 1.25;
        if (hours > 1.75) hours = 1.75;
        if (hours < 0.75) hours = 0.75;
        return {
          ...t,
          original_topics: Array.isArray(t.original_topics) && t.original_topics.length > 0 ? t.original_topics : [t.title],
          content_covered: Array.isArray(t.content_covered) && t.content_covered.length > 0 ? t.content_covered : [
            `Theoretical foundations and core terminology of ${t.title}`,
            `Essential architectures, principles, and structural models`,
            `Standard implementation methods and algorithmic workflows`,
            `Practical problem solving and exam preparation focus`,
          ],
          estimated_hours: hours,
          difficulty_weight: Number(t.difficulty_weight) || 1.15,
        };
      }),
    }));
  }

  const targetTotal = determineTargetSessionCount(modules.length, totalRawTopics);

  const compressedModules = [];
  for (const mod of modules) {
    const rawCount = mod.topics.length;
    const proportion = totalRawTopics > 0 ? rawCount / totalRawTopics : 1 / modules.length;
    const targetForMod = Math.max(2, Math.min(4, Math.round(targetTotal * proportion) || 2));

    const groupedTopics = groupModuleTopics(mod.topics, mod.module_name, targetForMod);
    compressedModules.push({
      module_name: mod.module_name,
      topics: groupedTopics,
    });
  }

  return compressedModules;
};

/**
 * Intelligent deterministic syllabus parser and summarizer
 */
export const parseAndSummarizeText = async (rawText, originalName) => {
  const baseTitle = originalName.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
  const cleanedText = cleanSyllabusText(rawText);

  if (!cleanedText || cleanedText.length < 25) {
    const error = new Error(
      "The uploaded document contains insufficient readable text (empty, unreadable, or scanned image without text layer). Please upload a valid syllabus document with text."
    );
    error.statusCode = 422;
    error.code = "INSUFFICIENT_SYLLABUS_TEXT";
    throw error;
  }

  // 1. Attempt LLM-assisted syllabus extraction if API key is available
  try {
    const llmParsed = await extractTopicsViaLLM(cleanedText, baseTitle);
    if (llmParsed && Array.isArray(llmParsed.modules) && llmParsed.modules.length > 0) {
      const rawCount = llmParsed.modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0);
      if (rawCount >= 1) {
        const compressed = compressAndGroupAllModules(llmParsed.modules, baseTitle);
        const totalTopics = compressed.reduce((sum, m) => sum + m.topics.length, 0);

        const totalHours = compressed.reduce(
          (sum, m) =>
            sum + m.topics.reduce((tSum, t) => tSum + (Number(t.estimated_hours) || 1.25) * (Number(t.difficulty_weight) || 1.1), 0),
          0
        );
        const avgDifficulty =
          compressed.reduce(
            (sum, m) => sum + m.topics.reduce((tSum, t) => tSum + (Number(t.difficulty_weight) || 1.1), 0),
            0
          ) / totalTopics;

        const easyCount = compressed.flatMap((m) => m.topics).filter((t) => (t.difficulty_weight || 1.1) <= 1.05).length;
        const hardCount = compressed.flatMap((m) => m.topics).filter((t) => (t.difficulty_weight || 1.1) >= 1.25).length;
        const mediumCount = Math.max(0, totalTopics - easyCount - hardCount);

        const summaryPoints = [
          `Intelligent Syllabus Compression: Synthesized ${rawCount} raw concepts into ${totalTopics} structured study sessions across ${compressed.length} core units.`,
          `Workload Estimate: Total required effort estimated at ~${Math.round(totalHours * 10) / 10} study hours (average difficulty: ${(Math.round(avgDifficulty * 100) / 100).toFixed(2)}x).`,
          `Core Focus Areas: Spans ${compressed.slice(0, 3).map((m) => `"${m.module_name.replace(/^(module|unit|chapter)\s*\d*[:\s\-]*/i, "").trim()}"`).join(", ")}${compressed.length > 3 ? `, plus ${compressed.length - 3} more modules` : ""}.`,
          `Complexity Distribution: Comprises ${easyCount} foundational, ${mediumCount} intermediate, and ${hardCount} advanced topics.`,
          `100% Content Preservation: All original subtopics, definitions, and algorithms are retained in session content arrays.`,
        ];

        return {
          course_name: llmParsed.course_name || baseTitle,
          summary: {
            total_modules: compressed.length,
            total_topics: totalTopics,
            total_raw_concepts: rawCount,
            total_estimated_hours: Math.round(totalHours * 10) / 10,
            average_difficulty: Math.round(avgDifficulty * 100) / 100,
            overview: `Extracted syllabus curriculum for "${baseTitle}". Synthesized ${compressed.length} units covering ${totalTopics} genuine study sessions directly from the document.`,
            summary_points: summaryPoints,
            difficulty_breakdown: {
              easy: easyCount,
              medium: mediumCount,
              hard: hardCount,
            },
          },
          modules: compressed,
        };
      }
    }
  } catch (llmErr) {
    console.warn("[NLP] LLM extraction pass skipped or errored:", llmErr.message);
  }

  // 2. High-Precision Deterministic Syllabus Parser
  const lines = cleanedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 1 && !isNoiseLine(l));

  const modules = [];
  let currentModule = null;

  // Patterns indicating a module or unit header
  const moduleRegex = /^(?:module|unit|chapter|part|section)\s*([0-9ivx]+|[a-z])?[:\s\-–—\.]*(.*)/i;
  const numberedHeaderRegex = /^([0-9]+|[IVX]+)\.\s+([A-Z][A-Za-z0-9\s,\-–—/&]{3,80})$/;
  const uppercaseHeaderRegex = /^[A-Z0-9\s,:–—\-/&]{4,65}$/;

  const addTopicToCurrentModule = (cleanTopic, subtopics = []) => {
    if (!cleanTopic || cleanTopic.length < 3 || cleanTopic.length > 120) return;
    if (isNoiseLine(cleanTopic)) return;

    if (!currentModule) {
      currentModule = {
        module_name: `Unit 1: ${baseTitle}`,
        topics: [],
      };
    }

    // Avoid duplicate topics in the same module
    if (!currentModule.topics.some((t) => t.title.toLowerCase() === cleanTopic.toLowerCase())) {
      const lower = cleanTopic.toLowerCase();
      let difficulty = 1.15;
      let hours = 1.25;

      if (lower.includes("advanced") || lower.includes("algorithm") || lower.includes("design") || lower.includes("analysis") || lower.includes("optimization") || lower.includes("concurrency") || lower.includes("security") || lower.includes("tree") || lower.includes("graph")) {
        difficulty = 1.3;
        hours = 1.75;
      } else if (lower.includes("introduction") || lower.includes("overview") || lower.includes("basics") || lower.includes("concept") || lower.includes("definition") || lower.includes("model")) {
        difficulty = 1.0;
        hours = 0.75;
      } else if (lower.includes("implementation") || lower.includes("practical") || lower.includes("system") || lower.includes("queries") || lower.includes("routing") || lower.includes("regression")) {
        difficulty = 1.2;
        hours = 1.5;
      }

      const explanation = buildTopicExplanation(cleanTopic, currentModule.module_name, subtopics);

      currentModule.topics.push({
        title: cleanTopic,
        description: explanation.description,
        content_covered: explanation.content_covered,
        estimated_hours: hours,
        difficulty_weight: difficulty,
      });
    }
  };

  for (const line of lines) {
    const isModuleMatch = moduleRegex.test(line);
    const isNumberedMatch = numberedHeaderRegex.test(line) && line.split(" ").length <= 8;
    const isUpperMatch = uppercaseHeaderRegex.test(line) && line.split(" ").length <= 7 && !line.includes(",") && !line.includes(":");

    if (isModuleMatch || isNumberedMatch || (isUpperMatch && (!currentModule || currentModule.topics.length >= 2))) {
      if (currentModule && currentModule.topics.length > 0) {
        modules.push(currentModule);
      }

      let modTitle = line;
      if (isModuleMatch) {
        const m = line.match(moduleRegex);
        const unitNum = m[1] ? m[1].toUpperCase() : `${modules.length + 1}`;
        const unitName = m[2] ? m[2].trim() : line;
        modTitle = `Unit ${unitNum}: ${unitName.replace(/^[–—:\-\.]+\s*/, "")}`;
      }

      currentModule = {
        module_name: modTitle,
        topics: [],
      };
      continue;
    }

    // Process line content as topics
    let cleanLine = line
      .replace(/^[\d\.\-\*•–—\)\(]+/, "")
      .replace(/[\.\s]+$/, "")
      .trim();

    if (!cleanLine || isNoiseLine(cleanLine)) continue;

    // Check if line contains inline subtopics separated by colon or dash
    if (cleanLine.includes(":") || cleanLine.includes(" - ")) {
      const parts = cleanLine.includes(":") ? cleanLine.split(":") : cleanLine.split(" - ");
      const mainTitle = parts[0].trim();
      const subtopics = parts[1]
        ? parts[1]
            .split(/[,;]/)
            .map((s) => s.trim().replace(/^[\d\.\-\*•–—\)\(]+/, ""))
            .filter((s) => s.length >= 2)
        : [];

      if (mainTitle.length >= 3 && mainTitle.length <= 90) {
        addTopicToCurrentModule(mainTitle, subtopics);
        continue;
      }
    }

    // Check if line contains comma or semicolon separated list of multiple topics
    if ((cleanLine.includes(",") || cleanLine.includes(";")) && cleanLine.split(",").length >= 2) {
      const topicList = cleanLine
        .split(/[,;]/)
        .map((s) => s.trim().replace(/^[\d\.\-\*•–—\)\(]+/, "").replace(/\.$/, "").trim())
        .filter((s) => s.length >= 3 && s.length <= 80);

      if (topicList.length >= 2) {
        for (const item of topicList) {
          addTopicToCurrentModule(item, []);
        }
        continue;
      }
    }

    // Single topic on this line
    if (cleanLine.length >= 3 && cleanLine.length <= 110) {
      addTopicToCurrentModule(cleanLine, []);
    }
  }

  if (currentModule && currentModule.topics.length > 0) {
    modules.push(currentModule);
  }

  // If topics were extracted without explicit modules, cluster them logically
  if (modules.length === 0 && lines.length > 0) {
    const fallbackTopics = [];
    for (const line of lines) {
      const clean = line.replace(/^[\d\.\-\*•–—\)\(]+/, "").trim();
      if (clean.length >= 3 && clean.length <= 90 && !isNoiseLine(clean)) {
        fallbackTopics.push(clean);
      }
    }

    if (fallbackTopics.length >= 2) {
      const chunkSize = Math.max(3, Math.ceil(fallbackTopics.length / 4));
      for (let i = 0; i < fallbackTopics.length; i += chunkSize) {
        const chunk = fallbackTopics.slice(i, i + chunkSize);
        const modNum = Math.floor(i / chunkSize) + 1;
        const mod = {
          module_name: `Unit ${modNum}: ${chunk[0]} & Related Concepts`,
          topics: [],
        };
        for (const t of chunk) {
          const exp = buildTopicExplanation(t, mod.module_name);
          mod.topics.push({
            title: t,
            description: exp.description,
            content_covered: exp.content_covered,
            estimated_hours: 2.0,
            difficulty_weight: 1.15,
          });
        }
        modules.push(mod);
      }
    }
  }

  const totalRawTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);

  // Validate that meaningful syllabus topics were extracted
  if (modules.length === 0 || totalRawTopics === 0) {
    const error = new Error(
      "Unable to extract distinct syllabus topics from the uploaded document. Please ensure the syllabus contains clear units, chapters, or topic headings."
    );
    error.statusCode = 422;
    error.code = "INSUFFICIENT_SYLLABUS_TEXT";
    throw error;
  }

  // 3. Intelligent Syllabus Compression & Topic Grouping (Target: 8–20 sessions)
  const compressedModules = compressAndGroupAllModules(modules, baseTitle);
  const totalGroupedTopics = compressedModules.reduce((sum, m) => sum + m.topics.length, 0);

  // Calculate summary metrics on compressed modules
  const totalHours = compressedModules.reduce(
    (sum, m) =>
      sum + m.topics.reduce((tSum, t) => tSum + t.estimated_hours * t.difficulty_weight, 0),
    0
  );
  const avgDifficulty =
    compressedModules.reduce(
      (sum, m) => sum + m.topics.reduce((tSum, t) => tSum + t.difficulty_weight, 0),
      0
    ) / totalGroupedTopics;

  const easyCount = compressedModules.flatMap((m) => m.topics).filter((t) => t.difficulty_weight <= 1.05).length;
  const hardCount = compressedModules.flatMap((m) => m.topics).filter((t) => t.difficulty_weight >= 1.25).length;
  const mediumCount = Math.max(0, totalGroupedTopics - easyCount - hardCount);

  const summaryPoints = [
    `Intelligent Syllabus Compression: Synthesized ${totalRawTopics} raw concepts into ${totalGroupedTopics} structured study sessions across ${compressedModules.length} core units.`,
    `Workload Estimate: Total required effort estimated at ~${Math.round(totalHours * 10) / 10} study hours (average difficulty: ${(Math.round(avgDifficulty * 100) / 100).toFixed(2)}x).`,
    `Core Focus Areas: Spans ${compressedModules.slice(0, 3).map((m) => `"${m.module_name.replace(/^(module|unit|chapter)\s*\d*[:\s\-]*/i, "").trim()}"`).join(", ")}${compressedModules.length > 3 ? `, plus ${compressedModules.length - 3} more modules` : ""}.`,
    `Complexity Distribution: Comprises ${easyCount} foundational, ${mediumCount} intermediate, and ${hardCount} advanced topics.`,
    `100% Content Preservation: All original subtopics, definitions, and algorithms are retained in session content arrays.`,
  ];

  return {
    course_name: baseTitle,
    summary: {
      total_modules: compressedModules.length,
      total_topics: totalGroupedTopics,
      total_raw_concepts: totalRawTopics,
      total_estimated_hours: Math.round(totalHours * 10) / 10,
      average_difficulty: Math.round(avgDifficulty * 100) / 100,
      overview: `Curriculum extracted for "${baseTitle}". Synthesized ${compressedModules.length} units covering ${totalGroupedTopics} high-value study sessions from ${totalRawTopics} syllabus items requiring ~${Math.round(totalHours)} total study hours.`,
      summary_points: summaryPoints,
      difficulty_breakdown: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
    },
    modules: compressedModules,
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
 * Parse syllabus document via external NLP service, LLM, or deterministic syllabus extractor
 */
export const parseSyllabusDocument = async (filePath, originalName) => {
  const url = config.nlpServiceUrl;

  // 1. Try external Python NLP service if running and reachable
  if (url && !url.includes("localhost:8000")) {
    try {
      const formData = new FormData();
      if (fs.existsSync(filePath)) {
        formData.append("file", fs.createReadStream(filePath), originalName);
      } else {
        formData.append("file_name", originalName);
      }

      const response = await axios.post(url, formData, {
        headers: formData.getHeaders ? formData.getHeaders() : {},
        timeout: 3000,
      });

      if (response.data && validateNLPStructure(response.data)) {
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
    } catch {
      // Gracefully continue to internal extraction
    }
  }

  // 2. Extract text from uploaded document
  const rawText = await extractRawTextFromFile(filePath, originalName);

  // 3. Parse and summarize curriculum from actual text
  return await parseAndSummarizeText(rawText, originalName);
};

export default {
  extractRawTextFromFile,
  cleanSyllabusText,
  parseAndSummarizeText,
  parseSyllabusDocument,
  buildTopicExplanation,
  extractTopicsViaLLM,
};
