import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";

describe("File Upload API Endpoints", () => {
  let authToken;

  beforeEach(async () => {
    resetDatabase();
    const { token } = await createTestUser();
    authToken = token;
  });

  it("should successfully upload a valid text/plain or PDF document", async () => {
    const res = await request(app)
      .post("/api/v1/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from("Module 1: Data Structures\nModule 2: Algorithms"), "syllabus.txt");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("file_id");
    expect(res.body.data.original_name).toBe("syllabus.txt");
  });

  it("should reject an invalid file extension (e.g. .exe / .png)", async () => {
    const res = await request(app)
      .post("/api/v1/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("file", Buffer.from("malicious binary content"), "script.exe");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.code).toBe("INVALID_FILE_TYPE");
  });

  it("should return 400 when no file is attached", async () => {
    const res = await request(app)
      .post("/api/v1/upload")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.code).toBe("NO_FILE_PROVIDED");
  });
});

