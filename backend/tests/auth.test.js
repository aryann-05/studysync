import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";

describe("Authentication API Endpoints", () => {
  beforeEach(() => {
    resetDatabase();
  });

  describe("POST /api/v1/auth/register", () => {
    it("should successfully register a new user and return 201 without password_hash", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          full_name: "Aryan Rajput",
          email: "aryan@example.com",
          password: "Password@123",
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("user_id");
      expect(res.body.data.email).toBe("aryan@example.com");
      expect(res.body.data.full_name).toBe("Aryan Rajput");
      expect(res.body.data).not.toHaveProperty("password_hash");
    });

    it("should return 409 Conflict when attempting to register a duplicate email", async () => {
      await request(app)
        .post("/api/v1/auth/register")
        .send({
          full_name: "Aryan Rajput",
          email: "aryan@example.com",
          password: "Password@123",
        });

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          full_name: "Aryan Duplicate",
          email: "aryan@example.com",
          password: "Password@123",
        });

      expect(res.status).toBe(409);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("DUPLICATE_EMAIL");
    });

    it("should return 422 for invalid email or password", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          full_name: "A",
          email: "not-an-email",
          password: "short",
        });

      expect(res.status).toBe(422);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should successfully login with valid credentials and return tokens", async () => {
      const { rawPassword } = await createTestUser({
        email: "student@test.com",
        password: "MySecurePassword@1",
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "student@test.com",
          password: rawPassword,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data).toHaveProperty("access_token");
      expect(res.body.data).toHaveProperty("refresh_token");
      expect(res.body.data.user.email).toBe("student@test.com");
      expect(res.body.data.user).not.toHaveProperty("password_hash");
    });

    it("should return 401 for incorrect password", async () => {
      await createTestUser({
        email: "student@test.com",
        password: "CorrectPassword@1",
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "student@test.com",
          password: "WrongPassword@99",
        });

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("Authorization Header Verification", () => {
    it("should reject protected route when Authorization header is missing (401)", async () => {
      const res = await request(app).get("/api/v1/calendar");
      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should reject protected route when JWT is invalid (401)", async () => {
      const res = await request(app)
        .get("/api/v1/calendar")
        .set("Authorization", "Bearer invalid.token.value");

      expect(res.status).toBe(401);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("INVALID_TOKEN");
    });
  });
});

