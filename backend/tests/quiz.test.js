import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";
import StudyPlan from "../src/models/StudyPlan.js";
import Topic from "../src/models/Topic.js";

describe("Quiz Section Feature API Endpoints", () => {
  let user, token, plan, topics;

  beforeEach(async () => {
    resetDatabase();
    const u = await createTestUser();
    user = u.user;
    token = u.token;

    plan = await StudyPlan.create({
      user_id: user.user_id,
      course_name: "Data Structures & Algorithms",
      start_date: new Date("2026-08-01"),
      exam_date: new Date("2026-10-15"),
    });

    topics = await Promise.all([
      Topic.create({
        plan_id: plan.plan_id,
        title: "Module 1: Array Fundamentals & Complexity",
        estimated_hours: 2.0,
      }),
      Topic.create({
        plan_id: plan.plan_id,
        title: "Module 1: Linked Lists & Memory Pointers",
        estimated_hours: 2.0,
      }),
      Topic.create({
        plan_id: plan.plan_id,
        title: "Module 2: Depth First Search (DFS)",
        estimated_hours: 2.5,
      }),
      Topic.create({
        plan_id: plan.plan_id,
        title: "Module 2: Dijkstra's Shortest Path Algorithm",
        estimated_hours: 3.0,
      }),
    ]);
  });

  it("should generate 2 to 3 quizzes per module scheduled strictly before exam date", async () => {
    const res = await request(app)
      .get("/api/v1/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(res.body.status).toBe("success");
    expect(res.body.data.quizzes).toBeDefined();
    expect(res.body.data.quizzes.length).toBeGreaterThanOrEqual(4);

    const examDate = new Date(plan.exam_date).getTime();

    for (const quiz of res.body.data.quizzes) {
      expect(quiz.quiz_id).toBeDefined();
      expect(quiz.module_name).toBeDefined();
      expect(quiz.quiz_number).toBeGreaterThanOrEqual(1);
      expect(quiz.total_marks).toBeGreaterThanOrEqual(1);

      // Verify scheduled date is strictly before exam date
      const quizDate = new Date(quiz.scheduled_date).getTime();
      expect(quizDate).toBeLessThan(examDate);
    }
  });

  it("should retrieve quiz details and questions for a valid quiz_id", async () => {
    const listRes = await request(app)
      .get("/api/v1/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const firstQuiz = listRes.body.data.quizzes[0];

    const detailRes = await request(app)
      .get(`/api/v1/quizzes/${firstQuiz.quiz_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    expect(detailRes.body.status).toBe("success");
    expect(detailRes.body.data.quiz_id).toBe(firstQuiz.quiz_id);
    expect(detailRes.body.data.questions.length).toBeGreaterThanOrEqual(1);
    expect(detailRes.body.data.questions[0].options.length).toBeGreaterThanOrEqual(2);
  });

  it("should evaluate submitted answers, return marks and provide feedback on which topics to focus more", async () => {
    const listRes = await request(app)
      .get("/api/v1/quizzes")
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const quiz = listRes.body.data.quizzes[0];

    // Submit answers intentionally missing one question
    const detailRes = await request(app)
      .get(`/api/v1/quizzes/${quiz.quiz_id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);

    const questions = detailRes.body.data.questions;
    const answers = [
      { question_id: questions[0].question_id, selected_index: 0 },
      // select incorrect index 3 for the remaining
      ...questions.slice(1).map((q) => ({
        question_id: q.question_id,
        selected_index: 3,
      })),
    ];

    const submitRes = await request(app)
      .post(`/api/v1/quizzes/${quiz.quiz_id}/submit`)
      .set("Authorization", `Bearer ${token}`)
      .send({ answers })
      .expect(200);

    expect(submitRes.body.status).toBe("success");
    expect(submitRes.body.data.score).toBeDefined();
    expect(submitRes.body.data.total_marks).toBe(quiz.total_marks);
    expect(submitRes.body.data.percentage).toBeDefined();
    expect(submitRes.body.data.feedback).toBeDefined();
    expect(submitRes.body.data.feedback).toContain("Focus more on");
    expect(submitRes.body.data.weak_topics.length).toBeGreaterThan(0);
  });
});
