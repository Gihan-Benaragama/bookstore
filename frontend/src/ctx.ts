import { createContext } from "react";

// Shared React context — imported by store.tsx (Provider) and useStore.ts (consumer)
// Keep this in its own file so store.tsx only exports a component (required by Fast Refresh)
export const Ctx = createContext<any>(null);

