import { AppLogo } from "../../components/AppLogo";
import { NavigationItem } from "../../components/NavigationItem";
import { CloseIcon } from "../../components/icons";
import { IconButton } from "../../components/IconButton";
import type { Mood } from "../../types/domain";
import { ChefMascot, type ChefStatus } from "./ChefMascot";
import { navEntries, type SectionKey } from "./navConfig";

interface SidebarProps {
  activeSection: SectionKey;
  onSelectSection: (section: SectionKey) => void;
  onCloseMobile?: () => void;
  /** Whether the chef has finished its intro and settled into the sidebar. */
  chefArrived: boolean;
  chefStatus: ChefStatus;
  mood: Mood | null;
}

export function Sidebar({
  activeSection,
  onSelectSection,
  onCloseMobile,
  chefArrived,
  chefStatus,
  mood,
}: SidebarProps) {
  return (
    <nav
      aria-label="Primary"
      className="relative flex h-full w-full flex-col gap-2 overflow-y-auto rounded-4xl border border-tan-200/60 bg-surface/95 p-2.5 shadow-soft"
    >
      <div className="relative flex flex-col items-center text-center">
        <AppLogo size="sm" />
        {onCloseMobile && (
          <IconButton
            icon={<CloseIcon />}
            label="Close navigation"
            onClick={onCloseMobile}
            className="absolute right-0 top-0 lg:hidden"
          />
        )}
      </div>

      <ul className="mt-4 flex flex-col gap-1.5">
        {navEntries.map((entry) => (
          <li key={entry.key}>
            <NavigationItem
              icon={entry.icon}
              label={entry.label}
              active={activeSection === entry.key}
              onClick={() => onSelectSection(entry.key)}
            />
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <ChefMascot arrived={chefArrived} status={chefStatus} mood={mood} />
      </div>
    </nav>
  );
}
