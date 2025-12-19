import { IntelligenceCard } from "@/components/IntelligenceCard";
import { IntelligenceCardData } from "@/types";

const MOCK_FEED: IntelligenceCardData[] = [
  {
    id: 740784,
    title: "爱马仕股份离奇蒸发",
    polarity: "negative",
    fact: "爱马仕继承人皮埃什的 6% 股份被理财顾问私自转移，主要流向 LVMH。",
    impacts: [
      { entity: "爱马仕", trend: "down", reason: "家族控股结构动荡" },
      { entity: "LVMH", trend: "up", reason: "意外获得战略筹码" }
    ],
    opinion: "不仅是诈骗，更是老钱家族治理结构的典型溃败。财富屏蔽了风险，也屏蔽了常识。",
    tags: ["奢侈品", "LVMH"],
    source_name: "起点财经"
  },
  {
    id: 741623,
    title: "童颜针走下神坛",
    polarity: "neutral",
    fact: "童颜针市场从高价垄断转向多元竞争，新氧通过低价策略倒逼厂商让出定价权。",
    impacts: [
      { entity: "新氧", trend: "up", reason: "获客成本降低" },
      { entity: "爱美客", trend: "down", reason: "护城河被渠道商攻破" }
    ],
    opinion: "医美暴利时代的终结号角。当渠道商开始因为那定价权，上游厂商的好日子就到头了。",
    tags: ["医美", "消费医疗"],
    source_name: "化妆品观察"
  }
];

function App() {
  return (
    <main className="min-h-screen bg-zinc-50 pb-20">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-4 py-3 flex justify-between items-center">
        <h1 className="text-sm font-bold tracking-tight text-zinc-900">Industry Intelligence</h1>
        <div className="text-xs font-medium px-2 py-1 bg-zinc-100 rounded-full text-zinc-500">
          今日内参
        </div>
      </div>

      {/* Feed Container */}
      <div className="max-w-md mx-auto p-4 space-y-4">
        <div className="text-xs text-zinc-400 font-medium ml-1 mb-2 uppercase tracking-widest">
          Latest Briefing
        </div>

        {MOCK_FEED.map((card) => (
          <IntelligenceCard key={card.id} data={card} />
        ))}

        <div className="text-center py-8 text-zinc-300 text-xs">
          You have reached the end of the brief.
        </div>
      </div>
    </main>
  );
}

export default App;
