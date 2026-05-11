import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: number) {
  return NextResponse.json({ ok: true, data }, { status: init ?? 200 });
}

export function jsonError(message: string, status = 400, code?: string) {
  return NextResponse.json({ ok: false, error: message, code }, { status });
}
