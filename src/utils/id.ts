export function generateId(): string {
  return crypto.randomUUID();
}

export function generateTimestamp(): number {
  return Date.now();
}
