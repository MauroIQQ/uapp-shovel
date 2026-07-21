import { prisma } from "@uapp/database";
import { getServerAuth } from "@/lib/get-server-auth";

export async function GET(req: Request) {
  const auth = await getServerAuth();
  if (!auth?.rut_empresa) {
    return new Response("No autorizado", { status: 401 });
  }

  const { rut_empresa } = auth;
  const encoder = new TextEncoder();

  let lastCheck = new Date().toISOString();

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(encoder.encode("event: connected\ndata: {}\n\n"));

      const interval = setInterval(async () => {
        try {
          const conversations = await prisma.chat_conversations.findMany({
            where: {
              rut_empresa,
              updated_at: { gt: new Date(lastCheck) },
            },
            include: {
              messages: {
                orderBy: { created_at: "desc" },
                take: 1,
              },
            },
          });

          for (const conv of conversations) {
            const data = JSON.stringify({
              id: conv.id,
              paciente_nombre: conv.paciente_nombre,
              status: conv.status,
              unread_messages: conv.unread_messages,
              last_message: conv.messages[0]?.content || null,
              last_message_at: conv.messages[0]?.created_at || conv.created_at,
            });
            controller.enqueue(encoder.encode(`event: conversation\ndata: ${data}\n\n`));
          }

          if (conversations.length > 0) {
            lastCheck = new Date().toISOString();
          }

          const messages = await prisma.chat_messages.findMany({
            where: {
              created_at: { gt: new Date(lastCheck) },
              conversation: { rut_empresa },
              sender: "patient",
            },
            orderBy: { created_at: "asc" },
            select: {
              id: true,
              conversation_id: true,
              sender: true,
              content: true,
              sender_name: true,
              created_at: true,
            },
          });

          for (const msg of messages) {
            const data = JSON.stringify(msg);
            controller.enqueue(encoder.encode(`event: message\ndata: ${data}\n\n`));
          }

          if (messages.length > 0) {
            lastCheck = new Date().toISOString();
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
