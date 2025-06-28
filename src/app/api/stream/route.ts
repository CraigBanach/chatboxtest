import { converse } from "../../services/chatService/chatService";

export const runtime = "edge";

export async function POST(req: Request) {
  const { message, lastResponseId } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of converse(message, lastResponseId)) {
        if (typeof chunk === "string") {
          controller.enqueue(encoder.encode(chunk));
        } else {
          controller.enqueue(encoder.encode(JSON.stringify(chunk)));
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
