import { AuthNotConfiguredError } from "@/lib/auth/client-actions";

const messages: Record<string, string> = {
  "auth/invalid-credential":
    "That email and password don't match our records. Please double-check your details, or create an account if you're new here.",
  "auth/wrong-password":
    "That password isn't right for this account. Please try again, or use \"Forgot password?\" to reset it.",
  "auth/user-not-found":
    "We couldn't find an account with that email. Check for typos, or create a new account if you're new here.",
  "auth/invalid-email": "That doesn't look like a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait a few minutes and try again.",
  "auth/email-already-in-use": "An account with that email already exists — try logging in instead.",
  "auth/weak-password": "Please choose a stronger password (at least 6 characters).",
  "auth/network-request-failed": "Network error — check your connection and try again.",
};

/** Turns a raw Firebase/auth error into a clear, specific message for the user. */
export function friendlyAuthError(err: unknown): string {
  if (err instanceof AuthNotConfiguredError) return err.message;
  if (err instanceof Error) {
    const code = err.message.match(/\(([a-z0-9-]+\/[a-z0-9-]+)\)/)?.[1];
    if (code && messages[code]) return messages[code];
    return err.message.replace(/^Firebase:\s*/, "").replace(/\s*\([a-z0-9-]+\/[a-z0-9-]+\)\.?$/, "");
  }
  return "Something went wrong. Please try again.";
}
