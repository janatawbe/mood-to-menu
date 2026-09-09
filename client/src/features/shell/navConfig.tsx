// Sidebar navigation entries: section keys, labels, and icons.
import type { ReactNode } from "react";
import { CalendarIcon, CartIcon, FoodBowlIcon, GlobeIcon, HeartIcon, HistoryIcon, HomeIcon } from "../../components/icons";

export type SectionKey =
  | "vibe-check"
  | "todays-menu"
  | "grocery-list"
  | "taste-memory"
  | "favorites"
  | "recipe-history"
  | "recently-generated";

export interface NavEntry {
  key: SectionKey;
  label: string;
  icon: ReactNode;
}

const iconSize = { width: 23, height: 23 };

// Chef tips live inline per-recipe (see ChefTipCard.tsx), not as a separate nav section.
export const navEntries: NavEntry[] = [
  { key: "vibe-check", label: "Vibe Check", icon: <HomeIcon {...iconSize} /> },
  { key: "todays-menu", label: "Today's Menu", icon: <CalendarIcon {...iconSize} /> },
  { key: "grocery-list", label: "Grocery List", icon: <CartIcon {...iconSize} /> },
  { key: "taste-memory", label: "Taste Memory", icon: <FoodBowlIcon {...iconSize} /> },
  { key: "favorites", label: "Favorites", icon: <HeartIcon {...iconSize} /> },
  { key: "recipe-history", label: "Recipe History", icon: <HistoryIcon {...iconSize} /> },
  { key: "recently-generated", label: "Recently Generated", icon: <GlobeIcon {...iconSize} /> },
];
