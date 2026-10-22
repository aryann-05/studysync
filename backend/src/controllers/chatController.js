import chatService from "../services/chatService.js";
import { sendError } from "../utils/response.js";
import StudyPlan from "../models/StudyPlan.js";
import Topic from "../models/Topic.js";

export const sendMessage = async (req, res, next) => {
  try {
    const { message, conversation, syllabus_context } = req.body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return sendError(res, "Message is required and cannot be empty", "INVALID_INPUT", 400);
    }

    if (message.length > 2500) {
      return sendError(
        res,
        "Message is too long. Please limit your message to 2500 characters.",
        "MESSAGE_TOO_LONG",
        400
      );
    }

    if (conversation && !Array.isArray(conversation)) {
      return sendError(res, "Conversation must be an array of previous messages", "INVALID_INPUT", 400);
    }

    if (conversation && conversation.length > 30) {
      return sendError(res, "Conversation history exceeds the maximum allowed length (30)", "HISTORY_TOO_LONG", 400);
    }

    // Resolve active syllabus / study plan context if available
    let resolvedSyllabusContext = syllabus_context || null;

    if (!resolvedSyllabusContext && req.user && req.user.user_id) {
      try {
        const activePlan = await StudyPlan.findOne({
          user_id: req.user.user_id,
          is_active: true,
        }).lean();

        if (activePlan) {
          const topics = await Topic.find({ plan_id: activePlan.plan_id })
            .select("title estimated_hours")
            .limit(25)
            .lean();

          resolvedSyllabusContext = {
            course_name: activePlan.course_name,
            exam_date: activePlan.exam_date,
            topics: topics.map((t) => t.title),
          };
        }
      } catch (dbErr) {
        // Silently proceed without syllabus context on DB error
      }
    }

    const result = await chatService.generateChatReply({
      message: message.trim(),
      conversation: conversation || [],
      user: req.user || null,
      syllabusContext: resolvedSyllabusContext,
    });

    return res.status(200).json({
      status: "success",
      success: true,
      message: "Chat response generated successfully",
      reply: result.reply,
      data: {
        reply: result.reply,
        source: result.source,
        model: result.model,
        configured: result.configured,
      },
    });
  } catch (error) {
    console.error("❌ Chat Controller Error:", error);
    return res.status(500).json({
      status: "error",
      success: false,
      message: "Sorry, I couldn't generate a response right now. Please try again.",
      reply: "Sorry, I couldn't generate a response right now. Please try again.",
      error: {
        code: "CHAT_GENERATION_FAILED",
      },
    });
  }
};

export default {
  sendMessage,
};

