import { post } from "./api";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SyllabusContextPayload {
  course_name?: string;
  exam_date?: string;
  topics?: string[];
}

export interface ChatApiResponse {
  status: string;
  success: boolean;
  message?: string;
  reply: string;
  data?: {
    reply: string;
    source?: string;
    model?: string;
    configured?: boolean;
  };
}

/**
 * Send a chat message with previous conversation context to the backend AI endpoint.
 * Dispatches to real LLM API on the backend (OpenAI / Gemini) without any client-side hardcoded rules.
 */
export async function sendChatMessage(
  message: string,
  history: ChatMessage[] = [],
  syllabusContext?: SyllabusContextPayload | null
): Promise<{ reply: string; source?: string; configured?: boolean }> {
  try {
    const formattedConversation = history.slice(-15).map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const response = await post<ChatApiResponse>("/chat", {
      message: message.trim(),
      conversation: formattedConversation,
      syllabus_context: syllabusContext || undefined,
    });

    const reply = response.reply || response.data?.reply;
    if (!reply) {
      throw new Error("No reply text returned from assistant");
    }

    return {
      reply,
      source: response.data?.source,
      configured: response.data?.configured,
    };
  } catch (err: any) {
    const serverMessage = err?.response?.data?.reply || err?.response?.data?.message;
    if (serverMessage && typeof serverMessage === "string") {
      return { reply: serverMessage };
    }
    return {
      reply: "Sorry, I couldn't generate a response right now. Please try again.",
    };
  }
}

