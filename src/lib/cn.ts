import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Stable pastel pair for an avatar, chosen from the name. */
const AVATAR_TONES = [
  "bg-[#dff5c3] text-[#25521a]",
  "bg-[#d4efe2] text-[#0f5a3a]",
  "bg-[#dbe6f6] text-[#1d3a63]",
  "bg-[#ffe6cf] text-[#7a3d0e]",
  "bg-[#f3dcf2] text-[#6b2466]",
  "bg-[#fff3b8] text-[#5e4b00]",
];
export function avatarTone(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}
