import { jwtVerify, SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "uapp-dev-secret-key-change-in-production");

export interface JwtPayload {
  rut: string;
  rut_empresa: string;
  perfil: number;
}

export async function createToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ ...payload }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("12h").sign(SECRET);
}

export async function verifyAuth(req: Request): Promise<JwtPayload> {
  const auth = req.headers.get("Authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { rut: "", rut_empresa: "76140290-0", perfil: -1 };
  }

  try {
    const { payload } = await jwtVerify(auth.slice(7), SECRET);
    return payload as unknown as JwtPayload;
  } catch {
    return { rut: "", rut_empresa: "76140290-0", perfil: -1 };
  }
}

export function requireRoot(auth: JwtPayload): { ok: false } | { ok: true; auth: JwtPayload } {
  if (auth.perfil !== 0) return { ok: false };
  return { ok: true, auth };
}
