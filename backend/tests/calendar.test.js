import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";
import StudyPlan from "../src/models/StudyPlan.js";
import Topic from "../src/models/Topic.js";
import StudySession from "../src/models/StudySession.js";

describe("Calendar API Endpoints", () => {
  let userA, tokenA;
  let userB, tokenB;

  beforeEach(async () => {
    resetDatabase();
    const uA = await createTestUser({ email: "user_a@test.com" });
    userA = uA.user;
    tokenA = uA.token;

    const uB = await createTestUser({ email: "user_b@test.com" });
    userB = uB.user;
    tokenB = uB.token;

    // Seed session for User A
    const planA = await StudyPlan.create({
      user_id: userA.user_id,
      course_name: "Algorithms",
      start_date: new Date("2026-08-01"),
      exam_date: new Date("2026-08-30"),
    });

    const topicA = await Topic.create({
      plan_id: planA.plan_id,
      title: "Dijkstra's Algorithm",
      estimated_hours: 1.5,
    });

    await StudySession.create({
      user_id: userA.user_id,
      topic_id: topicA.topic_id,
      scheduled_date: new Date("2026-08-10"),
      duration_hours: 1.5,
      session_type: "INITIAL",
    });

    // Seed session for User B
    const planB = await StudyPlan.create({
      user_id: userB.user_id,
      course_name: "Database Systems",
      start_date: new Date("2026-08-01"),
      exam_date: new Date("2026-08-30"),
    });

    const topicB = await Topic.create({
      plan_id: planB.plan_id,
      title: "B-Trees",
      estimated_hours: 2.0,
    });

    await StudySession.create({
      user_id: userB.user_id,
      topic_id: topicB.topic_id,
      scheduled_date: new Date("2026-08-10"),
      duration_hours: 2.0,
      session_type: "INITIAL",
    });
  });

  it("should return sessions for authenticated user", async () => {
    const res = await request(app)
      .get("/api/v1/calendar")
      .set("Authorization", `Bearer ${tokenA}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.sessions.length).toBe(1);
    expect(res.body.data.sessions[0].topic_title).toBe("Dijkstra's Algorithm");
  });

  it("should enforce strict user isolation (User B only sees User B's sessions)", async () => {
    const res = await request(app)
      .get("/api/v1/calendar")
      .set("Authorization", `Bearer ${tokenB}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.sessions.length).toBe(1);
    expect(res.body.data.sessions[0].topic_title).toBe("B-Trees");
  });

  it("should reject unauthenticated request with 401", async () => {
    const res = await request(app).get("/api/v1/calendar");
    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");
  });
});
