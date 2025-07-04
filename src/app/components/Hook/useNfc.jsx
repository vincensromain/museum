"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function useNfc(active = false, setScanned = () => {}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    if (typeof window === "undefined" || !("NDEFReader" in window)) {
      console.warn("❌ Web NFC non disponible sur cet appareil.");
      return;
    }

    const reader = new window.NDEFReader();
    const controller = new AbortController();

    reader
      .scan({ signal: controller.signal })
      .then(() => {
        reader.onreading = (event) => {
          const decoder = new TextDecoder();
          for (const record of event.message.records) {
            if (record.recordType === "text") {
              const value = decoder.decode(record.data).trim();
              setScanned(true);
              router.push(`/${value}`);
              controller.abort();
              break;
            }
          }
        };
      })
      .catch((err) => {
        console.error("❌ Erreur Web NFC :", err);
      });

    return () => controller.abort();
  }, [active, setScanned, router]);
}
