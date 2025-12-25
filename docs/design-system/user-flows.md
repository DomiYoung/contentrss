# ContentRSS User Flows

> **Version**: 1.0 | **Last Updated**: 2024-12-24
> **Expert Source**: `interaction-design-science` + Product Manager

---

## 1. Core User Flows

### 1.1 First-Time User Onboarding

```mermaid
flowchart TD
    A[App Launch] --> B{First Time?}
    B -->|Yes| C[Welcome Screen]
    B -->|No| H[Home Feed]
    
    C --> D[Value Proposition]
    D --> E[Select Interests]
    E --> F[Subscribe Entities]
    F --> G[Enable Notifications?]
    G --> H[Home Feed]
    
    style A fill:#007AFF
    style H fill:#34C759
```

**Key Metrics**:
- Completion Rate > 85%
- Time to First Value (TTFV) < 60s
- Entities Subscribed ≥ 3

---

### 1.2 Daily Reading Flow

```mermaid
flowchart LR
    A[Open App] --> B{Daily Briefing Ready?}
    B -->|Yes| C[Read Briefing TL;DR]
    B -->|No| D[Browse Feed]
    
    C --> E[Deep Dive Section]
    E --> F{Interesting Card?}
    F -->|Yes| G[Article Detail]
    F -->|No| H[Continue Scroll]
    
    G --> I[Ask AI / Take Note]
    I --> J[Return to Flow]
    
    D --> F
    H --> F
    J --> H
```

**Aha Moment**: 用户在 TL;DR 中发现与自身相关的情报时

---

### 1.3 Intelligence Card Interaction

```mermaid
flowchart TD
    A[View Card] --> B{Interaction Type}
    
    B -->|Single Tap| C[Article Detail]
    B -->|Long Press| D[Viral Poster Preview]
    B -->|Swipe Right| E[Ignore / Archive]
    
    D --> F{Generate Poster?}
    F -->|Yes| G[Share Options]
    F -->|No| A
    
    G --> H[Social Share]
    G --> I[Save to Album]
    
    style C fill:#007AFF
    style G fill:#34C759
```

---

### 1.4 Article Detail Deep Dive

```mermaid
flowchart TD
    A[Enter Article] --> B[View TL;DR Brain]
    B --> C[Read Full Content]
    
    C --> D{Bottom Bar Action}
    D -->|Ask AI| E[AI Chat Context]
    D -->|Take Note| F[Save to Ledger]
    D -->|Share| G[Share Options]
    D -->|Long Press Poster| H[Viral Poster]
    
    E --> I[Get Answer]
    I --> C
    
    F --> J[Note Saved Toast]
    J --> C
```

---

### 1.5 Entity Radar Subscription

```mermaid
flowchart TD
    A[Open Radar] --> B[Browse Categories]
    B --> C[View Entity List]
    
    C --> D{Action}
    D -->|Tap Subscribe| E[Toggle Subscription]
    D -->|Tap Row| F[Preview Entity Feed]
    D -->|Long Press| G[More Options]
    
    E --> H[Haptic Feedback]
    H --> I[Update Radar Status]
    
    F --> J[Entity Detail View]
    J --> K{Subscribe?}
    K -->|Yes| E
    K -->|No| C
```

---

## 2. Error & Edge Cases

### 2.1 Network Error Flow

```
┌─────────────────────────────────────┐
│          [Offline Banner]           │
│  "You're offline. Showing cached."  │
├─────────────────────────────────────┤
│                                     │
│     Cached Intelligence Cards       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ Card with "Cached" badge    │    │
│  └─────────────────────────────┘    │
│                                     │
│         [Retry Button]              │
│                                     │
└─────────────────────────────────────┘
```

### 2.2 Empty State Flows

| Page | Empty State | CTA |
|:---|:---|:---|
| Home Feed | "No intelligence yet" | Browse Trending |
| Entity Radar | "Your radar is empty" | Browse Entities |
| Daily Briefing | "No briefing today" | Browse Feed Instead |
| Search Results | "No matches found" | Try Different Keywords |

---

## 3. Notification Flows

### 3.1 Push Notification → Article

```
[Push: Breaking: LVMH Q4 earnings surprise]
                ↓
         Open App at Article Detail
                ↓
         Read → Ask AI → Back to Feed
```

### 3.2 Daily Briefing Reminder

```
[Push: Your Dec 24 briefing is ready 📰]
                ↓
         Open App at Daily Briefing
                ↓
         Read TL;DR → Deep Dive
```

---

## 4. Cross-Page Navigation

```mermaid
flowchart TB
    subgraph TabBar
        T1[Feed]
        T2[Radar]
        T3[Briefing]
        T4[Profile]
    end
    
    T1 --> A1[Home Feed]
    T2 --> A2[Entity Radar]
    T3 --> A3[Daily Briefing]
    T4 --> A4[Profile / Settings]
    
    A1 -->|Tap Card| B1[Article Detail]
    A1 -->|Pull Refresh| A1
    
    A2 -->|Subscribe| C1[Update Feed Filter]
    C1 --> A1
    
    A3 -->|Tap Embedded Card| B1
    
    B1 -->|Swipe Back| A1
    B1 -->|Swipe Back| A3
```

---

## 5. Success Metrics by Flow

| Flow | Key Metric | Target |
|:---|:---|:---|
| Onboarding | Completion Rate | > 85% |
| Daily Reading | Session Duration | > 5 min |
| Card Interaction | Tap-through Rate | > 30% |
| Article Detail | AI Ask Rate | > 15% |
| Radar Subscription | Entities per User | ≥ 5 |
| Viral Poster | Share Rate | > 10% |
