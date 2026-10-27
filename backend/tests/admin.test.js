import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser, createTestAdmin } from "./testHelpers.js";
import User from "../src/models/User.js";

describe("Two-Role Authentication & Admin Dashboard API", () => {
  beforeEach(() => {
    resetDatabase();
  });

  describe("Role Enforcement on Public Registration", () => {
    it("should strictly assign 'user' role by default during public registration", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          full_name: "Jane Student",
          email: "jane.student@example.com",
          password: "Password@123",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("user");
      expect(res.body.data.status).toBe("active");
    });

    it("should ignore or disallow client-supplied 'admin' role in registration payload", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          full_name: "Sneaky Hacker",
          email: "hacker@example.com",
          password: "Password@123",
          role: "admin", // Client attempt to escalate privileges
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.role).toBe("user"); // Still strictly "user"!

      // Verify in DB directly
      const savedUser = await User.findOne({ email: "hacker@example.com" });
      expect(savedUser.role).toBe("user");
    });
  });

  describe("Role-Based Authorization & Route Guards", () => {
    it("should reject unauthenticated requests to Admin endpoints with 401 Unauthorized", async () => {
      const endpoints = [
        "/api/v1/admin/dashboard/stats",
        "/api/v1/admin/users",
        "/api/admin/dashboard/stats",
      ];

      for (const endpoint of endpoints) {
        const res = await request(app).get(endpoint);
        expect(res.status).toBe(401);
        expect(res.body.status).toBe("error");
        expect(res.body.error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should deny standard User accounts access to Admin endpoints with 403 Forbidden", async () => {
      const { token: userToken } = await createTestUser({ role: "user" });

      const res = await request(app)
        .get("/api/v1/admin/dashboard/stats")
        .set("Authorization", `Bearer ${userToken}`);

      expect(res.status).toBe(403);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("FORBIDDEN");
      expect(res.body.message).toContain("Admin privileges required");
    });

    it("should allow Admin accounts to access Admin endpoints with 200 OK", async () => {
      const { token: adminToken } = await createTestAdmin();

      const res = await request(app)
        .get("/api/v1/admin/dashboard/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("total_users");
      expect(res.body.data).toHaveProperty("total_students");
      expect(res.body.data).toHaveProperty("active_users");
    });
  });

  describe("Admin Dashboard Statistics: GET /api/v1/admin/dashboard/stats", () => {
    it("should accurately calculate total users, students, active, and inactive accounts", async () => {
      const { token: adminToken } = await createTestAdmin();

      // Create 2 students (1 active, 1 inactive) and 1 regular user
      await createTestUser({
        full_name: "Active Student",
        account_type: "student",
        status: "active",
      });
      await createTestUser({
        full_name: "Inactive Student",
        account_type: "student",
        status: "inactive",
      });
      await createTestUser({
        full_name: "Regular Learner",
        account_type: "regular",
        status: "active",
      });

      const res = await request(app)
        .get("/api/v1/admin/dashboard/stats")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.total_users).toBe(4); // 3 users + 1 admin
      expect(res.body.data.total_students).toBe(2);
      expect(res.body.data.total_regular_users).toBe(2); // 1 regular + 1 admin
      expect(res.body.data.active_users).toBe(3);
      expect(res.body.data.inactive_users).toBe(1);
      expect(res.body.data.recent_registrations).toHaveLength(4);
    });
  });

  describe("Admin Users Management: GET /api/v1/admin/users", () => {
    it("should return a paginated list of registered users with search and filter support", async () => {
      const { token: adminToken } = await createTestAdmin();

      await createTestUser({ full_name: "Alice Johnson", email: "alice@test.com", account_type: "student" });
      await createTestUser({ full_name: "Bob Smith", email: "bob@test.com", account_type: "regular" });
      await createTestUser({ full_name: "Charlie Brown", email: "charlie@test.com", status: "inactive" });

      // 1. Basic pagination
      const res1 = await request(app)
        .get("/api/v1/admin/users?page=1&limit=2")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res1.status).toBe(200);
      expect(res1.body.data.users).toHaveLength(2);
      expect(res1.body.data.pagination.total_users).toBe(4); // 3 created + 1 admin
      expect(res1.body.data.pagination.total_pages).toBe(2);
      expect(res1.body.data.pagination.has_next_page).toBe(true);

      // 2. Search by name or email
      const searchRes = await request(app)
        .get("/api/v1/admin/users?search=Alice")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.users).toHaveLength(1);
      expect(searchRes.body.data.users[0].full_name).toBe("Alice Johnson");

      // 3. Filter by status
      const filterRes = await request(app)
        .get("/api/v1/admin/users?status=inactive")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(filterRes.status).toBe(200);
      expect(filterRes.body.data.users).toHaveLength(1);
      expect(filterRes.body.data.users[0].full_name).toBe("Charlie Brown");
    });
  });

  describe("Admin User Inspection & Updates", () => {
    it("should retrieve individual user details by ID", async () => {
      const { token: adminToken } = await createTestAdmin();
      const { user } = await createTestUser({ full_name: "David Miller" });

      const res = await request(app)
        .get(`/api/v1/admin/users/${user.user_id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.user_id).toBe(user.user_id);
      expect(res.body.data.user.full_name).toBe("David Miller");
      expect(res.body.data.stats).toHaveProperty("study_plans_count");
    });

    it("should update permitted user information", async () => {
      const { token: adminToken } = await createTestAdmin();
      const { user } = await createTestUser({ full_name: "Emily Watson", daily_max_hours: 3.0 });

      const res = await request(app)
        .patch(`/api/v1/admin/users/${user.user_id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          full_name: "Emily Watson-Smith",
          daily_max_hours: 5.5,
          account_type: "regular",
        });

      expect(res.status).toBe(200);
      expect(res.body.data.full_name).toBe("Emily Watson-Smith");
      expect(res.body.data.daily_max_hours).toBe(5.5);
      expect(res.body.data.account_type).toBe("regular");
    });

    it("should toggle user account status between active and inactive", async () => {
      const { token: adminToken } = await createTestAdmin();
      const { user } = await createTestUser({ status: "active" });

      // Deactivate user
      const deactRes = await request(app)
        .patch(`/api/v1/admin/users/${user.user_id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "inactive" });

      expect(deactRes.status).toBe(200);
      expect(deactRes.body.data.status).toBe("inactive");

      // Verify deactivated user cannot log in
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: user.email,
          password: "Password@123",
        });

      expect(loginRes.status).toBe(403);
      expect(loginRes.body.error.code).toBe("ACCOUNT_INACTIVE");

      // Re-activate user
      const actRes = await request(app)
        .patch(`/api/v1/admin/users/${user.user_id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "active" });

      expect(actRes.status).toBe(200);
      expect(actRes.body.data.status).toBe("active");
    });

    it("should prevent an admin from deactivating their own account", async () => {
      const { user: adminUser, token: adminToken } = await createTestAdmin();

      const res = await request(app)
        .patch(`/api/v1/admin/users/${adminUser.user_id}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "inactive" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("SELF_STATUS_MODIFICATION");
    });

    it("should delete user account and prevent self-deletion", async () => {
      const { user: adminUser, token: adminToken } = await createTestAdmin();
      const { user: regularUser } = await createTestUser();

      // Self-deletion prevented
      const selfDelRes = await request(app)
        .delete(`/api/v1/admin/users/${adminUser.user_id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(selfDelRes.status).toBe(400);
      expect(selfDelRes.body.error.code).toBe("SELF_DELETION_DENIED");

      // Delete regular user
      const delRes = await request(app)
        .delete(`/api/v1/admin/users/${regularUser.user_id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(delRes.status).toBe(200);

      // Verify deletion from DB
      const found = await User.findOne({ user_id: regularUser.user_id });
      expect(found).toBeNull();
    });
  });
});

