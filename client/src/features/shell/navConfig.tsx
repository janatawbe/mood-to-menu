import type { ReactNode } from "react";
import {
  CalendarIcon,
  CartIcon,
  ChefHatIcon,
  HeartIcon,
  HistoryIcon,
  HomeIcon,
  StarIcon,
} from "../../components/icons";

export type SectionKey =
  | "vibe-check"
  | "todays-menu"
  | "grocery-list"
  | "taste-memory"
  | "favorites"
  | "recipe-history"
  | "chefs-tips";

export interface NavEntry {
  key: SectionKey;
  label: string;
  icon: ReactNode;
}

const iconSize = { width: 23, height: 23 };

// "Taste Memory" is a new nav entry (Milestone 7) rather than repurposing "Chef's Tips"
// — nothing in the roadmap concretely claims Chef's Tips for a specific later milestone,
// but repurposing it would still gamble on that, whereas adding one more entry using the
// exact same NavigationItem pattern is a small, safe, fully reversible addition.
export const navEntries: NavEntry[] = [
  { key: "vibe-check", label: "Vibe Check", icon: <HomeIcon {...iconSize} /> },
  { key: "todays-menu", label: "Today's Menu", icon: <CalendarIcon {...iconSize} /> },
  { key: "grocery-list", label: "Grocery List", icon: <CartIcon {...iconSize} /> },
  { key: "taste-memory", label: "Taste Memory", icon: <StarIcon {...iconSize} /> },
  { key: "favorites", label: "Favorites", icon: <HeartIcon {...iconSize} /> },
  { key: "recipe-history", label: "Recipe History", icon: <HistoryIcon {...iconSize} /> },
  { key: "chefs-tips", label: "Chef's Tips", icon: <ChefHatIcon {...iconSize} /> },
];
