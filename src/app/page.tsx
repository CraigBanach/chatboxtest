"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import type {
  Preferences,
  PreferencesResponse,
  CompletionResponse,
} from "./types";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [lastResponseId, setLastResponseId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<Preferences>({
    country: null,
    continent: null,
    destination: null,
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    send(
      "My current location is 32-38 Antler, Tech Space, Leman Street, London, England, E1 8EW. Can you provide me with a nearby attraction or restaurant that may interest me?"
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePreferences = useCallback((next: Partial<Preferences>) => {
    setPreferences((prev) => ({
      country: next.country ?? prev.country,
      continent: next.continent ?? prev.continent,
      destination: next.destination ?? prev.destination,
    }));
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
      setMessages((prev) => [...prev, user]);
    }

    const res = await fetch("/api/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

      // Try to parse as JSON for structured responses
      try {
        const parsedValue = JSON.parse(decodedValue);

        if (parsedValue.type === "preferences") {
          const prefResp = parsedValue as PreferencesResponse;
          updatePreferences(prefResp.preferences);
          continue;
        }

        if (parsedValue.type === "response.completed") {
          const compResp = parsedValue as CompletionResponse;
          setLastResponseId(compResp.responseId);
          return;
        }
      } catch {
        // Not JSON, treat as text
      }

      ai += decodedValue;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = ai;
        return copy;
      });
    }
  }

  return (
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
      <div className="p-2 text-xs text-gray-500">
        <div>
          Country:{" "}
          {preferences.country ?? <span className="italic">unset</span>}
        </div>
        <div>
          Continent:{" "}
          {preferences.continent ?? <span className="italic">unset</span>}
        </div>
        <div>
          Destination:{" "}
          {preferences.destination ?? <span className="italic">unset</span>}
        </div>
      </div>
    </div>
  );
}
