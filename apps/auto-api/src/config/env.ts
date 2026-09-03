function isValidHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function requiredUrlEnv(name: string): string {
  const value = requiredEnv(name);
  if (!isValidHttpUrl(value)) throw new Error(`${name} must be a valid http(s) URL`);
  return value;
}
