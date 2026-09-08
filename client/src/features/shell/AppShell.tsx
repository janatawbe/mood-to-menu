// Top-level layout: sidebar, active section routing, and the shared feature hooks.
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
  // Intentionally not persisted, so the intro replays on every open/refresh.
  const [chefIntroDismissed, setChefIntroDismissed] = useState(false);

  function handleSelectSection(section: SectionKey) {
    setActiveSection(section);
    setMobileNavOpen(false);
  }

  // Fires only after a successful *initial* generation, not a regeneration — takes the
  // user straight to Today's Menu.
  const handleGenerated = useCallback(() => handleSelectSection("todays-menu"), []);
  // Shared instances: each hook is read/written from multiple screens, so state stays
  // consistent everywhere (e.g. an add/remove on Grocery List reflects on Today's Menu).
  const tasteMemory = useTasteMemory();
  // Recipe History records itself imperatively via `recordGeneration`, called once per
  // successful response inside useVibeCheck rather than from an effect, so a React
  // StrictMode double-render can't record a duplicate entry.
  const recipeHistory = useRecipeHistory();
  const vibeCheck = useVibeCheck(
    handleGenerated,
    tasteMemory.preferences,
    recipeHistory.recordGeneration,
  );
  const groceryList = useGroceryList();
  const favorites = useFavorites();

  // Opening a saved Favorite/History recipe reuses the existing Today's Menu rendering —
  // no separate recipe-detail screen, and no Gemini call.
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
          {/* Fade-in only (no `exit`/AnimatePresence) — the incoming screen still mounts
              synchronously on click and just animates its own opacity/position in, so
              nothing delays becoming visible or interactive. Skipped under reduced motion. */}
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
