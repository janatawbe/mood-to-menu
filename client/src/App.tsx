import { useState } from "react";
import { AppShell } from "./features/shell/AppShell";
import { IntroAnimation } from "./features/intro/IntroAnimation";

function App() {
  const [logoIntroDone, setLogoIntroDone] = useState(false);

  return (
    <IntroAnimation onComplete={() => setLogoIntroDone(true)}>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-2xl focus:bg-brand-accent-strong focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <AppShell chefIntroReady={logoIntroDone} />
    </IntroAnimation>
  );
}

export default App;
