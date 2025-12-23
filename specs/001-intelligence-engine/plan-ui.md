# Implementation Plan: UI & Interaction (Spec-Kit Adjusted)

## Tech Stack
- **Router**: Simple State Router (MVP) or React Router (if complexity grows).
- **Icons**: Lucide React.
- **Styling**: TailwindCSS.

## Steps
1. **Layout Components**:
   - `BottomNav`: Home, Subscribe, Profile.
   - `Header`: Dynamic title, Search icon.
   - `ViralWatermark`: Overlay for shared screenshots.
2. **Page Views**:
   - `HomeView`: Intelligence Feed + Horizontal Tabs.
   - `SubscribeView`: Entity Grid.
   - `ProfileView`: User stats.
3. **Refine Intelligence Card**:
   - Add "Impact Arrow" visuals (Green/Red/Grey).
   - Ensure Typography matches Spec.
4. **Integration**:
   - `App.tsx` manages `activeTab` state.
