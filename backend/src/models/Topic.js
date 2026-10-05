import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const topicSchema = new mongoose.Schema(
  {
    topic_id: {
      type: String,
      default: () => uuidv4(),
      unique: true,
      index: true,
    },
    plan_id: {
      type: String,
      required: true,
      index: true,
    },
    parent_topic_id: {
      type: String,
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    estimated_hours: {
      type: Number,
      default: 1.0,
    },
    difficulty_weight: {
      type: Number,
      default: 1.0,
    },
    ease_factor: {
      type: Number,
      default: 2.5,
    },
    repetition_number: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret._id;
        return ret;
      },
    },
  }
);

export const Topic = mongoose.models.Topic || mongoose.model("Topic", topicSchema, "topics");
export default Topic;

