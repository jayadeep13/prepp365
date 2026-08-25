"use client";

import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { firebaseAuth, googleProvider, firebaseConfigured } from "@/lib/firebase/client";

export class AuthNotConfiguredError extends Error {
  constructor() {
    super(
      "Firebase isn't configured yet. Add your NEXT_PUBLIC_FIREBASE_* keys to .env.local — see .env.example."
    );
    this.name = "AuthNotConfiguredError";
  }
}

function requireAuth() {
  if (!firebaseConfigured || !firebaseAuth) throw new AuthNotConfiguredError();
  return firebaseAuth;
}

/** Exchanges a Firebase ID token for our own httpOnly session cookie. */
async function establishSession(
  idToken: string,
  extra?: { referralCode?: string; phone?: string; address?: string }
) {
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, ...extra }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not sign you in. Please try again.");
  return data.user;
}

export async function signInWithGoogle() {
  const auth = requireAuth();
  const cred = await signInWithPopup(auth, googleProvider);
  const idToken = await cred.user.getIdToken();
  return establishSession(idToken);
}

export async function signInWithPassword(email: string, password: string) {
  const auth = requireAuth();
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const idToken = await cred.user.getIdToken();
  return establishSession(idToken);
}

export async function registerWithPassword(
  name: string,
  email: string,
  password: string,
  phone?: string,
  address?: string,
  referralCode?: string
) {
  const auth = requireAuth();
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  const idToken = await cred.user.getIdToken();
  return establishSession(idToken, { referralCode, phone, address });
}

/** Sets up (or reuses) an invisible reCAPTCHA bound to the given DOM element id. */
export function getRecaptchaVerifier(containerId: string) {
  const auth = requireAuth();
  const w = window as unknown as { _prepp365Recaptcha?: RecaptchaVerifier };
  if (!w._prepp365Recaptcha) {
    w._prepp365Recaptcha = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  return w._prepp365Recaptcha;
}

/** Starts phone OTP sign-in. `phoneE164` must look like "+91XXXXXXXXXX". */
export async function sendOtp(phoneE164: string, containerId: string): Promise<ConfirmationResult> {
  const auth = requireAuth();
  const verifier = getRecaptchaVerifier(containerId);
  return signInWithPhoneNumber(auth, phoneE164, verifier);
}

export async function confirmOtp(confirmation: ConfirmationResult, code: string) {
  const cred = await confirmation.confirm(code);
  const idToken = await cred.user.getIdToken();
  return establishSession(idToken);
}

export async function logout() {
  if (firebaseAuth) await signOut(firebaseAuth).catch(() => {});
  await fetch("/api/auth/logout", { method: "POST" });
}
