import OpenAI from "openai";
// TODO: Probably want some kind of interal type for this incase the API or LLM changes
import {
  ResponseCreateParamsStreaming,
  Tool,
} from "openai/resources/responses/responses.mjs";

const tools: Array<Tool> = [
  {
    type: "function",
    name: "store_user_data",
    description:
      "Get or update the user's preferences for favourite Country, Continent & Destination.",
    parameters: {
      type: "object",
      properties: {
        country: { type: "string", description: "A country in the world" },
        continent: { type: "string", description: "A continent in the world" },
        destination: {
          type: "string",
          description: "A destination in the world",
        },
      },
      required: ["country", "continent", "destination"],
      additionalProperties: false,
    },
    strict: true,
  },
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

const client = new OpenAI({
  apiKey: process.env["OPENAI_KEY"],
  project: process.env["OPEN_AI_PROJECT_ID"],
});

export type FinalConverseResponse = {
  type: string;
  responseId: string;
};

// TODO: Initiate the conversation
export async function* converse(
  message: string,
  lastResponseId?: string
): AsyncGenerator<string | FinalConverseResponse> {
  const chatOptions: ResponseCreateParamsStreaming = {
    model: "gpt-4.1",
    input: [{ role: "user", content: message }],
    store: true,
    stream: true,
    tools,
  };

  if (!lastResponseId) {
    chatOptions.instructions = process.env.OPENAI_PROMPT_INSTRUCTION;
  } else {
    chatOptions.previous_response_id = lastResponseId;
  }

  // TODO: Stream this
  const stream = await client.responses.create(chatOptions);

  for await (const event of stream) {
    if (event.type === "response.output_item.done") {
      console.log(event);
    }
    // if (event.type === "response.output_text.delta") {
    //   // console.debug(`Received output text delta event ${event.delta}`);
    //   yield event.delta;
    // } else if (event.type === "response.output_item.added") {
    //   console.debug("CBOutputItemAdded: ", event);
    // } else if (event.type === "response.output_item.done") {
    //   console.debug("CBFunctionCall: ", event);
    // } else if (event.type === "response.completed") {
    //   console.info(
    //     `Finished streaming response for stream ${event.response.id}`,
    //     event.response
    //   );
    //   return { responseId: event.response.id, type: "response.completed" };
    // }
    yield "test";
  }
}
