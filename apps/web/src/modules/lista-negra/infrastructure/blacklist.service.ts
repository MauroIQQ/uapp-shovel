import { getBlacklisted, unblacklist } from "@/lib/blacklist-actions";

export async function fetchBlacklisted() {
  return getBlacklisted("76140290-0")
}

export async function removeFromBlacklist(rut: string) {
  return unblacklist("76140290-0", rut)
}
