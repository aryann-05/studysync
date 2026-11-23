import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";
import StudyPlan from "../src/models/StudyPlan.js";
import Topic from "../src/models/Topic.js";
import StudySession from "../src/models/StudySession.js";

describe("Confidence & SM-2 Adaptive Learning Endpoints", () => {
  let user, token;
  let session;

  beforeEach(async () => {
    resetDatabase();
    const u = await createTestUser();
    user = u.user;
    token = u.token;

    const plan = await StudyPlan.create({
      user_id: user.user_id,
      course_name: "Computer Networks",
      start_date: new Date("2026-08-01"),
      exam_date: new Date("2026-09-15"),
    });

    const topic = await Topic.create({
      plan_id: plan.plan_id,
      title: "TCP Congestion Control",
      estimated_hours: 1.0,
      difficulty_weight: 1.0,
      ease_factor: 2.50,
      repetition_number: 0,
    });

    session = await StudySession.create({
      user_id: user.user_id,
      topic_id: topic.topic_id,
      scheduled_date: new Date("2026-08-02"),
      duration_hours: 1.0,
      session_type: "INITIAL",
      is_completed: false,
    });
  });

  it("should process low confidence score 1: drop ease factor and create 45-min remedial session", async () => {
    const res = await request(app)
      .post("/api/v1/sessions/confidence")
      .set("Authorization", `Bearer ${token}`)
      .send({
        session_id: session.session_id,
        confidence_score: 1,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.is_completed).toBe(true);
    expect(res.body.data.remedial_session_created).toBe(true);
    expect(res.body.data.updated_ease_factor).toBeLessThan(2.50);
  });

  it("should process medium confidence score 3: calculate normal SM-2 review interval", async () => {
    const res = await request(app)
      .post("/api/v1/sessions/confidence")
      .set("Authorization", `Bearer ${token}`)
      .send({
        session_id: session.session_id,
        confidence_score: 3,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.is_completed).toBe(true);
    expect(res.body.data.remedial_session_created).toBe(false);
  });

  it("should process high confidence score 5: increase ease factor", async () => {
    const res = await request(app)
      .post("/api/v1/sessions/confidence")
      .set("Authorization", `Bearer ${token}`)
      .send({
        session_id: session.session_id,
        confidence_score: 5,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.is_completed).toBe(true);
    expect(res.body.data.updated_ease_factor).toBe(2.60);
  });

  it("should reject confidence scores outside 1-5 with 400 Bad Request", async () => {
    const res = await request(app)
      .post("/api/v1/sessions/confidence")
      .set("Authorization", `Bearer ${token}`)
      .send({
        session_id: session.session_id,
        confidence_score: 6,
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("should reject unauthorized access when a user tries to complete another user's session", async () => {
    const intruder = await createTestUser({ email: "intruder@test.com" });

    const res = await request(app)
      .post("/api/v1/sessions/confidence")
      .set("Authorization", `Bearer ${intruder.token}`)
      .send({
        session_id: session.session_id,
        confidence_score: 4,
      });

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
  });
});
