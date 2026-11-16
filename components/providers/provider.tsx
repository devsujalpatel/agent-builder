"use client";

import { Toaster } from "../ui/toast";
import { TooltipProvider } from "../ui/tooltip";
import { ThemeProvider } from "./theme-provider";

export function Provider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute={"class"}
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>
        {children}
        <Toaster />
      </TooltipProvider>
    </ThemeProvider>
  );
}
