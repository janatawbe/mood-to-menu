import foodLineImage from "../../assets/decorations/foodline.webp";

/**
 * The card's closing decorative food spread — a single real illustrated asset rather than
 * individual glyphs, so it reads with the same richness as the design reference. The
 * wrapping box's height is the only thing driven by CSS (via `clamp()`, tied to viewport
 * height so it scales down on short desktop windows instead of pushing the page taller);
 * the image itself just fills that box with `object-contain`, so its own aspect ratio is
 * always preserved and it can never stretch or distort.
 */
export function FoodLineAccent() {
  return (
    <div
      aria-hidden
      className="pointer-events-none mx-auto w-full shrink-0 select-none"
      style={{ height: "clamp(72px, 12vh, 148px)" }}
    >
      <img src={foodLineImage} alt="" className="h-full w-full object-contain" />
    </div>
  );
}
