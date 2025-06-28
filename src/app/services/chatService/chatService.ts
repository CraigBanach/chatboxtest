import { ResponseCreateParamsStreaming } from "./openaiClient";
import { functions, openaiClient } from "./openaiClient";
import { StreamEvent } from "../../types";
import { handleCompletionEvent } from "./handleCompletionEvent";

export async function* converse(
  message: string,
  lastResponseId?: string,
  forceConversationalResponse = false
): AsyncGenerator<StreamEvent> {
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
    ...(lastResponseId
      ? { previous_response_id: lastResponseId }
      : { instructions: process.env.OPENAI_PROMPT_INSTRUCTION }),
    ...(forceConversationalResponse ? { tool_choice: "none" } : {}),
  };

  const stream = await openaiClient.responses.create(chatOptions);

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      console.debug("Received streamed output text: ", event.delta);

      yield event.delta;
    } else if (event.type === "response.completed") {
      console.info("The chat response was completed: ", event.response.id);

      yield* handleCompletionEvent(event, message, lastResponseId);
    }
  }
}
