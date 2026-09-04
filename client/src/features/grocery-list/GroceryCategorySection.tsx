import type { GroceryItem } from "../../types/domain";
import type { GroceryCategory } from "../../lib/groceryCategories";
import { GroceryItemRow } from "./GroceryItemRow";

interface GroceryCategorySectionProps {
  category: GroceryCategory;
  items: GroceryItem[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function GroceryCategorySection({ category, items, onToggle, onRemove }: GroceryCategorySectionProps) {
  return (
    <section aria-labelledby={`grocery-category-${category}`}>
      <h3
        id={`grocery-category-${category}`}
        className="text-xs font-bold uppercase tracking-[0.12em] text-brand-accent-strong"
      >
        {category}
      </h3>
      <div className="mt-1.5 divide-y divide-dashed divide-tan-200/70 border-b border-dashed border-tan-200/70">
        {items.map((item) => (
          <GroceryItemRow key={item.id} item={item} onToggle={onToggle} onRemove={onRemove} />
        ))}
      </div>
    </section>
  );
}
