"use client";

import * as React from "react"
import type { BlacklistedPatient } from "../domain/blacklist.entity"
import { fetchBlacklisted, removeFromBlacklist } from "../infrastructure/blacklist.service"

export function useBlacklist() {
  const [data, setData] = React.useState<BlacklistedPatient[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const pacientes = await fetchBlacklisted()
      setData(pacientes)
    } catch {
      setError("Error al cargar la lista negra")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const unblacklist = React.useCallback(async (rut: string) => {
    await removeFromBlacklist(rut)
    setData((prev) => prev.filter((p) => p.rut !== rut))
  }, [])

  return { data, loading, error, refresh, unblacklist }
}
