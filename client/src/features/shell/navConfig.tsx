import type { ReactNode } from "react";
import {
  CalendarIcon,
  CartIcon,
  ChefHatIcon,
  HeartIcon,
  HistoryIcon,
  HomeIcon,
} from "../../components/icons";

export type SectionKey =
  | "vibe-check"
  | "todays-menu"
  | "grocery-list"
  | "favorites"
  | "recipe-history"
  | "chefs-tips";

export interface NavEntry {
  key: SectionKey;
  label: string;
  icon: ReactNode;
}

const iconSize = { width: 23, height: 23 };

export const navEntries: NavEntry[] = [
  { key: "vibe-check", label: "Vibe Check", icon: <HomeIcon {...iconSize} /> },
  { key: "todays-menu", label: "Today's Menu", icon: <CalendarIcon {...iconSize} /> },
  { key: "grocery-list", label: "Grocery List", icon: <CartIcon {...iconSize} /> },
  { key: "favorites", label: "Favorites", icon: <HeartIcon {...iconSize} /> },
  { key: "recipe-history", label: "Recipe History", icon: <HistoryIcon {...iconSize} /> },
  { key: "chefs-tips", label: "Chef's Tips", icon: <ChefHatIcon {...iconSize} /> },
];
