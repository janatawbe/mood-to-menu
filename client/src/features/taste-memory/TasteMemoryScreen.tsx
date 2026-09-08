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
 * Where the user teaches their chef what they love — chip-based entries throughout,
 * matching Vibe Check's own quick-pick pattern. Persists immediately on every change
 * (see useTasteMemory), so there's no Save button — the caption below the heading makes
 * that clear instead.
 */
export function TasteMemoryScreen({ tasteMemory }: TasteMemoryScreenProps) {
  const { preferences, isEmpty, addPreference, removePreference } = tasteMemory;

  return (
    <Panel className="relative flex flex-col overflow-hidden lg:h-full">
      <SectionHeader title="Taste Memory" subtitle="Teach your chef what you love." />

      {/* px + matching -mx: overflow-y-auto also clips overflow-x, which was cutting off
          the left edge of the inputs' focus outline. The padding gives the outline room;
          the negative margin cancels its inward shift so content still lines up above. */}
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

          {/* A plain hairline sibling in this flex-col gap-5 stack — the existing gap
              already lands evenly on both sides of it, no extra padding math needed. */}
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
