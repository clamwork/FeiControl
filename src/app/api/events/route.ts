import { NextRequest, NextResponse } from "next/server";
import { logActivity } from "@/lib/activities-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Store connected clients
let clients: Set<ReadableStreamController<Uint8Array>> = new Set();

export async function GET() {
  let controller: ReadableStreamController<Uint8Array>;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      clients.add(c);

      // Send initial connected event
      const data = JSON.stringify({ type: "connected", timestamp: new Date().toISOString() });
      c.enqueue(new TextEncoder().encode(`event: connected\ndata: ${data}\n\n`));

      // Keep alive
      const keepAlive = setInterval(() => {
        try {
          c.enqueue(new TextEncoder().encode(": keepalive\n\n"));
        } catch {
          clearInterval(keepAlive);
        }
      }, 15000);
    },
    cancel() {
      clients.delete(controller!);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, status, agent, metadata } = body;

    if (!type || !description) {
      return NextResponse.json({ error: "Missing required fields: type, description" }, { status: 400 });
    }

    // Log to database
    logActivity(type, description, status || "success", {
      agent: agent || null,
      metadata: metadata || null,
    });

    // Broadcast to all connected SSE clients
    const eventData = JSON.stringify({
      type,
      description,
      status: status || "success",
      agent: agent || null,
      timestamp: new Date().toISOString(),
      metadata: metadata || null,
    });

    const encoded = new TextEncoder().encode(`event: ${type}\ndata: ${eventData}\n\n`);

    const deadControllers: ReadableStreamController<Uint8Array>[] = [];
    for (const c of clients) {
      try {
        c.enqueue(encoded);
      } catch {
        deadControllers.push(c);
      }
    }
    for (const dc of deadControllers) {
      clients.delete(dc);
    }

    return NextResponse.json({ success: true, broadcastTo: clients.size });
  } catch (error) {
    console.error("Failed to broadcast event:", error);
    return NextResponse.json({ error: "Failed to broadcast event" }, { status: 500 });
  }
}
