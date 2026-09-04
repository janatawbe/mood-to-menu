import type { GroceryItem } from "../types/domain";

export type GroceryCategory = "Produce" | "Meat & Protein" | "Dairy & Eggs" | "Bakery" | "Pantry" | "Other";

/** Fixed display order — categories always appear in this sequence, and only sections
 * that actually have items render (see groupGroceryItems). */
export const CATEGORY_ORDER: GroceryCategory[] = [
  "Produce",
  "Meat & Protein",
  "Dairy & Eggs",
  "Bakery",
  "Pantry",
  "Other",
];

/**
 * Small deterministic keyword match, not a food taxonomy — good enough to make a long
 * list scannable without ever needing a Gemini call. Checked in this order (produce
 * before pantry) so multi-purpose words land somewhere reasonable; genuinely ambiguous
 * ingredients fall through to "Pantry", the documented default, since most ingredients
 * a keyword miss lets through in practice (oils, spices, condiments, sauces, grains)
 * are pantry items, not truly uncategorizable ones.
 */
const CATEGORY_KEYWORDS: Record<Exclude<GroceryCategory, "Other">, string[]> = {
  Produce: [
    "lettuce", "spinach", "kale", "arugula", "carrot", "onion", "shallot", "garlic",
    "tomato", "potato", "sweet potato", "bell pepper", "chili", "broccoli", "cauliflower",
    "cucumber", "zucchini", "mushroom", "avocado", "lemon", "lime", "orange", "apple",
    "banana", "berry", "berries", "grape", "cilantro", "parsley", "basil", "mint",
    "ginger", "celery", "corn", "cabbage", "squash", "herbs",
  ],
  "Meat & Protein": [
    "chicken", "beef", "pork", "turkey", "bacon", "sausage", "shrimp", "salmon", "tuna",
    "fish", "tofu", "tempeh", "lamb", "steak", "ground beef", "chickpea", "lentil",
    "black beans", "kidney beans",
  ],
  "Dairy & Eggs": [
    "milk", "cheese", "yogurt", "butter", "cream", "egg", "parmesan", "mozzarella",
    "cheddar", "feta", "sour cream", "cream cheese",
  ],
  Bakery: ["bread", "bun", "bagel", "tortilla", "baguette", "roll", "pita", "naan", "croissant"],
  Pantry: [
    "rice", "pasta", "noodle", "flour", "sugar", "oil", "salt", "pepper", "spice",
    "sauce", "vinegar", "broth", "stock", "canned", "cereal", "oats", "honey", "syrup",
    "nut", "seed", "baking", "stock cube", "bouillon",
  ],
};

/** Pure/deterministic — no network call, no Gemini. Falls back to "Pantry" if nothing
 * matches, per the documented default above; never returns anything that would cause an
 * item to be dropped from the list. */
export function categorizeIngredient(name: string): GroceryCategory {
  const normalized = name.toLowerCase();
  for (const category of CATEGORY_ORDER) {
    if (category === "Other") continue;
    const keywords = CATEGORY_KEYWORDS[category];
    if (keywords.some((keyword) => normalized.includes(keyword))) return category;
  }
  return "Pantry";
}

export interface GroceryGroup {
  category: GroceryCategory;
  items: GroceryItem[];
}

/** Groups items by category in the fixed display order, omitting empty categories.
 * Every item is placed somewhere (categorizeIngredient never fails to return a
 * category), so grouping can never make an item disappear from the list. */
export function groupGroceryItems(items: GroceryItem[]): GroceryGroup[] {
  const byCategory = new Map<GroceryCategory, GroceryItem[]>();
  for (const item of items) {
    const category = categorizeIngredient(item.name);
    const bucket = byCategory.get(category);
    if (bucket) bucket.push(item);
    else byCategory.set(category, [item]);
  }
  return CATEGORY_ORDER.map((category) => ({ category, items: byCategory.get(category) ?? [] })).filter(
    (group) => group.items.length > 0,
  );
}
