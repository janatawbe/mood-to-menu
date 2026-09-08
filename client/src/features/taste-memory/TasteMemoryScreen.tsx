import { Panel } from "../../components/Panel";
import { SectionHeader } from "../../components/SectionHeader";
import type { UseTasteMemoryReturn } from "../../hooks/useTasteMemory";
import { TastePreferenceSection } from "./TastePreferenceSection";

interface TasteMemoryScreenProps {
  tasteMemory: UseTasteMemoryReturn;
}

const COMFORT_FOOD_SUGGESTIONS = ["Pasta", "Soup", "Pizza", "Rice bowls", "Grilled cheese"];
const LIKED_INGREDIENT_SUGGESTIONS = ["Chicken", "Avocado", "Garlic", "Cheese"];
const DISLIKED_INGREDIENT_SUGGESTIONS = ["Mushrooms", "Olives", "Cilantro"];
const DIETARY_SUGGESTIONS = ["Vegetarian", "Vegan", "Pescatarian", "Halal", "Gluten-conscious", "Dairy-free"];

/**
 * Where the user teaches their chef what they love (Milestone 7) — a real screen, not a
 * settings form: chip-based entries throughout, matching the Vibe Check's own quick-pick
 * pattern. Persists immediately on every change (see useTasteMemory), so this screen
 * doesn't need a Save button — the small caption below the heading is what makes that
 * obvious instead (Step 32).
 */
export function TasteMemoryScreen({ tasteMemory }: TasteMemoryScreenProps) {
  const { preferences, isEmpty, addPreference, removePreference } = tasteMemory;

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <SectionHeader title="Taste Memory" subtitle="Teach your chef what you love." />

      {/* Horizontal padding + matching negative margin: this div's overflow-y-auto
          forces its overflow-x to an effective auto/clipped value too (per the CSS
          overflow spec, a non-visible Y axis forces the X axis out of "visible"), which
          was clipping the LEFT edge of the focus outline on the inputs below (they sit
          flush against this box's own left edge, with no padding to absorb the ~4px the
          outline+outline-offset extends past the input's border). The padding gives the
          outline room before the actual clip boundary; the negative margin cancels the
          padding's own inward shift so the content still lines up with the heading above. */}
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto px-1.5 -mx-1.5">
        <div className="flex flex-col gap-5 pb-2">
          {isEmpty && (
            <div className="rounded-3xl border border-dashed border-tan-200 bg-cream-soft px-4 py-4 text-center">
              <p className="font-display text-sm font-bold text-ink">Your chef doesn&apos;t know your favorites yet.</p>
              <p className="mt-1 text-xs text-ink-muted">
                Add a few foods you love or avoid, and future meals can feel more like you.
              </p>
            </div>
          )}

          <TastePreferenceSection
            title="Favorite comfort foods"
            values={preferences.favoriteComfortFoods}
            suggestions={COMFORT_FOOD_SUGGESTIONS}
            placeholder="Add a comfort food…"
            entryLabel="comfort food"
            onAdd={(value) => addPreference("favoriteComfortFoods", value)}
            onRemove={(value) => removePreference("favoriteComfortFoods", value)}
          />

          {/* A plain inserted hairline, not a divide-y border — since it's a real sibling
              in this flex-col gap-5 stack, the existing 20px gap already lands evenly on
              both sides of it for free, rather than needing extra padding math to
              balance a border-based divider (Milestone 9 polish). */}
          <div aria-hidden className="h-px w-full shrink-0 bg-tan-200/80" />

          <TastePreferenceSection
            title="Liked ingredients"
            helper="Soft favorites — your chef will use these when they fit, not force them into everything."
            values={preferences.likedIngredients}
            suggestions={LIKED_INGREDIENT_SUGGESTIONS}
            placeholder="Add an ingredient you love…"
            entryLabel="liked ingredient"
            onAdd={(value) => addPreference("likedIngredients", value)}
            onRemove={(value) => removePreference("likedIngredients", value)}
          />

          <div aria-hidden className="h-px w-full shrink-0 bg-tan-200/80" />

          <TastePreferenceSection
            title="Disliked ingredients"
            helper="Your chef will steer away from these."
            values={preferences.dislikedIngredients}
            suggestions={DISLIKED_INGREDIENT_SUGGESTIONS}
            placeholder="Add an ingredient to avoid…"
            entryLabel="disliked ingredient"
            onAdd={(value) => addPreference("dislikedIngredients", value)}
            onRemove={(value) => removePreference("dislikedIngredients", value)}
          />

          <div aria-hidden className="h-px w-full shrink-0 bg-tan-200/80" />

          <TastePreferenceSection
            title="Dietary preferences"
            helper="Taste preferences, not medical settings — we don't guarantee allergen safety."
            values={preferences.dietaryPreferences}
            suggestions={DIETARY_SUGGESTIONS}
            placeholder="Add a dietary preference…"
            entryLabel="dietary preference"
            onAdd={(value) => addPreference("dietaryPreferences", value)}
            onRemove={(value) => removePreference("dietaryPreferences", value)}
          />
        </div>
      </div>
    </Panel>
  );
}
