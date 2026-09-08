import { useCallback, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AppLogo } from "../../components/AppLogo";
import { IconButton } from "../../components/IconButton";
import { MenuIcon } from "../../components/icons";
import { useFavorites } from "../../hooks/useFavorites";
import { useGroceryList } from "../../hooks/useGroceryList";
import { useRecipeHistory } from "../../hooks/useRecipeHistory";
import { useTasteMemory } from "../../hooks/useTasteMemory";
import { useVibeCheck } from "../../hooks/useVibeCheck";
import type { Recipe } from "../../types/domain";
import { FavoritesScreen } from "../favorites/FavoritesScreen";
import { GroceryListScreen } from "../grocery-list/GroceryListScreen";
import { RecipeHistoryScreen } from "../recipe-history/RecipeHistoryScreen";
import { TasteMemoryScreen } from "../taste-memory/TasteMemoryScreen";
import { TodaysMenuScreen } from "../todays-menu/TodaysMenuScreen";
import { ChefIntroOverlay } from "../chef-intro/ChefIntroOverlay";
import type { ChefStatus } from "./ChefMascot";
import { AmbientBackground } from "./decorative";
import { Sidebar } from "./Sidebar";
import { VibeCheckPreview } from "./VibeCheckPreview";
import type { SectionKey } from "./navConfig";

interface AppShellProps {
  /** True once the opening logo animation has finished (or been skipped) this mount. */
  chefIntroReady: boolean;
}

export function AppShell({ chefIntroReady }: AppShellProps) {
  const prefersReducedMotion = useReducedMotion();
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
  // One shared instance (Milestone 7) — read by every generation/regeneration request
  // below, and edited on its own screen; nothing else holds a separate copy.
  const tasteMemory = useTasteMemory();
  // One shared instance (Milestone 8) — Recipe History records itself imperatively via
  // `recordGeneration`, fired once per successful response inside useVibeCheck (never
  // from an effect watching `recipe`, which would risk a StrictMode double-record).
  const recipeHistory = useRecipeHistory();
  const vibeCheck = useVibeCheck(
    handleGenerated,
    tasteMemory.preferences,
    recipeHistory.recordGeneration,
  );
  // One shared instance (Step 23) — Today's Menu and the Grocery List screen both read
  // and write this same state, so an add/remove/check on one is reflected on the other
  // immediately, and it's never cleared by regenerating or navigating away.
  const groceryList = useGroceryList();
  // One shared instance (Milestone 8) — Today's Menu, Favorites, and Recipe History all
  // read/write the same favorited state via recipe id, so it's consistent everywhere.
  const favorites = useFavorites();

  // Opening a saved Favorite/History recipe reuses the existing Today's Menu rendering
  // entirely (Step 20) — no separate recipe-detail screen, and no Gemini call.
  const handleOpenRecipe = useCallback(
    (recipe: Recipe) => {
      vibeCheck.openRecipe(recipe);
      handleSelectSection("todays-menu");
    },
    [vibeCheck],
  );

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
    activeSection === "todays-menu" && vibeCheck.recipe
      ? vibeCheck.recipe.detectedMood
      : vibeCheck.selectedMood;

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
          {/* Milestone 9: a quick, restrained fade+shift when switching sections. This is
              a fade-IN only (no `exit`, no AnimatePresence) — the incoming screen mounts
              immediately/synchronously on click, same as before this milestone, and just
              animates its own opacity/position in; nothing ever delays becoming visible
              or interactive while the animation plays. Skipped under reduced motion. */}
          <motion.div
            key={activeSection}
            className="h-full"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.01 : 0.18, ease: "easeOut" }}
          >
            {activeSection === "vibe-check" ? (
              <VibeCheckPreview vibeCheck={vibeCheck} />
            ) : activeSection === "todays-menu" ? (
              <TodaysMenuScreen
                vibeCheck={vibeCheck}
                groceryList={groceryList}
                favorites={favorites}
                onGoToVibeCheck={() => handleSelectSection("vibe-check")}
              />
            ) : activeSection === "grocery-list" ? (
              <GroceryListScreen
                groceryList={groceryList}
                hasRecipe={vibeCheck.recipe !== null}
                onGoToTodaysMenu={() => handleSelectSection("todays-menu")}
                onGoToVibeCheck={() => handleSelectSection("vibe-check")}
              />
            ) : activeSection === "taste-memory" ? (
              <TasteMemoryScreen tasteMemory={tasteMemory} />
            ) : activeSection === "favorites" ? (
              <FavoritesScreen
                favorites={favorites}
                hasRecipe={vibeCheck.recipe !== null}
                onOpenRecipe={handleOpenRecipe}
                onGoToTodaysMenu={() => handleSelectSection("todays-menu")}
                onGoToVibeCheck={() => handleSelectSection("vibe-check")}
              />
            ) : (
              <RecipeHistoryScreen
                history={recipeHistory}
                onOpenRecipe={handleOpenRecipe}
                onGoToVibeCheck={() => handleSelectSection("vibe-check")}
              />
            )}
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {showChefIntro && <ChefIntroOverlay onDismiss={() => setChefIntroDismissed(true)} />}
      </AnimatePresence>
    </div>
  );
}
