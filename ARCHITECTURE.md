# Project Architecture

## 📐 Workspace Structure

```
anki-alternative (Bun Workspace)
│
├─── Root Package (Next.js Web App)
│    ├── src/
│    │   ├── app/                    # Next.js App Router
│    │   │   ├── api/[...route]/    # Hono API Integration
│    │   │   └── */                 # Web pages
│    │   ├── contexts/              # React Contexts
│    │   │   ├── ThemeContext.tsx
│    │   │   ├── AppContext.tsx
│    │   │   ├── StudyContext.tsx
│    │   │   └── index.tsx
│    │   ├── api/                   # Hono API Routes
│    │   └── __tests__/             # Test Suite
│    └── package.json
│
├─── Mobile Package (Expo React Native)
│    ├── app/                       # Expo Router Screens
│    │   ├── _layout.tsx           # Root Layout + Providers
│    │   ├── index.tsx             # Home Screen
│    │   ├── decks.tsx             # Decks Screen
│    │   ├── study.tsx             # Study Screen
│    │   ├── stats.tsx             # Stats Screen
│    │   ├── browse.tsx            # Browse Screen
│    │   ├── import.tsx            # Import Screen
│    │   └── settings.tsx          # Settings Screen
│    ├── src/contexts/             # Shared Contexts (copied)
│    └── package.json
│
└─── Shared Package (Solito Components)
     ├── components/               # Cross-platform UI
     │   ├── DeckCard.tsx
     │   ├── ReviewButton.tsx
     │   └── StatsCard.tsx
     ├── index.ts
     └── package.json
```

## 🔄 Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     Providers Layer                      │
│  ┌────────────┐  ┌──────────┐  ┌──────────────┐        │
│  │   Theme    │  │   App    │  │    Study     │        │
│  │  Context   │  │ Context  │  │   Context    │        │
│  └────────────┘  └──────────┘  └──────────────┘        │
└─────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
    ┌───────▼────────┐           ┌────────▼────────┐
    │   Web (Next)   │           │  Mobile (Expo)  │
    │                │           │                 │
    │  - Pages       │           │  - Screens      │
    │  - Components  │           │  - Components   │
    │  - API Routes  │           │  - Navigation   │
    └───────┬────────┘           └────────┬────────┘
            │                             │
            └──────────────┬──────────────┘
                           │
                    ┌──────▼─────┐
                    │   Hono API │
                    │            │
                    │  - /decks  │
                    │  - /cards  │
                    │  - /notes  │
                    │  - /stats  │
                    └──────┬─────┘
                           │
                    ┌──────▼──────┐
                    │   Drizzle   │
                    │     ORM     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   SQLite    │
                    │   Database  │
                    └─────────────┘
```

## 🎨 Context Architecture

```
App Component Tree
│
├── ThemeProvider
│   ├── theme: 'light' | 'dark'
│   ├── isDark: boolean
│   ├── toggleTheme()
│   └── setTheme()
│
├── AppProvider
│   ├── decks: Deck[]
│   ├── currentDeck: Deck | null
│   ├── isLoading: boolean
│   ├── error: string | null
│   ├── setDecks()
│   ├── addDeck()
│   ├── updateDeck()
│   └── deleteDeck()
│
└── StudyProvider
    ├── currentSession: StudySession | null
    ├── sessions: StudySession[]
    ├── startSession()
    ├── endSession()
    ├── recordAnswer()
    ├── getSessions()
    └── getTodayStats()
```

## 🧪 Testing Strategy

```
Test Suite
│
├── Unit Tests
│   ├── ThemeContext.test.tsx       ✅
│   ├── AppContext.test.tsx         ✅
│   ├── StudyContext.test.tsx       ✅
│   └── Scheduler.test.ts           ✅ PASSING
│
├── Integration Tests
│   ├── integration.test.tsx        ✅
│   └── hono-nextjs.test.ts         ✅
│
└── API Tests
    └── api.test.ts                 ⚠️  (needs DB)
```

## 🚀 Technology Choices

### Why Solito?
- **Code Sharing**: Share components between web and mobile
- **Navigation**: Universal navigation primitives
- **Type Safety**: Full TypeScript support
- **Performance**: Optimized for both platforms

### Why Hono?
- **Speed**: Ultra-fast routing (faster than Express)
- **Size**: Minimal bundle size
- **Type Safety**: Built-in TypeScript support
- **Next.js Integration**: Seamless integration with Next.js API routes

### Why Context API (vs Zustand/Redux)?
- **Built-in**: No external dependencies
- **Type Safety**: Excellent TypeScript support
- **Testing**: Easy to test with React Testing Library
- **Learning Curve**: React developers already know it
- **Performance**: Sufficient for this app's needs

### Why Bun?
- **Speed**: Faster than npm/yarn/pnpm
- **Workspaces**: Built-in monorepo support
- **Runtime**: Can replace Node.js
- **Testing**: Built-in test runner (though we use Vitest)

## 📱 Mobile Screens Implementation

Each mobile screen follows this pattern:

```tsx
import { View, Text } from 'react-native';
import { useTheme } from '../src/contexts/ThemeContext';
import { useApp } from '../src/contexts/AppContext';
import { useStudy } from '../src/contexts/StudyContext';

export default function MyScreen() {
  const { isDark } = useTheme();
  const { decks } = useApp();
  const { currentSession } = useStudy();

  return (
    <View style={[styles.container, isDark && styles.dark]}>
      {/* Screen content */}
    </View>
  );
}
```

## 🔐 Type Safety

All contexts are fully typed:

```typescript
// AppContext types
interface AppContextType {
  decks: Deck[];
  currentDeck: Deck | null;
  setDecks: (decks: Deck[]) => void;
  // ...
}

// StudyContext types
interface StudyContextType {
  currentSession: StudySession | null;
  sessions: StudySession[];
  startSession: (deckId: number) => void;
  // ...
}
```

## 🎯 Cross-Platform Components

Shared components use React Native primitives that work on both platforms:

```tsx
// packages/app/components/DeckCard.tsx
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'solito/link';

export function DeckCard({ id, name, description }) {
  return (
    <Link href={`/deck/${id}`}>
      <View style={styles.card}>
        <Text style={styles.title}>{name}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </Link>
  );
}
```

On web: Renders as `<div>`, `<span>`, `<a>`
On mobile: Renders as native React Native components

## 📊 Performance Considerations

1. **Context Optimization**: Each context uses `useCallback` to memoize functions
2. **Component Splitting**: Separate contexts prevent unnecessary re-renders
3. **Lazy Loading**: Next.js automatically code-splits routes
4. **Native Performance**: React Native optimizations for mobile

## 🔄 Development Workflow

```bash
# Start both dev servers
bun dev         # Terminal 1: Web on :3000
bun dev:mobile  # Terminal 2: Mobile via Expo

# Run tests in watch mode
bun test:watch  # Terminal 3: Test runner

# Database management
bun db:studio   # Visual database explorer
```
