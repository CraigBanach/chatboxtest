import { converse } from "../../services/chatService";


export const runtime = "edge";

export async function POST(req: Request) {
  const { message, lastResponseId } = await req.json();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      console.log(`Received message: ${message}`);
      for await (const chunk of converse(message, lastResponseId))
        controller.enqueue(encoder.encode(chunk.toString()));

      controller.close();
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
