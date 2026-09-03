import { Panel } from "../../components/Panel";
import { EmptyState } from "../../components/EmptyState";
import { navEntries, type SectionKey } from "./navConfig";

const descriptions: Record<Exclude<SectionKey, "vibe-check">, string> = {
  "todays-menu": "Your daily recipe pick will show up here once meal generation is built.",
  "grocery-list": "A shoppable ingredient list will live here in a later milestone.",
  favorites: "Recipes you love will be saved here for quick access.",
  "recipe-history": "A timeline of everything you've cooked with Mood-to-Menu.",
  "chefs-tips": "Bite-sized cooking tips from your AI chef will appear here.",
};

interface SectionPlaceholderProps {
  section: Exclude<SectionKey, "vibe-check">;
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
