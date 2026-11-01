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

  const prompt = `You are an expert academic curriculum parser.
Analyze the following uploaded syllabus text for the course "${baseTitle}".
Extract ALL genuine units/modules, topics, and subtopics directly from the document text.

STRICT INSTRUCTIONS:
1. Extract topics directly from the syllabus content. DO NOT invent topics that are not present.
2. DO NOT use generic topics like "Fundamentals", "Core Concepts", "Introduction", "Advanced Topics", or "Important Concepts" unless literally written as headings in the text.
3. Preserve the original unit names, numbers, and topic titles as closely as possible.
4. Extract subtopics into the "content_covered" array for each topic.
5. Assign realistic study hours (between 1.5 and 3.5) and difficulty weights (1.0 for foundational, 1.2 for intermediate, 1.3-1.4 for advanced).
6. Return ONLY valid JSON (no markdown formatting, no code blocks) matching this exact JSON schema:
{
  "course_name": "${baseTitle}",
  "modules": [
    {
      "module_name": "Unit 1: <Name>",
      "topics": [
        {
          "title": "<Exact Topic Name>",
          "description": "<Clear 1-2 sentence explanation of what this topic covers>",
          "content_covered": ["<Subtopic 1>", "<Subtopic 2>", "<Subtopic 3>"],
          "estimated_hours": 2.0,
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
      const totalTopics = llmParsed.modules.reduce((sum, m) => sum + (m.topics?.length || 0), 0);
      if (totalTopics >= 2) {
        // Calculate metrics
        const totalHours = llmParsed.modules.reduce(
          (sum, m) =>
            sum + (m.topics || []).reduce((tSum, t) => tSum + (Number(t.estimated_hours) || 2.0) * (Number(t.difficulty_weight) || 1.1), 0),
          0
        );
        const avgDifficulty =
          llmParsed.modules.reduce(
            (sum, m) => sum + (m.topics || []).reduce((tSum, t) => tSum + (Number(t.difficulty_weight) || 1.1), 0),
            0
          ) / totalTopics;

        const easyCount = llmParsed.modules.flatMap((m) => m.topics || []).filter((t) => (t.difficulty_weight || 1.1) <= 1.05).length;
        const hardCount = llmParsed.modules.flatMap((m) => m.topics || []).filter((t) => (t.difficulty_weight || 1.1) >= 1.25).length;
        const mediumCount = Math.max(0, totalTopics - easyCount - hardCount);

        const summaryPoints = [
          `Curriculum Structure: Extracted ${llmParsed.modules.length} syllabus modules covering ${totalTopics} specific topics.`,
          `Workload Estimate: Total required effort estimated at ~${Math.round(totalHours * 10) / 10} study hours (average difficulty: ${(Math.round(avgDifficulty * 100) / 100).toFixed(2)}x).`,
          `Core Focus Areas: Spans ${llmParsed.modules.slice(0, 3).map((m) => `"${m.module_name.replace(/^(module|unit|chapter)\s*\d*[:\s\-]*/i, "").trim()}"`).join(", ")}${llmParsed.modules.length > 3 ? `, plus ${llmParsed.modules.length - 3} more modules` : ""}.`,
          `Complexity Distribution: Comprises ${easyCount} foundational, ${mediumCount} intermediate, and ${hardCount} advanced topics.`,
          `Adaptive Pacing: Sessions dynamically distributed across your chosen timeline with balanced daily study load and pre-exam assessments.`,
        ];

        return {
          course_name: llmParsed.course_name || baseTitle,
          summary: {
            total_modules: llmParsed.modules.length,
            total_topics: totalTopics,
            total_estimated_hours: Math.round(totalHours * 10) / 10,
            average_difficulty: Math.round(avgDifficulty * 100) / 100,
            overview: `Extracted syllabus curriculum for "${baseTitle}". Spans ${llmParsed.modules.length} units covering ${totalTopics} genuine topics directly from the document.`,
            summary_points: summaryPoints,
            difficulty_breakdown: {
              easy: easyCount,
              medium: mediumCount,
              hard: hardCount,
            },
          },
          modules: llmParsed.modules,
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
      let hours = 2.0;

      if (lower.includes("advanced") || lower.includes("algorithm") || lower.includes("design") || lower.includes("analysis") || lower.includes("optimization") || lower.includes("concurrency") || lower.includes("security")) {
        difficulty = 1.3;
        hours = 2.5;
      } else if (lower.includes("introduction") || lower.includes("overview") || lower.includes("basics") || lower.includes("concept") || lower.includes("definition") || lower.includes("model")) {
        difficulty = 1.0;
        hours = 1.5;
      } else if (lower.includes("implementation") || lower.includes("practical") || lower.includes("system") || lower.includes("queries") || lower.includes("routing") || lower.includes("regression")) {
        difficulty = 1.2;
        hours = 2.0;
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

  const totalTopics = modules.reduce((sum, m) => sum + m.topics.length, 0);

  // Validate that meaningful syllabus topics were extracted
  if (modules.length === 0 || totalTopics === 0) {
    const error = new Error(
      "Unable to extract distinct syllabus topics from the uploaded document. Please ensure the syllabus contains clear units, chapters, or topic headings."
    );
    error.statusCode = 422;
    error.code = "INSUFFICIENT_SYLLABUS_TEXT";
    throw error;
  }

  // Calculate summary metrics
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

  const easyCount = modules.flatMap((m) => m.topics).filter((t) => t.difficulty_weight <= 1.05).length;
  const hardCount = modules.flatMap((m) => m.topics).filter((t) => t.difficulty_weight >= 1.25).length;
  const mediumCount = Math.max(0, totalTopics - easyCount - hardCount);

  const summaryPoints = [
    `Curriculum Structure: Extracted ${modules.length} syllabus modules covering ${totalTopics} specific topics.`,
    `Workload Estimate: Total required effort estimated at ~${Math.round(totalHours * 10) / 10} study hours (average difficulty: ${(Math.round(avgDifficulty * 100) / 100).toFixed(2)}x).`,
    `Core Focus Areas: Spans ${modules.slice(0, 3).map((m) => `"${m.module_name.replace(/^(module|unit|chapter)\s*\d*[:\s\-]*/i, "").trim()}"`).join(", ")}${modules.length > 3 ? `, plus ${modules.length - 3} more modules` : ""}.`,
    `Complexity Distribution: Comprises ${easyCount} foundational, ${mediumCount} intermediate, and ${hardCount} advanced topics.`,
    `Adaptive SM-2 Strategy: Spaced repetition intervals automatically adjust based on post-session confidence ratings to optimize retention.`,
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
      difficulty_breakdown: {
        easy: easyCount,
        medium: mediumCount,
        hard: hardCount,
      },
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
