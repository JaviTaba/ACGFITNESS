"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { z } from "zod";

const logSchema = z.object({
  id: z.string(),
  type: z.enum(["weight", "workout", "calories", "friends", "streak", "note"]),
  createdAt: z.date(),
  payload: z.record(z.any())
});

export type LogEntry = z.infer<typeof logSchema>;

type CreateLogInput = Omit<LogEntry, "id" | "createdAt"> & { payload: LogEntry["payload"] };

type LogsContextValue = {
  logs: LogEntry[];
  createLog: (input: CreateLogInput) => void;
};

const LogsContext = createContext<LogsContextValue | undefined>(undefined);

export function LogsProvider({ children }: { children: React.ReactNode }) {
  const [logs, setLogs] = useState<LogEntry[]>(() => []);

  const createLog = useCallback((input: CreateLogInput) => {
    setLogs((prev) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        type: input.type,
        payload: input.payload
      },
      ...prev
    ]);
  }, []);

  const value = useMemo(() => ({ logs, createLog }), [logs, createLog]);

  return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
}

export function useLogs() {
  const ctx = useContext(LogsContext);
  if (!ctx) {
    throw new Error("useLogs must be used within a LogsProvider");
  }
  return ctx;
}
