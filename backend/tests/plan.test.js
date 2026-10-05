import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";

describe("Study Plan Generation API Endpoints", () => {
  let authToken;
  let fileId;

  beforeEach(async () => {
    resetDatabase();
    const { token } = await createTestUser();
    authToken = token;

    // Upload a dummy syllabus document to obtain valid file_id
    const uploadRes = await request(app)
      .post("/api/v1/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from("Module 1: Algorithms\nTopic: Binary Search"), "dsa_syllabus.txt");

    fileId = uploadRes.body.data.file_id;
  });

  it("should successfully generate a study plan with topics and initial sessions", async () => {
    const res = await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        course_name: "Data Structures & Algorithms",
        file_id: fileId,
        start_date: "2026-08-01",
        exam_date: "2026-10-15",
        daily_max_hours: 4.0,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("plan_id");
    expect(res.body.data.course_name).toBe("Data Structures & Algorithms");
    expect(res.body.data.total_topics).toBeGreaterThan(0);
    expect(res.body.data.total_sessions).toBeGreaterThan(0);
  });

  it("should reject when exam_date is before or equal to start_date", async () => {
    const res = await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        course_name: "Operating Systems",
        file_id: fileId,
        start_date: "2026-08-10",
        exam_date: "2026-08-05",
        daily_max_hours: 3.0,
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });

  it("should return schedule overload warning when available capacity is insufficient", async () => {
    // Only 1 day available with 0.5 hours daily max: total capacity = 0.5 hrs, but curriculum effort is > 10 hrs
    const res = await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        course_name: "Overload Course",
        file_id: fileId,
        start_date: "2026-08-01",
        exam_date: "2026-08-02",
        daily_max_hours: 0.5,
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.code).toBe("SCHEDULE_OVERLOAD");
  });

  it("should extract topics and curriculum summary from uploaded file", async () => {
    const res = await request(app)
      .post("/api/v1/plans/extract-topics")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ file_id: fileId });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("summary");
    expect(res.body.data).toHaveProperty("modules");
    expect(Array.isArray(res.body.data.modules)).toBe(true);
    expect(res.body.data.summary.total_modules).toBeGreaterThan(0);
  });

  it("should retrieve the active study plan and its sessions", async () => {
    // Generate a plan first
    await request(app)
      .post("/api/v1/plans/generate")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        course_name: "Active Plan Course",
        file_id: fileId,
        start_date: "2026-08-01",
        exam_date: "2026-10-15",
        daily_max_hours: 4.0,
      });

    const res = await request(app)
      .get("/api/v1/plans/active")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.plan).not.toBeNull();
    expect(res.body.data.plan.course_name).toBe("Active Plan Course");
    expect(res.body.data.plan.topics.length).toBeGreaterThan(0);
    expect(res.body.data.plan.sessions.length).toBeGreaterThan(0);
  });
});

