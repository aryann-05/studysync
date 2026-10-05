import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";

describe("FCM Notifications API Endpoints", () => {
  let user, token;

  beforeEach(async () => {
    resetDatabase();
    const u = await createTestUser();
    user = u.user;
    token = u.token;
  });

  it("should successfully register an FCM device token for the authenticated user", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/token")
      .set("Authorization", `Bearer ${token}`)
      .send({
        token: "sample-fcm-device-token-12345",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("token_id");
    expect(res.body.data.user_id).toBe(user.user_id);
  });

  it("should reject token registration when token is missing", async () => {
    const res = await request(app)
      .post("/api/v1/notifications/token")
      .set("Authorization", `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(422);
    expect(res.body.status).toBe("error");
  });
});

