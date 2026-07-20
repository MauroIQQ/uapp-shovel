import { cookies } from "next/headers";

import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "uapp-dev-secret-key-change-in-production");

export interface ServerAuthPayload {
  rut: string;
  rut_empresa: string;
  perfil: number;
}

export async function getServerAuth(): Promise<ServerAuthPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as ServerAuthPayload;
  } catch {
    return null;
  }
}
