"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Auto-init komponen interaktif Preline (dropdown, overlay, dsb).
 * Dipanggil ulang tiap ganti rute karena React SPA mengganti DOM tanpa reload.
 */
export default function PrelineInit() {
  const pathname = usePathname();

  useEffect(() => {
    void import("preline").then((mod) => {
      const methods = mod as unknown as {
        HSStaticMethods?: { autoInit?: () => void };
      };
      methods.HSStaticMethods?.autoInit?.();
    });
  }, [pathname]);

  return null;
}
