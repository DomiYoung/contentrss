import { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { IntelligenceCard } from "@/components/IntelligenceCard";
import { ArticleDetail } from "@/views/ArticleDetail";
import { EntityRadar } from "@/views/EntityRadar";
import { DailyBriefing } from "@/views/DailyBriefing";
import { PosterOverlay } from "@/components/viral/PosterOverlay";
import type { IntelligenceCardData } from "@/types/index";
import { fetchFeed } from "@/lib/api";

type Tab = "home" | "subscribe" | "briefing" | "profile";
type ViewState = "feed" | "detail" | "briefing";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [view, setView] = useState<ViewState>("feed");
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [viralData, setViralData] = useState<IntelligenceCardData | null>(null);

  const [feed, setFeed] = useState<IntelligenceCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  useEffect(() => {
    fetchFeed()
      .then((data) => {
        setFeed(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setLoading(false);
      });
  }, []);

  const handleCardClick = (id: number) => {
    setActiveArticleId(id);
    setView("detail");
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setView("feed");
    setActiveArticleId(null);
  };

  if (view === "briefing") {
    return <DailyBriefing onBack={handleBack} />;
  }

  if (view === "detail" && activeArticleId) {
    return (
      <ArticleDetail id={activeArticleId} onBack={handleBack} />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans text-zinc-900 selection:bg-zinc-200 pb-20">
      <Header />

      <main className="max-w-md mx-auto px-4 py-4">
        {/* VIEW: HOME */}
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Scrollable Tags (Mock) */}
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar items-center">
              {["All", "Macro", "Luxury", "Tech", "Crypto"].map((tag, i) => (
                <button key={tag} className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${i === 0 ? "bg-zinc-900 text-white" : "bg-white text-zinc-500 border border-zinc-100"}`}>
                  {tag}
                </button>
              ))}
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="py-20 text-center text-zinc-400 text-sm animate-pulse">Analysing Industry Data...</div>
              ) : (
                feed.map(card => (
                  <IntelligenceCard
                    key={card.id}
                    data={card}
                    onLongPress={(d) => setViralData(d)}
                    onClick={() => handleCardClick(card.id)}
                  />
                ))
              )}
            </div>

            {!loading && (
              <div className="text-center py-8 text-zinc-300 text-[10px] uppercase tracking-widest font-medium">
                Briefing Complete
              </div>
            )}
          </div>
        )}

        {/* Viral Poster Overlay for Home Feed Long Press */}
        <PosterOverlay
          isOpen={!!viralData}
          onClose={() => setViralData(null)}
          data={viralData as any}
        />

        {/* VIEW: SUBSCRIBE (Entity Radar) */}
        {activeTab === "subscribe" && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <EntityRadar />
          </div>
        )}

        {/* VIEW: BRIEFING (Lenny Style Editorial) */}
        {activeTab === "briefing" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mx-4">
            <DailyBriefing onBack={() => setActiveTab("home")} />
          </div>
        )}

        {/* VIEW: PROFILE (Placeholder) */}
        {activeTab === "profile" && (
          <div className="py-20 text-center text-zinc-400 animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-zinc-200 rounded-full mx-auto mb-4 animate-pulse" />
            <p className="text-lg font-bold text-zinc-900">Guest User</p>
            <button className="mt-4 text-xs font-bold text-zinc-900 underline">Sign In</button>
          </div>
        )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
