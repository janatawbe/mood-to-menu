import type { ReactNode } from "react";
import { CalendarIcon, CartIcon, FoodBowlIcon, HeartIcon, HistoryIcon, HomeIcon } from "../../components/icons";

export type SectionKey =
  | "vibe-check"
  | "todays-menu"
  | "grocery-list"
  | "taste-memory"
  | "favorites"
  | "recipe-history";

export interface NavEntry {
  key: SectionKey;
  label: string;
  icon: ReactNode;
}

const iconSize = { width: 23, height: 23 };

// Chef's Tips (a standalone sidebar placeholder section) was removed rather than kept
// as an unused stub — it never grew real functionality, and the app's actual chef
// personality/tips already live inline per-recipe (see ChefTipCard.tsx), not as a
// separate nav destination.
export const navEntries: NavEntry[] = [
  { key: "vibe-check", label: "Vibe Check", icon: <HomeIcon {...iconSize} /> },
  { key: "todays-menu", label: "Today's Menu", icon: <CalendarIcon {...iconSize} /> },
  { key: "grocery-list", label: "Grocery List", icon: <CartIcon {...iconSize} /> },
  { key: "taste-memory", label: "Taste Memory", icon: <FoodBowlIcon {...iconSize} /> },
  { key: "favorites", label: "Favorites", icon: <HeartIcon {...iconSize} /> },
  { key: "recipe-history", label: "Recipe History", icon: <HistoryIcon {...iconSize} /> },
];
