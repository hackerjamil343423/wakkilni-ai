import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // Verify user is authenticated
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be logged in to use the chat" },
      { status: 401 }
    );
  }

  const { messages } = await req.json();

  const result = streamText({
    model: openai.responses("gpt-4o"),
    messages,
    tools: {
      web_search_preview: openai.tools.webSearchPreview(),
    },
  });

  return result.toDataStreamResponse();
}
