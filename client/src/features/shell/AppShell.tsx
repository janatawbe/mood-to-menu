import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { AppLogo } from "../../components/AppLogo";
import { IconButton } from "../../components/IconButton";
import { MenuIcon } from "../../components/icons";
import { useVibeCheck } from "../../hooks/useVibeCheck";
import { ChefIntroOverlay } from "../chef-intro/ChefIntroOverlay";
import type { ChefStatus } from "./ChefMascot";
import { AmbientBackground } from "./decorative";
import { Sidebar } from "./Sidebar";
import { SectionPlaceholder } from "./SectionPlaceholder";
import { VibeCheckPreview } from "./VibeCheckPreview";
import type { SectionKey } from "./navConfig";

interface AppShellProps {
  /** True once the opening logo animation has finished (or been skipped) this mount. */
  chefIntroReady: boolean;
}

export function AppShell({ chefIntroReady }: AppShellProps) {
  const [activeSection, setActiveSection] = useState<SectionKey>("vibe-check");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  // Not persisted (by design, for now — see ChefIntroOverlay) so the intro replays on
  // every open/refresh. Swap in a sessionStorage-backed flag here if that should change.
  const [chefIntroDismissed, setChefIntroDismissed] = useState(false);
  const vibeCheck = useVibeCheck();

  const showChefIntro = chefIntroReady && !chefIntroDismissed;
  const chefStatus: ChefStatus =
    vibeCheck.phase === "loading" ? "cooking" : vibeCheck.selectedMood ? "attentive" : "welcoming";

  function handleSelectSection(section: SectionKey) {
    setActiveSection(section);
    setMobileNavOpen(false);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground />

      <div
        className="relative z-[1] mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-4 p-3 sm:p-4 lg:flex-row lg:gap-4 lg:p-3"
        inert={showChefIntro}
      >
        <header className="flex items-center justify-between rounded-3xl border border-tan-200/60 bg-surface/95 px-4 py-3 shadow-soft lg:hidden">
          <AppLogo size="sm" showTagline={false} />
          <IconButton
            icon={<MenuIcon />}
            label="Open navigation"
            onClick={() => setMobileNavOpen(true)}
          />
        </header>

        <aside className="hidden shrink-0 lg:block lg:w-72 xl:w-80">
          <div className="sticky top-3 h-full">
            <Sidebar
              activeSection={activeSection}
              onSelectSection={handleSelectSection}
              chefArrived={chefIntroDismissed}
              chefStatus={chefStatus}
            />
          </div>
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation overlay"
              className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="absolute inset-y-3 left-3 w-[85%] max-w-xs">
              <Sidebar
                activeSection={activeSection}
                onSelectSection={handleSelectSection}
                onCloseMobile={() => setMobileNavOpen(false)}
                chefArrived={chefIntroDismissed}
                chefStatus={chefStatus}
              />
            </div>
          </div>
        )}

        <main id="main-content" className="min-w-0 flex-1">
          {activeSection === "vibe-check" ? (
            <VibeCheckPreview vibeCheck={vibeCheck} />
          ) : (
            <SectionPlaceholder section={activeSection} />
          )}
        </main>
      </div>

      <AnimatePresence>
        {showChefIntro && <ChefIntroOverlay onDismiss={() => setChefIntroDismissed(true)} />}
      </AnimatePresence>
    </div>
  );
}
