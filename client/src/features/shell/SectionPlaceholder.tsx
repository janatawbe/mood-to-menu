import { Panel } from "../../components/Panel";
import { EmptyState } from "../../components/EmptyState";
import { navEntries, type SectionKey } from "./navConfig";

type PlaceholderSection = Exclude<SectionKey, "vibe-check" | "todays-menu" | "grocery-list">;

const descriptions: Record<PlaceholderSection, string> = {
  favorites: "Recipes you love will be saved here for quick access.",
  "recipe-history": "A timeline of everything you've cooked with Mood-to-Menu.",
  "chefs-tips": "Bite-sized cooking tips from your AI chef will appear here.",
};

interface SectionPlaceholderProps {
  section: PlaceholderSection;
}

export function SectionPlaceholder({ section }: SectionPlaceholderProps) {
  const entry = navEntries.find((item) => item.key === section);

  return (
    <Panel className="flex flex-col justify-center lg:h-full">
      <EmptyState
        icon={entry?.icon}
        title={`${entry?.label} is coming soon`}
        description={descriptions[section]}
      />
    </Panel>
  );
}
