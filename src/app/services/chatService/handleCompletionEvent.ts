import { ResponseCompletedEvent } from "openai/resources/responses/responses.mjs";
import {
  Preferences,
  PreferencesResponse,
  CompletionResponse,
  StreamEvent,
} from "../../types";
import { converse } from "./chatService";

// Handles the "response.completed" event from OpenAI's streaming API
export async function* handleCompletionEvent(
  event: ResponseCompletedEvent,
  message: string,
  lastResponseId?: string
): AsyncGenerator<StreamEvent> {
  if (event.response.output[0]?.type === "function_call") {
    console.debug(
      "Received a function call response: ",
      event.response.output[0]
    );

    const args = JSON.parse(event.response.output[0].arguments);
    const preferences: Preferences = {
      country: args.country ?? null,
      continent: args.continent ?? null,
      destination: args.destination ?? null,
    };
    yield { type: "preferences", preferences } as PreferencesResponse;

    // We need to prompt again, forcing a conversational response to give back to the user
    yield* converse(message, lastResponseId, true);
  } else {
    yield {
      responseId: event.response.id,
      type: "response.completed",
    } as CompletionResponse;
  }
}
