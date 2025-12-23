import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { IntelligenceCard } from "@/components/IntelligenceCard";
import { ArticleDetail } from "@/views/ArticleDetail";
import { EntityRadar } from "@/views/EntityRadar";
import { DailyBriefing } from "@/views/DailyBriefing";
import { PosterOverlay } from "@/components/viral/PosterOverlay";
import type { IntelligenceCardData } from "@/types/index";
import { fetchFeed } from "@/lib/api";
import { DataView } from "@/views/DataView";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

type Tab = "home" | "subscribe" | "briefing" | "data" | "profile";
type ViewState = "feed" | "detail" | "briefing";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [view, setView] = useState<ViewState>("feed");
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);
  const [viralData, setViralData] = useState<IntelligenceCardData | null>(null);

  const [activeTagFilter, setActiveTagFilter] = useState("All");

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

  const handleDismiss = (id: number) => {
    setFeed(prev => prev.filter(card => card.id !== id));
  };

  const handleTagClick = (tag: string) => {
    import("@/lib/haptic").then(({ triggerHaptic }) => triggerHaptic("light"));
    setActiveTagFilter(tag);
  };

  const filteredFeed = feed.filter(card => {
    if (activeTagFilter === "All") return true;
    return card.tags?.some(t => t.toLowerCase().includes(activeTagFilter.toLowerCase()));
  });

  if (view === "briefing") {
    return <DailyBriefing onBack={handleBack} />;
  }

  if (view === "detail" && activeArticleId) {
    return (
      <ArticleDetail id={activeArticleId} onBack={handleBack} />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-zinc-900 selection:bg-zinc-200 pb-20">
      <Header />

      <main className="max-w-md mx-auto px-4 py-4">
        {/* VIEW: HOME */}
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Scrollable Tags (V2 Style) */}
            <div className="flex gap-2 overflow-x-auto pb-6 no-scrollbar items-center">
              {["All", "Macro", "Luxury", "Tech", "Medical"].map((tag) => {
                const isActive = activeTagFilter === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => handleTagClick(tag)}
                    className={cn(
                      "px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all active:scale-95 border",
                      isActive
                        ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/10"
                        : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-200"
                    )}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>

            <div className="space-y-1">
              {loading ? (
                <div className="py-20 text-center">
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest animate-pulse">Analysing Industry Data...</span>
                </div>
              ) : filteredFeed.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredFeed.map(card => (
                    <IntelligenceCard
                      key={card.id}
                      data={card}
                      onLongPress={(d) => setViralData(d)}
                      onClick={() => handleCardClick(card.id)}
                      onDismiss={handleDismiss}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
                  <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-300">
                    <span className="font-black text-xl">!</span>
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">No Intelligence for {activeTagFilter}</p>
                </div>
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

        {/* VIEW: DATA (Raw Data Explorer) */}
        {activeTab === "data" && (
          <div className="animate-in fade-in zoom-in-95 duration-500">
            <DataView />
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
