import OpenAI from "openai";
// TODO: Probably want some kind of interal type for this incase the API or LLM changes
import {
  ResponseCreateParamsStreaming,
  Tool,
} from "openai/resources/responses/responses.mjs";

const client = new OpenAI({
  apiKey: process.env["OPENAI_KEY"],
  project: process.env["OPEN_AI_PROJECT_ID"],
});

const functions: Array<Tool> = [
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

const preferences = {
  country: null,
  continent: null,
  destination: null,
};

export type FinalConverseResponse = {
  type: string;
  responseId: string;
};

// TODO: Initiate the conversation
export async function* converse(
  message: string,
  lastResponseId?: string,
  forceConversationalResponse = false
): AsyncGenerator<string | FinalConverseResponse> {
  const chatOptions: ResponseCreateParamsStreaming = {
    model: "gpt-4.1",
    input: [
      {
        role: "system",
        content:
          "You are a helpful assistant. When the user mentions their favorite country, continent, and destination, call the store_user_preferences function.",
      },
      { role: "user", content: message },
    ],
    stream: true,
    store: true,
    tools: functions,
  };

  if (!lastResponseId) {
    chatOptions.instructions = process.env.OPENAI_PROMPT_INSTRUCTION;
  } else {
    chatOptions.previous_response_id = lastResponseId;
  }

  if (forceConversationalResponse) chatOptions.tool_choice = "none";

  const stream = await client.responses.create(chatOptions);

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      console.debug(`Received output text delta event ${event.delta}`);
      yield event.delta;
    } else if (event.type === "response.completed") {
      if (event.response.output[0].type === "function_call") {
        const argumentsRes = JSON.parse(event.response.output[0].arguments);

        if (argumentsRes.country) preferences.country = argumentsRes.country;
        if (argumentsRes.continent)
          preferences.continent = argumentsRes.continent;
        if (argumentsRes.destination)
          preferences.destination = argumentsRes.destination;

        console.log("CBPref: ", preferences);
        yield* converse(message, lastResponseId, true);
      } else {
        return { responseId: event.response.id, type: "response.completed" };
      }
    }
  }
}
