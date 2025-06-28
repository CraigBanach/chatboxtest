import OpenAI from "openai";
import {
  ResponseCreateParamsStreaming,
  Tool,
} from "openai/resources/responses/responses.mjs";

export const functions: Tool[] = [
  {
    type: "function",
    strict: false,
    name: "store_user_preferences",
    description:
      "Store the user's favorite country, continent, and destination.",
    parameters: {
      type: "object",
      properties: {
        country: { type: "string", description: "The user's favorite country" },
        continent: {
          type: "string",
          description: "The user's favorite continent",
        },
        destination: {
          type: "string",
          description: "The user's favorite destination",
        },
      },
      additionalProperties: false,
    },
  },
];

export const openaiClient = new OpenAI({
  apiKey: process.env["OPENAI_KEY"],
  project: process.env["OPEN_AI_PROJECT_ID"],
});

export type { ResponseCreateParamsStreaming, Tool };
