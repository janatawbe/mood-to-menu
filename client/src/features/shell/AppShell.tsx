import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { AppLogo } from "../../components/AppLogo";
import { IconButton } from "../../components/IconButton";
import { MenuIcon } from "../../components/icons";
import { useGroceryList } from "../../hooks/useGroceryList";
import { useVibeCheck } from "../../hooks/useVibeCheck";
import { GroceryListScreen } from "../grocery-list/GroceryListScreen";
import { TodaysMenuScreen } from "../todays-menu/TodaysMenuScreen";
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

  function handleSelectSection(section: SectionKey) {
    setActiveSection(section);
    setMobileNavOpen(false);
  }

  // Fires once, right after a *successful initial* generation (Vibe Check submit/retry,
  // not a Today's Menu regeneration) — the recipe reveal's real destination is Today's
  // Menu, so a successful generation should take the user straight there.
  const handleGenerated = useCallback(() => handleSelectSection("todays-menu"), []);
  const vibeCheck = useVibeCheck(handleGenerated);
  // One shared instance (Step 23) — Today's Menu and the Grocery List screen both read
  // and write this same state, so an add/remove/check on one is reflected on the other
  // immediately, and it's never cleared by regenerating or navigating away.
  const groceryList = useGroceryList();

  const showChefIntro = chefIntroReady && !chefIntroDismissed;
  const chefStatus: ChefStatus =
    vibeCheck.phase === "loading" || vibeCheck.isRegenerating
      ? "cooking"
      : activeSection === "todays-menu" && vibeCheck.recipe
        ? "served"
        : vibeCheck.selectedMood
          ? "attentive"
          : "welcoming";
  // On Today's Menu, the chef's glow/reaction should reflect the recipe that was
  // actually made (always a real mood), not the Vibe Check picker's own selection,
  // which may since be null or changed.
  const chefMood =
    activeSection === "todays-menu" && vibeCheck.recipe ? vibeCheck.recipe.detectedMood : vibeCheck.selectedMood;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AmbientBackground mood={vibeCheck.selectedMood} />

      <div
        className="relative z-[1] mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-4 p-3 sm:p-4 lg:h-screen lg:flex-row lg:gap-4 lg:p-3"
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
              mood={chefMood}
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
                mood={chefMood}
              />
            </div>
          </div>
        )}

        <main id="main-content" className="min-w-0 flex-1">
          {activeSection === "vibe-check" ? (
            <VibeCheckPreview vibeCheck={vibeCheck} />
          ) : activeSection === "todays-menu" ? (
            <TodaysMenuScreen
              vibeCheck={vibeCheck}
              groceryList={groceryList}
              onGoToVibeCheck={() => handleSelectSection("vibe-check")}
            />
          ) : activeSection === "grocery-list" ? (
            <GroceryListScreen
              groceryList={groceryList}
              hasRecipe={vibeCheck.recipe !== null}
              onGoToTodaysMenu={() => handleSelectSection("todays-menu")}
              onGoToVibeCheck={() => handleSelectSection("vibe-check")}
            />
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
