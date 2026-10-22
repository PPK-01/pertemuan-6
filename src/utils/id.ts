let counter = 0;

export function createId(prefix: string): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`;
}

export function createSessionCode(): string {
  return Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
}
