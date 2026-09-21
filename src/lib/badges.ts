import type { BadgeType } from "./types";

export const BADGES: Record<BadgeType, { label: string; emoji: string; description: string }> = {
  first_visit: { label: "First Visit", emoji: "🌱", description: "Visited your first little library" },
  five_libraries: { label: "5 Libraries Explored", emoji: "🧭", description: "Visited five little libraries" },
  full_tour: { label: "Full Tour Complete", emoji: "🏆", description: "Visited every library in Campbell River" },
  photographer: { label: "Photographer", emoji: "📸", description: "Had 5+ photos approved" },
};

export const BADGE_ORDER: BadgeType[] = ["first_visit", "five_libraries", "full_tour", "photographer"];
