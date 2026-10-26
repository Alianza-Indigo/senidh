"use client";

import { useState } from "react";

export function PrintButton() {
  const [preparing, setPreparing] = useState(false);

  async function printCredential() {
    setPreparing(true);
    const pendingImages = Array.from(document.images).filter(image => !image.complete);
    await Promise.all(pendingImages.map(image => Promise.race([
      new Promise<void>(resolve => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      }),
      new Promise<void>(resolve => window.setTimeout(resolve, 5000))
    ])));
    await document.fonts?.ready;
    window.print();
    setPreparing(false);
  }

  return <button type="button" disabled={preparing} onClick={() => void printCredential()}>{preparing ? "Preparando fotografía…" : "Imprimir credencial"}</button>;
}
