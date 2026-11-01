import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";
import { parseSyllabusDocument } from "../src/services/nlpService.js";
import { generateInitialSchedule, calculateCapacityAndEffort } from "../src/services/schedulingService.js";
import { formatDateOnly, addDays } from "../src/utils/dateUtils.js";

// Sample Syllabi Definitions
const SYLLABI = {
  dsa: `COURSE SYLLABUS: DATA STRUCTURES AND ALGORITHMS
Unit 1: Linear Data Structures
- Singly and Doubly Linked Lists: Node structures, traversal, insertion, and reversal
- Stack and Queue Operations: Array implementation, circular queue, applications of stacks
- Priority Queues and Heaps: Min-heap, max-heap, and heapify operations

Unit 2: Non-Linear Hierarchical Structures
- Binary Search Trees: BST invariants, insertion, deletion, and in-order traversal
- AVL and Red-Black Trees: Self-balancing rotations, balance factors, height analysis
- Tree Traversal Algorithms: Pre-order, in-order, post-order, and level-order traversals

Unit 3: Graph Algorithms
- Graph Representation and Traversals: Adjacency matrix, adjacency list, BFS, DFS
- Shortest Path Algorithms: Dijkstra's algorithm and Bellman-Ford algorithm
- Minimum Spanning Trees: Kruskal's algorithm, Prim's algorithm, Disjoint-Set Union

Unit 4: Algorithm Design and Optimization
- Divide and Conquer: Merge sort, quick sort with randomized pivot selection
- Dynamic Programming: 0/1 Knapsack problem, Longest Common Subsequence, memoization
- Greedy Algorithms: Huffman coding, fractional knapsack, interval scheduling`,

  dbms: `COURSE SYLLABUS: DATABASE MANAGEMENT SYSTEMS
Unit 1: Relational Data Models and SQL
- Relational Algebra Operations: Select, project, Cartesian product, theta joins, set operations
- Advanced SQL Queries: Subqueries, correlated queries, aggregate functions, window functions
- Views and Integrity Constraints: Primary keys, foreign keys, assertions, and domain constraints

Unit 2: Database Design and Normalization
- Functional Dependencies: Armstrong's axioms, attribute closure, minimal covers
- Normal Forms: First normal form, 2NF, Third Normal Form (3NF), Boyce-Codd Normal Form (BCNF)
- Lossless Decomposition: Dependency preservation, multi-valued dependencies, 4NF

Unit 3: Transaction Processing and Concurrency Control
- ACID Properties: Atomicity, consistency, isolation levels, durability guarantees
- Concurrency Control Protocols: Two-Phase Locking (2PL), strict 2PL, timestamp ordering
- Deadlock Handling: Wait-die scheme, wound-wait scheme, detection with wait-for graphs

Unit 4: Storage Architecture and Indexing
- File Organization: Heap files, sorted files, hashed file organizations
- Tree-Structured Indexing: B+ Trees, index search, node splitting and merging
- Query Processing and Optimization: Relational algebra equivalence rules, cost estimation`,

  os: `COURSE SYLLABUS: OPERATING SYSTEMS
Unit 1: Process and Thread Management
- Process Control and Scheduling: PCB state transitions, context switching, CPU scheduling algorithms (FCFS, SJF, Round Robin)
- Inter-Process Communication: Shared memory, message passing, Unix pipes, signals
- Threading Models and Concurrency: Kernel vs user threads, pthread APIs, race conditions

Unit 2: Synchronization and Deadlocks
- Synchronization Primitives: Mutex locks, counting semaphores, monitors, condition variables
- Deadlock Characterization: Coffman conditions, resource allocation graphs
- Deadlock Prevention and Avoidance: Banker's algorithm for safe states, recovery strategies

Unit 3: Memory Architecture and Virtual Memory
- Contiguous Allocation and Paging: Fixed/variable partitioning, page tables, Translation Lookaside Buffer (TLB)
- Segmentation and Inverted Page Tables: Segment tables, protection bits, address translation
- Page Replacement Algorithms: FIFO, Least Recently Used (LRU), Optimal, clock algorithm

Unit 4: Storage and File Systems
- File System Implementation: Inodes, directory structures, contiguous and indexed allocation
- Disk Scheduling: FCFS, SSTF, SCAN, C-SCAN algorithms and rotational latency
- Protection and Security: Access control matrices, capabilities, and system call boundaries`,

  cn: `COURSE SYLLABUS: COMPUTER NETWORKS
Unit 1: Network Architecture and Application Layer
- Layered Models: OSI 7-layer reference model, TCP/IP protocol stack, packet encapsulation
- Domain Name System: Hierarchical DNS resolution, DNS records, recursive vs iterative queries
- Web and Application Protocols: HTTP/1.1 vs HTTP/2 vs HTTP/3, WebSocket, SMTP, FTP

Unit 2: Transport Layer Protocols
- Transport Principles: Multiplexing, demultiplexing, connectionless UDP datagrams
- Transmission Control Protocol: 3-way handshake, connection teardown, TCP header structure
- Flow and Congestion Control: Sliding window protocol, Reno, Cubic, slow start, fast retransmit

Unit 3: Network Layer and Routing
- IPv4 and IPv6 Addressing: Subnetting, CIDR notation, NAT traversal, IPv6 header format
- Routing Algorithms: Link-state (Dijkstra), Distance-vector (Bellman-Ford), split horizon
- Routing Protocols: Interior Gateway (OSPF, RIP), Exterior Gateway (BGP peering and policies)

Unit 4: Data Link Layer and Local Area Networks
- Error Detection and Correction: Parity checks, CRC-32 polynomials, Hamming codes
- Multiple Access Control: CSMA/CD, CSMA/CA, Ethernet frame formats, collision detection
- Switching and VLANs: Link-layer switches, ARP protocol, VLAN tagging (802.1Q)`,

  ml: `COURSE SYLLABUS: MACHINE LEARNING
Unit 1: Supervised Learning Fundamentals
- Linear Regression and Regularization: Least squares optimization, Ridge regression (L2), Lasso (L1)
- Classification and Logistic Regression: Sigmoid activation, cross-entropy loss, decision boundaries
- Support Vector Machines: Maximum margin hyperplanes, soft margin formulation, kernel trick (RBF)

Unit 2: Tree-Based Models and Ensembles
- Decision Tree Induction: Information gain, entropy, Gini impurity, CART algorithm
- Ensemble Methods: Bootstrap aggregating (Bagging), Random Forests, feature importance
- Boosting Algorithms: AdaBoost, Gradient Boosting Machines (GBM), XGBoost fundamentals

Unit 3: Unsupervised Learning and Dimensionality Reduction
- Clustering Techniques: K-Means algorithm, inertia optimization, hierarchical agglomerative clustering
- Dimensionality Reduction: Principal Component Analysis (PCA), singular value decomposition (SVD)
- Density Estimation: Gaussian Mixture Models (GMM), Expectation-Maximization (EM) algorithm

Unit 4: Neural Networks and Deep Learning
- Perceptrons and Multi-Layer Networks: Feedforward architecture, activation functions (ReLU, GELU)
- Optimization Algorithms: Backpropagation, stochastic gradient descent, Adam optimizer
- Model Evaluation and Validation: Bias-variance tradeoff, K-fold cross-validation, ROC-AUC, precision-recall`,
};

describe("Syllabus Analysis & Personalized Study Schedule Generation", () => {
  let authToken;

  beforeAll(async () => {
    resetDatabase();
    const { token } = await createTestUser();
    authToken = token;
  });

  describe("Requirement 1 & 2: Syllabus Reading & Non-Generic NLP Topic Extraction", () => {
    const extractedResults = {};

    for (const [key, text] of Object.entries(SYLLABI)) {
      it(`should accurately parse ${key.toUpperCase()} syllabus without generic placeholders`, async () => {
        // Upload syllabus text
        const uploadRes = await request(app)
          .post("/api/v1/upload")
          .set("Authorization", `Bearer ${authToken}`)
          .attach("file", Buffer.from(text), `${key}_syllabus.txt`);

        expect(uploadRes.status).toBe(200);
        const fileId = uploadRes.body.data.file_id;

        // Extract topics via API
        const extractRes = await request(app)
          .post("/api/v1/plans/extract-topics")
          .set("Authorization", `Bearer ${authToken}`)
          .send({ file_id: fileId });

        expect(extractRes.status).toBe(200);
        expect(extractRes.body.status).toBe("success");

        const { modules, summary } = extractRes.body.data;
        expect(Array.isArray(modules)).toBe(true);
        expect(modules.length).toBeGreaterThanOrEqual(3);
        expect(summary.total_topics).toBeGreaterThanOrEqual(6);

        // Collect all extracted topic names
        const topicTitles = modules.flatMap((m) => m.topics.map((t) => t.title));
        extractedResults[key] = topicTitles;

        // Verify NO generic forbidden topics
        const forbiddenGenericTitles = [
          "Fundamentals",
          "Core Concepts",
          "Introduction",
          "Advanced Topics",
          "Important Concepts",
          "General Overview",
        ];

        for (const title of topicTitles) {
          expect(forbiddenGenericTitles).not.toContain(title);
        }

        // Verify each topic has genuine description and content_covered
        for (const mod of modules) {
          for (const topic of mod.topics) {
            expect(typeof topic.description).toBe("string");
            expect(topic.description.length).toBeGreaterThan(15);
            expect(Array.isArray(topic.content_covered)).toBe(true);
            expect(topic.content_covered.length).toBeGreaterThan(0);
          }
        }
      });
    }

    it("should produce distinctly different topic lists across all 5 courses", () => {
      const keys = Object.keys(extractedResults);
      expect(keys.length).toBe(5);

      // Verify pairwise uniqueness across DSA, DBMS, OS, CN, ML
      for (let i = 0; i < keys.length; i++) {
        for (let j = i + 1; j < keys.length; j++) {
          const topicsA = new Set(extractedResults[keys[i]].map((t) => t.toLowerCase()));
          const topicsB = new Set(extractedResults[keys[j]].map((t) => t.toLowerCase()));

          // The intersection between two different curricula should be 0 or near 0
          const intersection = [...topicsA].filter((t) => topicsB.has(t));
          expect(intersection.length).toBeLessThanOrEqual(1); // At most 1 coincidentally overlapping term
        }
      }

      // Check specific domains
      const dsaList = extractedResults["dsa"].join(" ").toLowerCase();
      const dbmsList = extractedResults["dbms"].join(" ").toLowerCase();
      const osList = extractedResults["os"].join(" ").toLowerCase();
      const cnList = extractedResults["cn"].join(" ").toLowerCase();
      const mlList = extractedResults["ml"].join(" ").toLowerCase();

      expect(dsaList).toContain("linked list");
      expect(dbmsList).toContain("normal");
      expect(osList).toContain("process");
      expect(cnList).toContain("transmission control protocol");
      expect(mlList).toContain("regression");
    });
  });

  describe("Requirement 3 & 4: Exact N-Day Study Plan Schedules (7, 15, 30 Days)", () => {
    let dsaFileId;

    beforeAll(async () => {
      const uploadRes = await request(app)
        .post("/api/v1/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("file", Buffer.from(SYLLABI.dsa), "dsa_full_curriculum.txt");
      dsaFileId = uploadRes.body.data.file_id;
    });

    it("Test 7-Day Plan: should generate sessions covering exactly 7 days with 0 empty days", async () => {
      const startDate = "2026-11-01";
      const res = await request(app)
        .post("/api/v1/plans/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          course_name: "DSA 7-Day Sprint",
          file_id: dsaFileId,
          start_date: startDate,
          duration_days: 7,
          daily_max_hours: 6.0,
        });

      expect(res.status).toBe(201);
      const data = res.body.data;
      expect(data.duration_days).toBe(7);

      // Verify sessions exist
      const sessions = data.sessions;
      expect(sessions.length).toBeGreaterThanOrEqual(7);

      // Collect unique scheduled dates
      const uniqueDates = new Set(
        sessions.map((s) => formatDateOnly(s.scheduled_date))
      );

      // Must cover exactly 7 calendar days with ZERO empty days
      expect(uniqueDates.size).toBe(7);
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const expectedDate = formatDateOnly(addDays(startDate, dayOffset));
        expect(uniqueDates.has(expectedDate)).toBe(true);
      }

      // Verify 100% topic coverage: Every leaf topic in the plan has at least one INITIAL session
      const topicIdsInPlan = new Set(sessions.map((s) => s.topic_id));
      expect(topicIdsInPlan.size).toBe(data.total_topics);

      // Verify pedagogical session types
      const sessionTypes = new Set(sessions.map((s) => s.session_type));
      expect(sessionTypes.has("INITIAL")).toBe(true);
      expect(sessionTypes.has("ASSESSMENT")).toBe(true);
    });

    it("Test 15-Day Plan: should generate sessions covering exactly 15 days with 0 empty days", async () => {
      const startDate = "2026-11-01";
      const res = await request(app)
        .post("/api/v1/plans/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          course_name: "DSA 15-Day Bootcamp",
          file_id: dsaFileId,
          start_date: startDate,
          duration_days: 15,
          daily_max_hours: 4.0,
        });

      expect(res.status).toBe(201);
      const data = res.body.data;
      expect(data.duration_days).toBe(15);

      const sessions = data.sessions;
      const uniqueDates = new Set(
        sessions.map((s) => formatDateOnly(s.scheduled_date))
      );

      // Must cover all 15 calendar days with ZERO empty days
      expect(uniqueDates.size).toBe(15);
      for (let dayOffset = 0; dayOffset < 15; dayOffset++) {
        const expectedDate = formatDateOnly(addDays(startDate, dayOffset));
        expect(uniqueDates.has(expectedDate)).toBe(true);
      }

      // Verify 100% topic coverage
      const topicIdsInPlan = new Set(sessions.map((s) => s.topic_id));
      expect(topicIdsInPlan.size).toBe(data.total_topics);

      // Verify spaced reviews and practice sessions exist
      const sessionTypes = new Set(sessions.map((s) => s.session_type));
      expect(sessionTypes.has("INITIAL")).toBe(true);
      expect(sessionTypes.has("REVIEW")).toBe(true);
      expect(sessionTypes.has("ASSESSMENT")).toBe(true);
    });

    it("Test 30-Day Plan: should generate sessions covering exactly 30 days with 0 empty days", async () => {
      const startDate = "2026-11-01";
      const res = await request(app)
        .post("/api/v1/plans/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          course_name: "DSA 30-Day Comprehensive Mastery",
          file_id: dsaFileId,
          start_date: startDate,
          duration_days: 30,
          daily_max_hours: 3.5,
        });

      expect(res.status).toBe(201);
      const data = res.body.data;
      expect(data.duration_days).toBe(30);

      const sessions = data.sessions;
      const uniqueDates = new Set(
        sessions.map((s) => formatDateOnly(s.scheduled_date))
      );

      // Must cover all 30 calendar days with ZERO empty days
      expect(uniqueDates.size).toBe(30);
      for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
        const expectedDate = formatDateOnly(addDays(startDate, dayOffset));
        expect(uniqueDates.has(expectedDate)).toBe(true);
      }

      // Verify 100% topic coverage
      const topicIdsInPlan = new Set(sessions.map((s) => s.topic_id));
      expect(topicIdsInPlan.size).toBe(data.total_topics);

      // Verify milestone spaced reviews, practice, and final mock exam
      const sessionTypes = new Set(sessions.map((s) => s.session_type));
      expect(sessionTypes.has("INITIAL")).toBe(true);
      expect(sessionTypes.has("REVIEW")).toBe(true);
      expect(sessionTypes.has("PRACTICE")).toBe(true);
      expect(sessionTypes.has("ASSESSMENT")).toBe(true);
    });
  });

  describe("Requirement 5: Input Validation & Error Handling", () => {
    it("should reject empty syllabus file or file with insufficient text (< 25 chars) with 422", async () => {
      const uploadRes = await request(app)
        .post("/api/v1/upload")
        .set("Authorization", `Bearer ${authToken}`)
        .attach("file", Buffer.from("Too short"), "empty.txt");

      const fileId = uploadRes.body.data.file_id;

      const res = await request(app)
        .post("/api/v1/plans/extract-topics")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ file_id: fileId });

      expect(res.status).toBe(422);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("INSUFFICIENT_SYLLABUS_TEXT");
    });

    it("should reject invalid duration_days (e.g. negative or > 365) with 422", async () => {
      const res = await request(app)
        .post("/api/v1/plans/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          course_name: "Invalid Duration Course",
          modules: [
            {
              module_name: "Unit 1: Test",
              topics: [{ title: "Topic 1", estimated_hours: 2.0, difficulty_weight: 1.0 }],
            },
          ],
          start_date: "2026-11-01",
          duration_days: -5,
          daily_max_hours: 4.0,
        });

      expect(res.status).toBe(422);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject when neither duration_days nor exam_date is provided", async () => {
      const res = await request(app)
        .post("/api/v1/plans/generate")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          course_name: "Missing Date Range Course",
          modules: [
            {
              module_name: "Unit 1: Test",
              topics: [{ title: "Topic 1", estimated_hours: 2.0, difficulty_weight: 1.0 }],
            },
          ],
          start_date: "2026-11-01",
          daily_max_hours: 4.0,
        });

      expect(res.status).toBe(422);
      expect(res.body.status).toBe("error");
    });
  });
});
