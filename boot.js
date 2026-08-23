import { GAME_PARTS } from "./parts-manifest.js";

async function fetchPart(url) {
  const response = await fetch(url, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Failed to load ${url}: HTTP ${response.status}`);
  }
  return await response.text();
}

function showBootFailure(error) {
  console.error("[Minecraft V14 multifile boot]", error);
  const existing = document.getElementById("multifileBootError");
  if (existing) existing.remove();

  const panel = document.createElement("pre");
  panel.id = "multifileBootError";
  panel.textContent =
    "Minecraft Web could not load one of its split source files.\n\n" +
    String(error?.stack || error) +
    "\n\nMake sure the entire ZIP was extracted/uploaded with the js/parts folder intact.";
  panel.style.cssText =
    "position:fixed;inset:12px;z-index:99999;overflow:auto;margin:0;padding:14px;" +
    "background:#130000;color:#ff8b8b;border:2px solid #ff5555;" +
    "font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;";
  document.body.appendChild(panel);
}

async function bootMultifileGame() {
  try {
    // Fetch sequentially so the source order is deterministic and easy to diagnose.
    const sources = [];
    for (const url of GAME_PARTS) {
      sources.push(await fetchPart(new URL(url, import.meta.url)));
    }

    // The original project was one ES module. Concatenating the split source at boot
    // preserves the exact shared lexical scope/order while keeping the repository modular.
    const source = sources.join("");
    const blob = new Blob([source], { type: "text/javascript" });
    const moduleURL = URL.createObjectURL(blob);

    try {
      await import(moduleURL);
    } finally {
      URL.revokeObjectURL(moduleURL);
    }
  } catch (error) {
    showBootFailure(error);
    throw error;
  }
}

bootMultifileGame();
