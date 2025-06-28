"use client";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [lastResponseId, setLastResponseId] = useState<string | null>();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    // In a production application, you'd take the x-forwarded-for header,
    // geolocate the person based upon that & then use that address to do the
    // initial chat
    send(
      "My current location is 32-38 Antler, Tech Space, Leman Street, London, England, E1 8EW. Can you provide me with a nearby attraction or restaurant that may interest me?"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send(messageToSend?: string) {
    let user: string;

    if (!messageToSend) {
      if (!input.trim()) return;
      user = input.trim();
      setMessages((prev) => [...prev, user]);
      setInput("");
    } else {
      user = messageToSend;
    }

    const res = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // It's possible that we send multiple messages without seeing a response
      // for network reasons or otherwise. In a production implementation, I'd
      // probably want to store not only the lastResponseId, but also
      // some sort of lastMessage property as well, that we could pass down
      // eventually to the AI
      body: JSON.stringify({ message: user, lastResponseId }),
    });

    if (!res.body) return;
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let ai = "";
    setMessages((prev) => [...prev, ""]);
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      const decodedValue = decoder.decode(value);
      console.log("CBTest: ", decodedValue);

      // This whole try block is bleeding server implementation into the client.
      // With more time, I would figure out a better way to do this that doesn't have
      // this problem
      try {
        const parsedValue = JSON.parse(decodedValue);

        if (parsedValue["type"] === "response.completed") {
          setLastResponseId(parsedValue["responseId"]);
          return;
        }
      } catch (e) {
        console.debug("Failed to JSON parse value ", value, e);
      }

      ai += decoder.decode(value);
      // TODO: Scrolling while message is being added sucks
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = ai;
        return copy;
      });
    }
  }

  return (
    <>
      <div className="fixed bottom-6 right-6 w-80 h-96 flex flex-col rounded-lg shadow-lg border bg-white dark:bg-gray-900">
        <div className="flex-1 p-3 overflow-y-auto space-y-2 text-sm">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[75%] break-words ${
                i % 2 === 0
                  ? "self-end bg-blue-600 text-white"
                  : "self-start bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-50"
              } rounded-md px-3 py-1`}
            >
              {m}
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="p-3 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 rounded-md border px-2 py-1 text-sm bg-transparent outline-none"
            placeholder="Type a message"
          />
          <button
            onClick={() => send()}
            className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </>
  );
}
