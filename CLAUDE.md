# CLAUDE.md — snap-confirm

Photography business management SaaS application (Thai-language focused).

## Tech Stack

- **Framework:** React 18 + TypeScript 5.8
- **Build:** Vite 5 with SWC (`@vitejs/plugin-react-swc`)
- **Styling:** Tailwind CSS 3.4 + shadcn-ui (Radix primitives)
- **Routing:** React Router DOM 6
- **Server State:** TanStack React Query v5
- **Forms:** react-hook-form + zod validation
- **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
- **Storage:** Cloudflare R2 via custom hooks
- **Package Manager:** Bun (bun.lockb) or npm

## Commands

```bash
npm run dev          # Dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run test         # Vitest (single run)
npm run test:watch   # Vitest (watch mode)
```

## Project Structure

```
src/
├── components/              # React components
│   ├── ui/                  # shadcn-ui primitives (48 components)
│   └── invitation-templates/ # Wedding card templates (6 variants)
├── hooks/                   # Custom hooks (16 domain + utility hooks)
├── pages/                   # Route page components (22 pages)
├── types/                   # TypeScript types (booking.ts, package.ts)
├── lib/                     # Utility functions (utils.ts with cn())
├── integrations/supabase/   # Supabase client + auto-generated DB types
├── test/                    # Test setup (vitest + jsdom + testing-library)
├── App.tsx                  # Root component with routing
├── main.tsx                 # Entry point
└── index.css                # Global styles + Tailwind directives
supabase/
├── config.toml              # Supabase local config
├── functions/               # Edge functions
└── migrations/              # SQL schema migrations
```

## Architecture Patterns

### State Management

- **Server state:** TanStack React Query with custom hooks per domain (`useBookings`, `useQuotations`, etc.)
- **Auth state:** React Context via `AuthProvider` / `useAuth()`
- **UI state:** Local `useState` within components
- **Theme:** `next-themes` with class-based dark mode

### Data Fetching Convention

Custom hooks in `src/hooks/` follow this pattern:

```typescript
// Query
export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const { data, error } = await supabase.from('bookings').select('*')
      if (error) throw error
      return data as Booking[]
    }
  })
}

// Mutation
export function useCreateBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data) => { /* supabase insert */ },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      toast.success('Thai success message')
    },
    onError: (error) => {
      toast.error('Thai error message: ' + error.message)
    }
  })
}
```

### Forms

- Use `react-hook-form` with `zodResolver` for validation
- Zod schemas define validation; error messages are in Thai

### Components

- shadcn-ui components live in `src/components/ui/` — do not edit these directly
- Custom components use shadcn primitives + Tailwind classes
- Use `cn()` from `src/lib/utils.ts` for conditional class merging

## Path Alias

`@/*` maps to `./src/*` (configured in tsconfig and vite.config.ts).

## TypeScript Configuration

- **Loose mode:** `strict: false`, `noImplicitAny: false`, `strictNullChecks: false`
- Database types are auto-generated in `src/integrations/supabase/types.ts`

## Styling Conventions

- Tailwind utility classes; avoid custom CSS files
- Custom theme colors: primary (deep charcoal), accent (copper/bronze), secondary (warm cream)
- Custom fonts: Inter (sans), Playfair Display (display)
- Photography-themed shadows: `shadow-soft`, `shadow-card`, `shadow-elevated`

## Thai Language

- UI text, form labels, validation messages, and toasts are in **Thai**
- Dates use `date-fns` with Thai locale (`th`) and Buddhist Era (year + 543)
- Currency formatted as Thai Baht (฿)

## Testing

- Framework: Vitest + React Testing Library + jsdom
- Globals enabled (no need to import `describe`, `it`, `expect`)
- Setup: `src/test/setup.ts` (jest-dom matchers + matchMedia mock)
- Pattern: `src/**/*.{test,spec}.{ts,tsx}`

## Key Features

- Booking management with calendar views
- Quotation generation with PDF export (jspdf + html2canvas)
- Photo delivery galleries with token-based public access
- Wedding invitation templates
- Portfolio management with public sharing
- Face detection/search (face-api.js)
- Batch image download with zip (jszip)
- Google reCAPTCHA integration
- Admin user management
