"use client";

import { useEffect, useRef } from "react";
import type { MediaPlatform } from "@/lib/media-posts-data";

declare global {
  interface Window {
    instgrm?: { Embeds: { process: () => void } };
    FB?: { XFBML: { parse: (node?: HTMLElement) => void } };
    twttr?: { widgets: { load: (node?: HTMLElement) => void } };
  }
}

/**
 * Loads a platform embed script at most once and resolves once it's actually ready.
 * `isReady` checks the real global (window.instgrm / FB / twttr) rather than the
 * script tag's "load" event — with several podcast cards on one page, the event
 * fires once and only once, so any embed mounted after the first would otherwise
 * wait on a "load" that already happened and never render.
 */
function loadScriptOnce(id: string, src: string, isReady: () => boolean): Promise<void> {
  return new Promise((resolve) => {
    if (isReady()) {
      resolve();
      return;
    }
    let attempts = 0;
    const poll = window.setInterval(() => {
      attempts += 1;
      if (isReady() || attempts > 100) {
        window.clearInterval(poll);
        resolve();
      }
    }, 100);

    if (!document.getElementById(id)) {
      const script = document.createElement("script");
      script.id = id;
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }
  });
}

/** Renders an official inline embed (Instagram / Facebook / X) for a public post permalink. */
export default function SocialEmbed({ platform, url }: { platform: MediaPlatform; url: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (platform === "instagram") {
        await loadScriptOnce("instagram-embed-js", "https://www.instagram.com/embed.js", () => Boolean(window.instgrm));
        if (!cancelled) window.instgrm?.Embeds.process();
      } else if (platform === "facebook") {
        await loadScriptOnce(
          "facebook-embed-js",
          "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v19.0",
          () => Boolean(window.FB)
        );
        if (!cancelled) window.FB?.XFBML.parse(ref.current ?? undefined);
      } else if (platform === "twitter") {
        await loadScriptOnce("twitter-embed-js", "https://platform.twitter.com/widgets.js", () => Boolean(window.twttr));
        if (!cancelled) window.twttr?.widgets.load(ref.current ?? undefined);
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [platform, url]);

  if (platform === "instagram") {
    return (
      <div ref={ref} className="flex justify-center overflow-hidden rounded-2xl">
        <blockquote className="instagram-media" data-instgrm-permalink={url} data-instgrm-version="14" style={{ width: "100%", margin: 0 }} />
      </div>
    );
  }

  if (platform === "facebook") {
    return (
      <div ref={ref} className="overflow-hidden rounded-2xl">
        <div className="fb-post" data-href={url} data-width="100%" />
      </div>
    );
  }

  if (platform === "twitter") {
    return (
      <div ref={ref} className="flex justify-center overflow-hidden rounded-2xl">
        <blockquote className="twitter-tweet">
          <a href={url}>{url}</a>
        </blockquote>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass shimmer-border block rounded-2xl p-5 text-sm font-semibold text-brand-gold hover:underline"
    >
      Listen to this episode →
    </a>
  );
}
