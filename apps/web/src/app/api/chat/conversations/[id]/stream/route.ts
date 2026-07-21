import { prisma } from "@uapp/database";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const conversation = await prisma.chat_conversations.findUnique({
    where: { id },
  });

  if (!conversation) {
    return new Response("Conversación no encontrada", { status: 404 });
  }

  if (!token || token !== conversation.paciente_token) {
    return new Response("No autorizado", { status: 401 });
  }

  let since = new Date().toISOString();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      const interval = setInterval(async () => {
        try {
          const messages = await prisma.chat_messages.findMany({
            where: {
              conversation_id: id,
              created_at: { gt: new Date(since) },
              sender: "staff",
              type: "message",
            },
            orderBy: { created_at: "asc" },
            select: {
              id: true,
              sender: true,
              content: true,
              type: true,
              sender_name: true,
              created_at: true,
            },
          });

          for (const msg of messages) {
            const data = JSON.stringify(msg);
            controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
          }

          if (messages.length > 0) {
            since = messages[messages.length - 1].created_at.toISOString();
          }

          const updated = await prisma.chat_conversations.findUnique({
            where: { id },
            select: { status: true },
          });

          if (updated && updated.status === "closed") {
            controller.enqueue(encoder.encode("event: closed\ndata: {}\n\n"));
            clearInterval(interval);
            controller.close();
            return;
          }

          controller.enqueue(encoder.encode(": keepalive\n\n"));
        } catch {
          clearInterval(interval);
          controller.close();
        }
      }, 3000);

      req.signal.addEventListener("abort", () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
