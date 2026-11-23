import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";
import StudyPlan from "../src/models/StudyPlan.js";
import Topic from "../src/models/Topic.js";
import StudySession from "../src/models/StudySession.js";

describe("Fall-Behind Reshuffling API Endpoints", () => {
  let user, token;

  beforeEach(async () => {
    resetDatabase();
    const u = await createTestUser();
    user = u.user;
    token = u.token;
  });

  it("should return 0 reshuffled when there are no overdue sessions", async () => {
    const res = await request(app)
      .post("/api/v1/plans/reshuffle")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.sessions_reshuffled).toBe(0);
    expect(res.body.data.overload_warning).toBe(false);
  });

  it("should successfully reshuffle overdue incomplete sessions into future valid slots", async () => {
    const plan = await StudyPlan.create({
      user_id: user.user_id,
      course_name: "Discrete Mathematics",
      start_date: new Date("2026-01-01"),
      exam_date: new Date("2026-12-31"),
    });

    const topic = await Topic.create({
      plan_id: plan.plan_id,
      title: "Graph Theory",
      estimated_hours: 2.0,
    });

    // Create overdue session scheduled in the past
    await StudySession.create({
      user_id: user.user_id,
      topic_id: topic.topic_id,
      scheduled_date: new Date("2026-01-10"),
      duration_hours: 2.0,
      session_type: "INITIAL",
      is_completed: false,
    });

    const res = await request(app)
      .post("/api/v1/plans/reshuffle")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.sessions_reshuffled).toBe(1);
    expect(res.body.data.overload_warning).toBe(false);
  });
});
