import { jest } from "@jest/globals";
import request from "supertest";
import app from "../src/app.js";
import { resetDatabase, createTestUser } from "./testHelpers.js";
import chatService from "../src/services/chatService.js";
import config from "../src/config/env.js";

describe("Real LLM-Powered Chatbot API Endpoints", () => {
  beforeEach(() => {
    resetDatabase();
  });

  describe("POST /api/v1/chat - LLM Integration & Validation", () => {
    it("should prompt user to configure an API key when neither OpenAI nor Gemini is configured", async () => {
      // Ensure no keys set
      const origOpenAI = config.ai.openaiApiKey;
      const origGemini = config.ai.geminiApiKey;
      config.ai.openaiApiKey = "";
      config.ai.geminiApiKey = "";

      const res = await request(app)
        .post("/api/v1/chat")
        .send({
          message: "Who was Albert Einstein?",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toContain("API key");
      expect(res.body.data.configured).toBe(false);

      // Restore
      config.ai.openaiApiKey = origOpenAI;
      config.ai.geminiApiKey = origGemini;
    });

    it("should reject an empty message with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/chat")
        .send({
          message: "    ",
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.message).toContain("Message is required");
    });

    it("should reject messages exceeding length limit with 400 Bad Request", async () => {
      const longMessage = "x".repeat(2600);
      const res = await request(app)
        .post("/api/v1/chat")
        .send({
          message: longMessage,
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("MESSAGE_TOO_LONG");
    });

    it("should reject non-array conversation parameter with 400 Bad Request", async () => {
      const res = await request(app)
        .post("/api/v1/chat")
        .send({
          message: "What is quantum physics?",
          conversation: "invalid-string",
        });

      expect(res.status).toBe(400);
      expect(res.body.status).toBe("error");
      expect(res.body.error.code).toBe("INVALID_INPUT");
    });

    it("should support the alias /api/chat endpoint", async () => {
      const spy = jest
        .spyOn(chatService, "generateChatReply")
        .mockResolvedValueOnce({
          reply: "Hello from StudySync AI!",
          source: "mock-llm",
          model: "gemini-3.5-flash",
          configured: true,
        });

      const res = await request(app)
        .post("/api/chat")
        .send({
          message: "Hello AI",
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toBe("Hello from StudySync AI!");
      spy.mockRestore();
    });

    it("should dynamically return LLM-generated responses when LLM service is invoked", async () => {
      const mockLLMResponse = {
        reply: "Albert Einstein was a theoretical physicist best known for developing the theory of relativity (E=mc²).",
        source: "openai-responses",
        model: "gpt-4o-mini",
        configured: true,
      };

      const spy = jest
        .spyOn(chatService, "generateChatReply")
        .mockResolvedValueOnce(mockLLMResponse);

      const res = await request(app)
        .post("/api/v1/chat")
        .send({
          message: "Who was Albert Einstein?",
          conversation: [
            { role: "user", content: "Tell me about famous physicists." },
            { role: "assistant", content: "There are many, including Newton and Einstein." },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.reply).toBe(mockLLMResponse.reply);
      expect(res.body.data.source).toBe("openai-responses");
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Who was Albert Einstein?",
          conversation: expect.arrayContaining([
            expect.objectContaining({ content: "Tell me about famous physicists." }),
          ]),
        })
      );

      spy.mockRestore();
    });

    it("should dynamically answer any arbitrary question via LLM (e.g. quantum physics, photosynthesis, jokes)", async () => {
      const arbitraryQuestions = [
        {
          q: "Explain photosynthesis in one sentence.",
          a: "Photosynthesis is the process by which green plants use sunlight, water, and carbon dioxide to create oxygen and energy in the form of sugar.",
        },
        {
          q: "What is 25 * 48?",
          a: "25 * 48 = 1,200.",
        },
        {
          q: "What is the capital of Australia?",
          a: "The capital of Australia is Canberra.",
        },
      ];

      for (const item of arbitraryQuestions) {
        const spy = jest
          .spyOn(chatService, "generateChatReply")
          .mockResolvedValueOnce({
            reply: item.a,
            source: "openai-chat",
            model: "gpt-4o-mini",
            configured: true,
          });

        const res = await request(app)
          .post("/api/v1/chat")
          .send({ message: item.q });

        expect(res.status).toBe(200);
        expect(res.body.reply).toBe(item.a);
        spy.mockRestore();
      }
    });

    it("should gracefully handle external LLM API errors without leaking server internals", async () => {
      const spy = jest
        .spyOn(chatService, "generateChatReply")
        .mockRejectedValueOnce(new Error("Rate limit exceeded on OpenAI"));

      const res = await request(app)
        .post("/api/v1/chat")
        .send({
          message: "Write an SQL query to find duplicate records.",
        });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Sorry, I couldn't generate a response right now. Please try again.");
      expect(res.body.reply).toBe("Sorry, I couldn't generate a response right now. Please try again.");
      expect(res.body).not.toHaveProperty("stack");

      spy.mockRestore();
    });
  });
});
