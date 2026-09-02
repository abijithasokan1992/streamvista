export function cleanAuthErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error || '');
  const normalized = message.toLowerCase();

  if (!message || normalized.includes('failed to fetch') || normalized.includes('networkerror')) {
    return 'Sign-in service is not reachable yet. Please wait until streamvista.in is connected to the production app, then try again.';
  }

  if (normalized.includes('invalid login credentials') || normalized.includes('email or password')) {
    return 'Email or password is incorrect. You can create an account or reset your password.';
  }

  return message;
}
