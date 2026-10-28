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

/** Every reel shares the brand look (navy and gold); the platform only shows in the small badge. */
function Poster({ reel }: { reel: Reel }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-b from-brand-navy-light via-brand-navy to-[#080a22]">
      {reel.cover && <Image src={reel.cover} alt="" fill sizes="300px" unoptimized className="object-cover" />}
      {!reel.cover && (
        <div aria-hidden="true" className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 opacity-20 [&_svg]:h-28 [&_svg]:w-28">
          <Image src="/brand/logo-transparent.png" alt="" width={149} height={27} className="h-auto w-44 brightness-125" />
        </div>
      )}
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.25),transparent_35%,rgba(5,6,20,0.85))]" />
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
  // Instagram won't play a reel inside another site, so its card opens the reel on Instagram instead.
  const external = reel.platform === "instagram";
  const src = playing && !external ? reelEmbedSrc(reel.platform, reel.url, true) : null;

  return (
    <li ref={register} data-reel-index={index} className="relative flex-none snap-center" style={{ width: "var(--reel-w)" }}>
      <div className="relative will-change-transform" data-card>
        {/* thin gold outline around the card in focus */}
        <div aria-hidden="true" className={`absolute -inset-[2px] rounded-[2rem] ring-2 ring-brand-gold/80 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0"}`} />
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
            <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.16em] text-brand-gold/80">Meteorite Real Estate</p>
          </div>

          {/* the click target: centre a side card, or start the video on the centred one */}
          {!playing && (external && active ? (
            <a
              href={reel.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Watch on Instagram: ${reel.title || "reel"}`}
              className="group absolute inset-0 flex flex-col items-center justify-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/90 text-brand-navy ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-110">
                <Play size={24} fill="currentColor" className="ml-0.5" />
              </span>
              <span className="rounded-full bg-black/55 px-3.5 py-1.5 text-xs font-semibold text-white ring-1 ring-white/25 backdrop-blur">Watch on Instagram</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={active ? onPlay : onSelect}
              aria-label={active ? `Play: ${reel.title || PLATFORM_LABEL[reel.platform] + " reel"}` : `Show reel ${index + 1}`}
              className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"
            >
              <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-brand-gold/90 !text-brand-navy ring-1 ring-white/40 transition-transform duration-300 group-hover:scale-110">
                {active && !reduce && <span aria-hidden="true" className="reel-pulse absolute inset-0 rounded-full ring-2 ring-brand-gold/70" />}
                <Play size={24} fill="currentColor" className="ml-0.5" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </li>
  );
}

type Accounts = SocialAccounts & { instagram: string; facebook: string };

/**
 * The homepage reel wall: vertical videos from TikTok, Instagram, YouTube and
 * Facebook on a swipeable, 3-D "coverflow" strip. The card in the middle lights up and, after a moment,
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
    if (!r || r.platform === "instagram" || reduce || !live || playId === r.id) return;
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
      className="relative isolate overflow-hidden bg-brand-navy py-20 text-white sm:py-28"
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") step(1);
        if (e.key === "ArrowLeft") step(-1);
      }}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent" />

      <motion.div initial={{ opacity: 0, y: reduce ? 0 : 24 }} animate={inView ? { opacity: 1, y: 0 } : undefined} transition={{ duration: 0.9, ease: EASE }} className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div className="flex items-center justify-center gap-2.5">
          <span className="h-px w-8 bg-brand-gold" />
          <span className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-gold">Our listings on video</span>
          <span className="h-px w-8 bg-brand-gold" />
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Step inside our apartments</h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/60">This is how we market what we sell and rent: real walk-throughs of our apartments, shot by our team. Swipe through and watch the one in the middle — then get in touch to book a viewing.</p>

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
          <span className="w-full text-center text-xs font-semibold uppercase tracking-[0.2em] text-white/40 sm:w-auto">See more of our apartments</span>
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
