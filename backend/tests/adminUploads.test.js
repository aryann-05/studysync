import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser, createTestAdmin } from "./testHelpers.js";
import Upload from "../src/models/Upload.js";

describe("Admin Uploads & Document Management API", () => {
  beforeEach(() => {
    resetDatabase();
  });

  it("should reject unauthenticated request to /api/v1/admin/uploads with 401", async () => {
    const res = await request(app).get("/api/v1/admin/uploads");
    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");
  });

  it("should reject non-admin users with 403 Forbidden", async () => {
    const { token: studentToken } = await createTestUser();
    const res = await request(app)
      .get("/api/v1/admin/uploads")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.status).toBe("error");
  });

  it("should allow admin to fetch uploads with user details and stats", async () => {
    const { token: adminToken } = await createTestAdmin();
    const { user: student } = await createTestUser({
      full_name: "Rahul Sharma",
      email: "rahul.s@example.com",
    });

    // Seed test upload
    await Upload.create({
      upload_id: "file_test_pdf_01",
      user_id: student.user_id,
      original_name: "MCA_Data_Structures_Syllabus.pdf",
      stored_name: "MCA_Data_Structures_Syllabus.pdf",
      file_path: "/tmp/MCA_Data_Structures_Syllabus.pdf",
      mime_type: "application/pdf",
      size: 204800,
      document_type: "pdf",
      extracted_topics_count: 14,
    });

    const res = await request(app)
      .get("/api/v1/admin/uploads")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.uploads).toBeInstanceOf(Array);
    expect(res.body.data.uploads.length).toBeGreaterThanOrEqual(1);

    const found = res.body.data.uploads.find((u) => u.upload_id === "file_test_pdf_01");
    expect(found).toBeDefined();
    expect(found.original_name).toBe("MCA_Data_Structures_Syllabus.pdf");
    expect(found.document_type).toBe("pdf");
    expect(found.user).toBeDefined();
    expect(found.user.full_name).toBe("Rahul Sharma");
    expect(found.user.email).toBe("rahul.s@example.com");

    // Stats
    expect(res.body.data.stats).toBeDefined();
    expect(res.body.data.stats.total_uploads).toBeGreaterThanOrEqual(1);
    expect(res.body.data.stats.pdf_count).toBeGreaterThanOrEqual(1);
  });

  it("should support search filtering by file name and user name", async () => {
    const { token: adminToken } = await createTestAdmin();
    const { user: student } = await createTestUser({
      full_name: "Priya Patel",
      email: "priya.p@example.com",
    });

    await Upload.create({
      upload_id: "file_test_txt_02",
      user_id: student.user_id,
      original_name: "Algorithms_Unit1.txt",
      stored_name: "Algorithms_Unit1.txt",
      file_path: "/tmp/Algorithms_Unit1.txt",
      mime_type: "text/plain",
      size: 5120,
      document_type: "txt",
    });

    const res = await request(app)
      .get("/api/v1/admin/uploads?search=Priya")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.uploads.length).toBe(1);
    expect(res.body.data.uploads[0].user.full_name).toBe("Priya Patel");
  });

  it("should retrieve single upload details with user info via GET /api/v1/admin/uploads/:id", async () => {
    const { token: adminToken } = await createTestAdmin();
    const { user: student } = await createTestUser({
      full_name: "Aman Verma",
      email: "aman.v@example.com",
    });

    await Upload.create({
      upload_id: "file_test_doc_03",
      user_id: student.user_id,
      original_name: "Operating_Systems.docx",
      stored_name: "Operating_Systems.docx",
      file_path: "/tmp/Operating_Systems.docx",
      mime_type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 102400,
      document_type: "docx",
    });

    const res = await request(app)
      .get("/api/v1/admin/uploads/file_test_doc_03")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.original_name).toBe("Operating_Systems.docx");
    expect(res.body.data.user.full_name).toBe("Aman Verma");
  });

  it("should delete an upload via DELETE /api/v1/admin/uploads/:id", async () => {
    const { token: adminToken } = await createTestAdmin();
    const { user: student } = await createTestUser();

    await Upload.create({
      upload_id: "file_test_delete_04",
      user_id: student.user_id,
      original_name: "Delete_Me.pdf",
      stored_name: "Delete_Me.pdf",
      file_path: "/tmp/Delete_Me.pdf",
      mime_type: "application/pdf",
      size: 1024,
      document_type: "pdf",
    });

    const res = await request(app)
      .delete("/api/v1/admin/uploads/file_test_delete_04")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

