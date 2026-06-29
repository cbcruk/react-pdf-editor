import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { defaultTokens } from "./tokens.ts";
import type { Tokens } from "./tokens.ts";

const ThemeContext = createContext<Tokens>(defaultTokens);

export interface ThemeProviderProps {
  tokens: Tokens;
  children: ReactNode;
}

export function ThemeProvider({ tokens, children }: ThemeProviderProps): React.ReactElement {
  return <ThemeContext.Provider value={tokens}>{children}</ThemeContext.Provider>;
}

export function useTokens(): Tokens {
  return useContext(ThemeContext);
}
