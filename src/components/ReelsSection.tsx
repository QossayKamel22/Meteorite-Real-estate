"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Play } from "lucide-react";
import { FacebookIcon, InstagramIcon, TikTokIcon, YouTubeIcon } from "@/components/SocialIcons";
import { PLATFORM_LABEL, reelEmbedSrc, type Reel, type ReelPlatform, type SocialAccounts } from "@/lib/reels-shared";

const EASE = [0.22, 1, 0.36, 1] as const;
const DWELL_MS = 650;

const ICON: Record<ReelPlatform, (p: { size?: number }) => React.ReactElement> = { tiktok: TikTokIcon, instagram: InstagramIcon, youtube: YouTubeIcon, facebook: FacebookIcon };

/** Per-platform look: card background, the two aurora colours behind the wall, and the spinning ring on the card in focus. */
const THEME: Record<ReelPlatform, { card: string; aurora: [string, string]; ring: string }> = {
  tiktok: { card: "from-[#06060a] via-[#101018] to-[#06060a]", aurora: ["rgba(254,44,85,0.34)", "rgba(37,244,238,0.26)"], ring: "conic-gradient(from 0deg, #25F4EE, #FE2C55, #ffffff, #25F4EE)" },
  instagram: { card: "from-[#3a0d5c] via-[#a1146a] to-[#f58529]", aurora: ["rgba(221,42,123,0.34)", "rgba(254,218,119,0.22)"], ring: "conic-gradient(from 0deg, #feda77, #f58529, #dd2a7b, #8134af, #feda77)" },
  youtube: { card: "from-[#2a0000] via-[#7a0a0a] to-[#150000]", aurora: ["rgba(255,0,0,0.32)", "rgba(255,120,80,0.18)"], ring: "conic-gradient(from 0deg, #ff0000, #ffffff, #ff5a3c, #ff0000)" },
  facebook: { card: "from-[#06265e] via-[#1259c9] to-[#0a1f4d]", aurora: ["rgba(24,119,242,0.36)", "rgba(120,180,255,0.2)"], ring: "conic-gradient(from 0deg, #1877f2, #9ccbff, #ffffff, #1877f2)" },
};

function Poster({ reel }: { reel: Reel }) {
  const reduce = useReducedMotion();
  const Icon = ICON[reel.platform];
  const t = THEME[reel.platform];
  return (
    <div className={`absolute inset-0 overflow-hidden bg-gradient-to-b ${t.card}`}>
      {reel.cover && <Image src={reel.cover} alt="" fill sizes="300px" unoptimized className="object-cover opacity-90" />}
      {reel.platform === "tiktok" && !reel.cover && (
        <>
          <div aria-hidden="true" className="absolute -left-10 top-1/4 h-52 w-52 rounded-full bg-[#25F4EE]/25 blur-3xl" />
          <div aria-hidden="true" className="absolute -right-12 bottom-1/4 h-52 w-52 rounded-full bg-[#FE2C55]/30 blur-3xl" />
        </>
      )}
      {!reel.cover && (
        <motion.div aria-hidden="true" animate={reduce ? undefined : { y: [0, -10, 0], rotate: [-4, 3, -4] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }} className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 opacity-[0.16] [&_svg]:h-44 [&_svg]:w-44">
          <Icon size={176} />
        </motion.div>
      )}
      <div aria-hidden="true" className="reel-scan pointer-events-none absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.28),transparent_35%,rgba(0,0,0,0.78))]" />
    </div>
  );
}

function ReelCard({
  reel,
  index,
  active,
  playing,
  onSelect,
  onPlay,
  register,
}: {
  reel: Reel;
  index: number;
  active: boolean;
  playing: boolean;
  onSelect: () => void;
  onPlay: () => void;
  register: (el: HTMLLIElement | null) => void;
}) {
  const reduce = useReducedMotion();
  const Icon = ICON[reel.platform];
  const t = THEME[reel.platform];
  const src = playing ? reelEmbedSrc(reel.platform, reel.url, true) : null;

  return (
    <li ref={register} data-reel-index={index} className="relative flex-none snap-center" style={{ width: "var(--reel-w)" }}>
      <div className="relative will-change-transform" data-card>
        {/* spinning light ring around the card in focus */}
        <div aria-hidden="true" className={`absolute -inset-[3px] overflow-hidden rounded-[2rem] transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`}>
          <div className="reel-ring absolute left-1/2 top-1/2 aspect-square w-[180%] -translate-x-1/2 -translate-y-1/2" style={{ background: t.ring }} />
        </div>
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.9rem] bg-black shadow-[0_30px_60px_-25px_rgba(0,0,0,0.9)] ring-1 ring-white/10">
          <Poster reel={reel} />

          {src && (
            <iframe
              src={src}
              title={reel.title || `${PLATFORM_LABEL[reel.platform]} reel`}
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; clipboard-write; fullscreen"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              className="absolute inset-0 h-full w-full border-0 bg-black"
            />
          )}

          {/* badge + title (fade out while the video plays) */}
          <div className={`pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between p-3.5 transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}>
            <span className="flex items-center gap-1.5 rounded-full bg-black/45 py-1 pl-1.5 pr-3 text-[11px] font-semibold text-white ring-1 ring-white/20 backdrop-blur">
              <Icon size={18} /> {PLATFORM_LABEL[reel.platform]}
            </span>
          </div>
          <div className={`pointer-events-none absolute inset-x-0 bottom-0 p-4 transition-opacity duration-500 ${playing ? "opacity-0" : "opacity-100"}`}>
            {reel.title && <p className="line-clamp-2 text-sm font-semibold leading-snug text-white">{reel.title}</p>}
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-white/55">Meteorite Real Estate</p>
          </div>

          {/* the click target: centre a side card, or start the video on the centred one */}
          {!playing && (
            <button
              type="button"
              onClick={active ? onPlay : onSelect}
              aria-label={active ? `Play: ${reel.title || PLATFORM_LABEL[reel.platform] + " reel"}` : `Show reel ${index + 1}`}
              className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            >
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/50 backdrop-blur-md transition-transform duration-300 group-hover:scale-110">
                {active && !reduce && <span aria-hidden="true" className="reel-pulse absolute inset-0 rounded-full ring-2 ring-white/60" />}
                <Play size={24} fill="currentColor" className="ml-0.5" />
              </span>
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

type Accounts = SocialAccounts & { instagram: string; facebook: string };

/**
 * The homepage reel wall: vertical videos from TikTok, Instagram, YouTube and
 * Facebook on a swipeable, 3-D "coverflow" strip. The card in the middle lights up,
 * tints the whole backdrop in its platform's colours, and — after a moment —
 * starts playing (muted) while the others stay as posters, so only one player is
 * ever loaded. Filter by platform, steer with the arrows, swipe, or use the keyboard.
 * Everything is managed in Admin > Reels.
 */
export default function ReelsSection({ reels, accounts }: { reels: Reel[]; accounts: Accounts }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.15 });
  const live = useInView(rootRef, { amount: 0.35 });
  const scroller = useRef<HTMLUListElement>(null);
  const items = useRef<(HTMLLIElement | null)[]>([]);
  const raf = useRef(0);
  const anim = useRef(0);
  const [filter, setFilter] = useState<ReelPlatform | "all">("all");
  const [active, setActive] = useState(0);
  const [playId, setPlayId] = useState<string | null>(null);

  const platforms = useMemo(() => [...new Set(reels.map((r) => r.platform))], [reels]);
  const list = useMemo(() => (filter === "all" ? reels : reels.filter((r) => r.platform === filter)), [reels, filter]);
  const current = list[Math.min(active, list.length - 1)];
  const glow = current ? THEME[current.platform].aurora : THEME.tiktok.aurora;

  const layout = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const cx = el.scrollLeft + el.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    items.current.forEach((li, i) => {
      if (!li) return;
      const card = li.firstElementChild as HTMLElement | null;
      const d = (li.offsetLeft + li.offsetWidth / 2 - cx) / li.offsetWidth; // 0 = centred, ±1 = one card away
      const a = Math.abs(d);
      if (a < bestDist) {
        bestDist = a;
        best = i;
      }
      if (card) {
        if (reduce) card.style.transform = "";
        else card.style.transform = `perspective(1100px) rotateY(${Math.max(-1, Math.min(1, d)) * -32}deg) translateZ(${-Math.min(a, 2) * 70}px) scale(${1 - Math.min(a, 2) * 0.09})`;
        card.style.opacity = String(1 - Math.min(a, 2.2) * 0.22);
      }
    });
    setActive((prev) => (prev === best ? prev : best));
  }, [reduce]);

  const onScroll = useCallback(() => {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      layout();
    });
  }, [layout]);

  const scrollToIndex = useCallback(
    (i: number, smooth = true) => {
      const el = scroller.current;
      const li = items.current[i];
      if (!el || !li) return;
      const target = li.offsetLeft + li.offsetWidth / 2 - el.clientWidth / 2;
      cancelAnimationFrame(anim.current);
      if (!smooth || reduce) {
        el.scrollLeft = target;
        return;
      }
      // Our own tween: native smooth scrolling is ignored or cut short by some browsers
      // (notably Safari) while scroll-snap is on, which made the arrows do nothing.
      const from = el.scrollLeft;
      const t0 = performance.now();
      el.style.scrollSnapType = "none";
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / 550);
        el.scrollLeft = from + (target - from) * (1 - Math.pow(1 - k, 3));
        if (k < 1) anim.current = requestAnimationFrame(tick);
        else el.style.scrollSnapType = "";
      };
      anim.current = requestAnimationFrame(tick);
    },
    [reduce]
  );

  useEffect(() => {
    layout();
    window.addEventListener("resize", layout);
    return () => {
      window.removeEventListener("resize", layout);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [layout, list]);

  // The card in the middle starts on its own after it has been there for a moment.
  // (`playing` is derived below, so moving away from a card stops it without any extra state.)
  useEffect(() => {
    const r = list[active];
    if (!r || reduce || !live || playId === r.id) return;
    const t = window.setTimeout(() => setPlayId(r.id), DWELL_MS);
    return () => window.clearTimeout(t);
  }, [active, list, reduce, live, playId]);

  // Changing the filter starts again from the first reel.
  const changeFilter = (p: ReelPlatform | "all") => {
    setFilter(p);
    setActive(0);
    setPlayId(null);
    requestAnimationFrame(() => {
      scrollToIndex(0, false);
      layout();
    });
  };

  if (reels.length === 0) return null;

  const step = (dir: 1 | -1) => scrollToIndex(Math.max(0, Math.min(list.length - 1, active + dir)));
  const follow = [
    { label: "TikTok", href: accounts.tiktok, Icon: TikTokIcon },
    { label: "Instagram", href: accounts.instagram, Icon: InstagramIcon },
    { label: "YouTube", href: accounts.youtube, Icon: YouTubeIcon },
    { label: "Facebook", href: accounts.facebook, Icon: FacebookIcon },
  ].filter((f) => f.href);

  return (
    <section
      ref={rootRef}
      aria-label="Reels"
      aria-roledescription="carousel"
      className="relative isolate overflow-hidden bg-[#07070b] py-20 text-white sm:py-28"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      {/* backdrop: two soft lights in the colours of the platform in focus */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <motion.div className="absolute -left-24 top-10 h-[34rem] w-[34rem] rounded-full blur-[110px]" animate={{ backgroundColor: glow[0] }} transition={{ duration: 1.2, ease: EASE }} />
        <motion.div className="absolute -right-24 bottom-0 h-[34rem] w-[34rem] rounded-full blur-[110px]" animate={{ backgroundColor: glow[1] }} transition={{ duration: 1.2, ease: EASE }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#07070b_80%)]" />
      </div>
      <div className="grain-overlay" />

      <motion.div initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, ease: EASE }} className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="flex items-center justify-center gap-2.5">
          <span className="h-px w-8 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Reels</span>
          <span className="h-px w-8 bg-brand-gold" />
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Meteorite in motion</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">Short films from our TikTok, Instagram, YouTube and Facebook — swipe through, and the one in the middle plays.</p>

        {platforms.length > 1 && (
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter reels by platform">
            {(["all", ...platforms] as const).map((p) => {
              const on = filter === p;
              const Icon = p === "all" ? null : ICON[p];
              return (
                <button key={p} type="button" onClick={() => changeFilter(p)} aria-pressed={on} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ring-1 transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold ${on ? "bg-white text-black ring-white" : "bg-white/5 text-white/70 ring-white/15 hover:bg-white/10 hover:text-white"}`}>
                  {Icon && <Icon size={16} />} {p === "all" ? "All" : PLATFORM_LABEL[p]}
                </button>
              );
            })}
          </div>
        )}
      </motion.div>

      <div className="relative mt-12">
        <ul
          ref={scroller}
          onScroll={onScroll}
          tabIndex={0}
          aria-live="polite"
          className="flex snap-x snap-mandatory items-center gap-5 overflow-x-auto overflow-y-hidden py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ ["--reel-w" as string]: "clamp(210px, 62vw, 290px)", paddingInline: "calc(50% - var(--reel-w) / 2)", perspective: "1400px" }}
        >
          <AnimatePresence initial={false} mode="popLayout">
            {list.map((r, i) => (
              <ReelCard
                key={r.id}
                reel={r}
                index={i}
                active={i === active}
                playing={playId === r.id && i === active && live}
                onSelect={() => scrollToIndex(i)}
                onPlay={() => setPlayId(r.id)}
                register={(el) => {
                  items.current[i] = el;
                }}
              />
            ))}
          </AnimatePresence>
        </ul>

        <div className="mx-auto mt-2 flex max-w-md items-center justify-center gap-5 px-4">
          <button type="button" onClick={() => step(-1)} disabled={active === 0} aria-label="Previous reel" className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-white ring-1 ring-white/20 backdrop-blur transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/[0.06] disabled:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
            <ArrowLeft size={20} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
          </button>
          <div className="flex items-center gap-1.5" aria-hidden="true">
            {list.slice(0, 14).map((r, i) => (
              <button key={r.id} type="button" tabIndex={-1} onClick={() => scrollToIndex(i)} className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-7 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"}`} />
            ))}
          </div>
          <button type="button" onClick={() => step(1)} disabled={active >= list.length - 1} aria-label="Next reel" className="group flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06] text-white ring-1 ring-white/20 backdrop-blur transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-30 disabled:hover:bg-white/[0.06] disabled:hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
            <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </button>
        </div>
      </div>

      {follow.length > 0 && (
        <div className="relative mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-3 px-4">
          <span className="w-full text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40 sm:w-auto">Follow us</span>
          {follow.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Meteorite Real Estate on ${label}`} className="group flex items-center gap-2 rounded-full bg-white/[0.06] py-1.5 pl-2 pr-4 text-sm font-medium text-white/85 ring-1 ring-white/15 transition-colors hover:bg-white hover:text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-gold">
              <Icon size={22} /> {label}
              <ArrowUpRight size={14} className="opacity-60 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
