import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { IntelligenceCard } from "@/components/IntelligenceCard";
import { CategoryFilter } from "@/components/CategoryFilter";
import { BriefingEntryCard } from "@/components/BriefingEntryCard";
import { ArticleDetail } from "@/views/ArticleDetail";
import { EntityRadar } from "@/views/EntityRadar";
import { DailyBriefing } from "@/views/DailyBriefing";
import { Profile } from "@/views/Profile";
import { MyNotes } from "@/views/MyNotes";
import type { IntelligenceCardData } from "@/types/index";
import { fetchIntelligence, type IntelligenceCard as BackendCard } from "@/lib/api";
import { AnimatePresence } from "framer-motion";
import type { Tab as BottomTab } from "@/components/layout/BottomNav";

type Tab = BottomTab | "my-notes";
type ViewState = "feed" | "detail" | "briefing";

// 将后端卡片转为前端类型
function backendToFrontend(card: BackendCard): IntelligenceCardData {
  return {
    id: card.id,
    title: card.title,
    polarity: card.polarity,
    fact: card.core_insight || card.fact, // 优先展示核心洞察
    impacts: card.impacts,
    opinion: card.alpha_opportunity || card.opinion, // 优先展示 Alpha 机会
    tags: card.tags,
    source_name: card.source_name,
    source_url: card.source_url,
  };
}

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [view, setView] = useState<ViewState>("feed");
  const [activeArticleId, setActiveArticleId] = useState<number | null>(null);

  // 统一使用分类 key 筛选
  const [activeCategory, setActiveCategory] = useState("all");

  const [feed, setFeed] = useState<IntelligenceCardData[]>([]);
  const [loading, setLoading] = useState(true);

  // 调用后端 /api/intelligence 获取 AI 分析后的情报
  useEffect(() => {
    async function loadFeed() {
      try {
        // 调用后端 API（默认开启 AI 分析）
        const response = await fetchIntelligence(20, false);

        // 转换为前端类型
        const cards = response.cards.map(backendToFrontend);
        setFeed(cards);
      } catch (err) {
        // 后端不可用时静默失败
        console.warn('后端 API 不可用，情报加载失败');
      } finally {
        setLoading(false);
      }
    }

    loadFeed();
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

  // TODO: 后端按分类筛选
  const filteredFeed = feed;

  if (view === "briefing") {
    return <DailyBriefing onBack={handleBack} />;
  }

  if (view === "detail" && activeArticleId) {
    return (
      <ArticleDetail id={activeArticleId} onBack={handleBack} />
    );
  }

  // Full screen view for My Notes (hide bottom nav if desired, or keep it)
  if (activeTab === "my-notes") {
    return <MyNotes onBack={() => setActiveTab("profile")} />;
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] font-sans text-zinc-900 selection:bg-zinc-200 pb-20">
      {/* Hide Header on Profile tab */}
      {activeTab !== "profile" && <Header />}

      <main className="max-w-md mx-auto px-4 py-4">
        {/* VIEW: HOME */}
        {activeTab === "home" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* 统一分类标签筛选 */}
            <CategoryFilter
              activeKey={activeCategory}
              onChange={setActiveCategory}
            />

            {/* Today's Briefing 入口卡片 - 核心功能前置 */}
            <div className="mt-4 mb-4">
              <BriefingEntryCard onClick={() => setActiveTab("briefing")} />
            </div>

            {/* 高保真情报卡片列表 (Standard PRD v3.0) */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 text-center">
                  <span className="text-[10px] font-black text-zinc-300 uppercase tracking-widest animate-pulse">正在分析行业情报...</span>
                </div>
              ) : filteredFeed.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {filteredFeed.map(card => (
                    <IntelligenceCard
                      key={card.id}
                      data={card}
                      onClick={() => handleCardClick(card.id)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="py-20 text-center flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
                  <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center text-zinc-300">
                    <span className="font-black text-xl">!</span>
                  </div>
                  <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">No Intelligence for {activeCategory}</p>
                </div>
              )}
            </div>

            {!loading && (
              <div className="text-center py-8 text-zinc-300 text-[10px] uppercase tracking-widest font-medium">
                Briefing Complete
              </div>
            )}
          </div>
        )
        }

        {/* VIEW: SUBSCRIBE (Entity Radar) */}
        {
          activeTab === "subscribe" && (
            <div className="animate-in fade-in zoom-in-95 duration-500 -mx-4 -mt-4">
              <EntityRadar />
            </div>
          )
        }

        {/* VIEW: BRIEFING (Lenny Style Editorial) */}
        {
          activeTab === "briefing" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 -mx-4 -mt-4">
              <DailyBriefing onBack={() => setActiveTab("home")} />
            </div>
          )
        }


        {/* VIEW: PROFILE */}
        {
          activeTab === "profile" && (
            <div className="animate-in fade-in zoom-in-95 duration-300 -mx-4 -mt-4">
              <Profile onNavigate={(view) => setActiveTab(view as Tab)} />
            </div>
          )
        }
      </main >

      <BottomNav activeTab={activeTab as any} onTabChange={setActiveTab as any} />
    </div >
  );
}
