import { useState } from "react";
import { BottomNav } from "@/components/layout/BottomNav";
import { ArticleDetail } from "@/views/ArticleDetail";
import { EntityRadar } from "@/views/EntityRadar";
import { DailyBriefing } from "@/views/DailyBriefing";
import { ProfilePage } from "@/views/ProfilePage";
import { MyNotes } from "@/views/MyNotes";
import { DataView } from "@/views/DataView";
import { IntelligenceView } from "@/views/IntelligenceView";
import { OnboardingProvider, OnboardingCarousel } from "@/components/onboarding";
import { PersonaProvider } from "@/context/PersonaContext";
import type { Tab as BottomTab } from "@/components/layout/BottomNav";

type Tab = BottomTab | "my-notes";
type ViewState = "feed" | "detail" | "briefing";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("data");
  const [view, setView] = useState<ViewState>("feed");
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);

  // const [loading, setLoading] = useState(false); // Cleaned up unused state

  const handleBack = () => {
    setView("feed");
    setActiveArticleId(null);
  };

  if (view === "briefing") {
    return (
      <OnboardingProvider>
        <OnboardingCarousel />
        <DailyBriefing onBack={handleBack} />
      </OnboardingProvider>
    );
  }

  if (view === "detail" && activeArticleId) {
    return (
      <OnboardingProvider>
        <OnboardingCarousel />
        <ArticleDetail id={activeArticleId} onBack={handleBack} />
      </OnboardingProvider>
    );
  }

  // Full screen view for My Notes (hide bottom nav if desired, or keep it)
  if (activeTab === "my-notes") {
    return (
      <OnboardingProvider>
        <OnboardingCarousel />
        <MyNotes onBack={() => setActiveTab("profile")} />
      </OnboardingProvider>
    );
  }

  return (
    <PersonaProvider>
      <OnboardingProvider>
        <OnboardingCarousel />
        <div className="h-screen flex flex-col bg-white font-sans text-gray-900 selection:bg-blue-100 overflow-hidden">
          {/* Main Content Area - Scrollable */}
          <main className="flex-1 overflow-hidden">
            {/* VIEW: HOME (New Intelligence Briefing) */}
            {activeTab === "home" && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                <IntelligenceView />
              </div>
            )}

            {/* VIEW: SUBSCRIBE (Entity Radar) */}
            {activeTab === "subscribe" && (
              <div className="h-full animate-in fade-in zoom-in-95 duration-500">
                <EntityRadar />
              </div>
            )}

            {/* VIEW: BRIEFING (Lenny Style Editorial) */}
            {activeTab === "briefing" && (
              <div className="h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DailyBriefing onBack={() => setActiveTab("home")} />
              </div>
            )}

            {/* VIEW: DATA CENTER (Raw Articles) */}
            {activeTab === "data" && (
              <div className="h-full animate-in fade-in zoom-in-95 duration-500">
                <DataView />
              </div>
            )}

            {/* VIEW: PROFILE */}
            {activeTab === "profile" && (
              <div className="h-full animate-in fade-in zoom-in-95 duration-300">
                <ProfilePage />
              </div>
            )}
          </main>

          {/* Fixed Bottom Navigation */}
          <BottomNav activeTab={activeTab as any} onTabChange={setActiveTab as any} />
        </div>
      </OnboardingProvider>
    </PersonaProvider>
  );
}
