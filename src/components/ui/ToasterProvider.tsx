"use client";

import { useTheme } from "next-themes";
import { Toaster } from "sonner";

export default function ToasterProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      richColors
      position="top-center"
      theme={(resolvedTheme as "light" | "dark" | "system") ?? "system"}
      toastOptions={{
        className: "text-sm",
      }}
    />
  );
}
