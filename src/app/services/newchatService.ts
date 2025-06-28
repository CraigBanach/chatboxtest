import { FinalConverseResponse } from "@/app/services/oldChatService";
import { OpenAI } from "openai";
import { Tool } from "openai/resources/responses/responses.mjs";

const openai = new OpenAI({
  apiKey: process.env["OPENAI_KEY"],
  project: process.env["OPEN_AI_PROJECT_ID"],
});

const tools: Array<Tool> = [
  {
    type: "function",
    name: "get_weather",
    description: "Get current temperature for provided coordinates in celsius.",
    parameters: {
      type: "object",
      properties: {
        latitude: { type: "number" },
        longitude: { type: "number" },
      },
      required: ["latitude", "longitude"],
      additionalProperties: false,
    },
    strict: true,
  },
];

export async function* converse(
  message: string,
  lastResponseId?: string
): AsyncGenerator<string | FinalConverseResponse> {
  const stream = await openai.responses.create({
    model: "gpt-4.1",
    input: [
      { role: "user", content: "What's the weather like in Paris today?" },
    ],
    tools,
    stream: true,
    store: true,
  });

  for await (const event of stream) {
    if (event.type === "response.output_item.done") {
      console.log(event);
    }
    yield "test";
  }
}
