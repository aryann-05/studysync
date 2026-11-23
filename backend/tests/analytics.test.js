import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";
import StudyPlan from "../src/models/StudyPlan.js";
import Topic from "../src/models/Topic.js";
import StudySession from "../src/models/StudySession.js";

describe("Analytics API Endpoints", () => {
  let user, token;

  beforeEach(async () => {
    resetDatabase();
    const u = await createTestUser();
    user = u.user;
    token = u.token;

    const plan = await StudyPlan.create({
      user_id: user.user_id,
      course_name: "Machine Learning",
      start_date: new Date("2026-08-01"),
      exam_date: new Date("2026-10-01"),
    });

    const topic = await Topic.create({
      plan_id: plan.plan_id,
      title: "Linear Regression",
      estimated_hours: 2.0,
      ease_factor: 2.50,
    });

    // 2 completed sessions, 1 pending session
    await StudySession.create({
      user_id: user.user_id,
      topic_id: topic.topic_id,
      scheduled_date: new Date(),
      duration_hours: 1.0,
      session_type: "INITIAL",
      is_completed: true,
      confidence_score: 4,
      completed_at: new Date(),
    });

    await StudySession.create({
      user_id: user.user_id,
      topic_id: topic.topic_id,
      scheduled_date: new Date(),
      duration_hours: 1.0,
      session_type: "INITIAL",
      is_completed: true,
      confidence_score: 5,
      completed_at: new Date(),
    });

    await StudySession.create({
      user_id: user.user_id,
      topic_id: topic.topic_id,
      scheduled_date: new Date(Date.now() + 86400000), // tomorrow
      duration_hours: 1.0,
      session_type: "INITIAL",
      is_completed: false,
    });
  });

  it("should calculate correct completion percentage, counts, and streak", async () => {
    const res = await request(app)
      .get("/api/v1/analytics")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.total_sessions).toBe(3);
    expect(res.body.data.completed_sessions).toBe(2);
    expect(res.body.data.pending_sessions).toBe(1);
    expect(res.body.data.overall_completion).toBe(67);
    expect(res.body.data.current_streak).toBeGreaterThanOrEqual(1);
    expect(res.body.data.mastery).toHaveProperty("Machine Learning");
  });
});
