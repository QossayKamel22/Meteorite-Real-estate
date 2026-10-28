import test from "node:test";
import assert from "node:assert/strict";
const R=new URL("../src/lib/", import.meta.url).href;
const { getInitials, getAvatarGradient } = await import(R+"reviews-ui.ts");
const { parseFeaturedProject, isHttpsUrl, MAX_FACTS, MAX_PROJECTS } = await import(R+"featured-project-shared.ts");
const { resilientFetch } = await import(R+"resilient-fetch.ts");
const { isGoogleUrl } = await import(R+"google-reviews-shared.ts");
const { countWords } = await import(R+"ceo-message-shared.ts");
const { publicImageSrc, isServedImage, shortHash, SAFE_DOC_ID } = await import(R+"image-url.ts");
const { getFilmEmbedUrl, getFilmVideo, driveIdsIn, parseProjectFilm, parseProjectFilms, MAX_FILMS } = await import(R+"project-film-shared.ts");
const { parseReelUrl, reelEmbedSrc, parseReelFields, parseSocialAccounts, autoCover } = await import(R+"reels-shared.ts");
const { normalizeCertificateImages, MAX_CERT_IMAGES } = await import(R+"certificate-images.ts");

test("initials: first + last name letters", () => {
  assert.equal(getInitials("Nitesh Sekhsaria"), "NS");
  assert.equal(getInitials("Mary Jane Watson"), "MW");      // first + LAST, not second
  assert.equal(getInitials("s Keshav"), "SK");
  assert.equal(getInitials("Auchuta N."), "AN");
  assert.equal(getInitials("Saif"), "S");
  assert.equal(getInitials("  ahmed   alsuwaidi  "), "AA");
  assert.equal(getInitials("محمد علي"), "مع");              // non-Latin
  assert.equal(getInitials("Élodie Ångström"), "ÉÅ");        // accents
  assert.equal(getInitials("\"Zed\" (VIP) Smith"), "ZS");    // leading punctuation ignored
  assert.equal(getInitials(""), "?");
  assert.equal(getInitials("   "), "?");
});
test("avatar gradient is stable per name and case-insensitive", () => {
  assert.equal(getAvatarGradient("Sally Yassin"), getAvatarGradient("  sally yassin "));
  assert.match(getAvatarGradient("Sally Yassin"), /^linear-gradient\(180deg, #[0-9A-F]{6} 0%, #[0-9A-F]{6} 100%\)$/i);
  const set = new Set(["A B","C D","E F","G H","I J","K L","M N","O P","Q R","S T"].map(getAvatarGradient));
  assert.ok(set.size >= 4, "names should spread across the palette");
});

const good = { visible:true, kicker:"Featured Project", name:"Forum II", location:"Majan, Dubai", description:"Calm.", facts:[{value:"77",label:"Curated homes"}], linkUrl:"https://www.forumresidences.com/", linkLabel:"Explore the project", image:"" };
test("featured: accepts a valid submission and normalises it", () => {
  const r = parseFeaturedProject({ ...good, name:"  Forum II  ", kicker:"", linkLabel:"", facts:[{value:" 77 ",label:" Homes "},{value:"",label:""}] });
  assert.equal(r.ok, true);
  assert.equal(r.value.name, "Forum II");
  assert.equal(r.value.kicker, "Featured Project");        // default
  assert.equal(r.value.linkLabel, "Explore the project");  // default
  assert.deepEqual(r.value.facts, [{value:"77",label:"Homes"}]); // blank row dropped
});
test("featured: rejects bad input", () => {
  const bad = (patch, re) => { const r = parseFeaturedProject({ ...good, ...patch }); assert.equal(r.ok, false, JSON.stringify(patch).slice(0,80)); if (re) assert.match(r.error, re); };
  assert.equal(parseFeaturedProject(null).ok, false);
  assert.equal(parseFeaturedProject("x").ok, false);
  bad({ visible: "yes" }, /Visibility/);
  bad({ name: "" }, /name is required/i);
  bad({ name: "x".repeat(81) }, /name is required/i);
  bad({ description: "x".repeat(601) }, /Description/);
  bad({ linkUrl: "http://insecure.com" }, /https/);
  bad({ linkUrl: "javascript:alert(1)" }, /https/);
  bad({ linkUrl: "https://localhost" }, /https/);             // no dot
  bad({ linkUrl: "" }, /https/);
  bad({ facts: Array.from({length: MAX_FACTS+1}, () => ({value:"1",label:"a"})) }, /up to 4/);
  bad({ facts: [{ value: "77", label: "" }] }, /both/);
  bad({ facts: "nope" }, /up to 4|facts/i);
  bad({ image: "data:text/html;base64,PHNjcmlwdD4=" }, /image/i);
  bad({ image: "data:image/svg+xml;base64,PHN2Zz4=" }, /image/i);   // SVG can carry scripts
  bad({ image: "http://x.com/a.jpg" }, /image/i);
  bad({ image: "data:image/jpeg;base64," + "A".repeat(700_001) }, /too large/i);
});
test("featured: image variants", () => {
  assert.equal(parseFeaturedProject({ ...good, image: "https://cdn.example.com/a.jpg" }).ok, true);
  assert.equal(parseFeaturedProject({ ...good, image: "data:image/jpeg;base64,/9j/4AAQ" }).ok, true);
  assert.equal(parseFeaturedProject({ ...good, image: "" }).value.image, "");
  assert.equal(MAX_PROJECTS, 12);
});
test("url helpers", () => {
  assert.equal(isHttpsUrl("https://a.co"), true); assert.equal(isHttpsUrl("ftp://a.co"), false);
  assert.equal(isGoogleUrl("https://www.google.com/maps/place/x"), true);
  assert.equal(isGoogleUrl("https://evilgoogle.com/x"), false);
  assert.equal(isGoogleUrl("https://google.com.evil.io/x"), false);
  assert.equal(isGoogleUrl("http://www.google.com/maps"), false);
  assert.equal(countWords("  one two\nthree  "), 3);
});

const mk = (statuses, log=[]) => { let i=0; return { log, fetchImpl: async (url, init) => { const s = statuses[Math.min(i++, statuses.length-1)]; log.push({ method: init.method ?? "GET", auth: init.headers.Authorization, hasSignal: !!init.signal }); if (s === "throw") throw new Error("network"); return new Response("{}", { status: s }); } }; };
const base = (extra={}) => { let tokens=0, invalidated=0; return { o:{ getToken: async()=>`tok${++tokens+invalidated}`, invalidateToken:()=>{invalidated++}, timeoutMs:50, sleepImpl: async()=>{}, ...extra }, stats:()=>({tokens,invalidated}) }; };
test("resilientFetch: GET retries once on 503 then succeeds", async () => {
  const m = mk([503,200]); const b = base({ fetchImpl:m.fetchImpl });
  const r = await resilientFetch("https://x", undefined, b.o); assert.equal(r.status,200); assert.equal(m.log.length,2); assert.ok(m.log.every(l=>l.hasSignal));
});
test("resilientFetch: GET gives up after ONE retry (no loop)", async () => {
  const m = mk([503,503,503]); const r = await resilientFetch("https://x", undefined, base({ fetchImpl:m.fetchImpl }).o);
  assert.equal(r.status,503); assert.equal(m.log.length,2);
});
test("resilientFetch: GET retries once on network error, then throws", async () => {
  const m = mk(["throw","throw"]);
  await assert.rejects(resilientFetch("https://x", undefined, base({ fetchImpl:m.fetchImpl }).o), /network/); assert.equal(m.log.length,2);
  const m2 = mk(["throw",200]); assert.equal((await resilientFetch("https://x", undefined, base({ fetchImpl:m2.fetchImpl }).o)).status,200);
});
test("resilientFetch: writes are NOT retried on 5xx or network errors", async () => {
  const m = mk([503,200]); const r = await resilientFetch("https://x", { method:"POST", body:"{}" }, base({ fetchImpl:m.fetchImpl }).o);
  assert.equal(r.status,503); assert.equal(m.log.length,1);
  const m2 = mk(["throw",200]); await assert.rejects(resilientFetch("https://x", { method:"PATCH" }, base({ fetchImpl:m2.fetchImpl }).o)); assert.equal(m2.log.length,1);
});
test("resilientFetch: 4xx (not 401) is returned immediately, never retried", async () => {
  for (const s of [400,403,404,409]) { const m = mk([s,200]); const r = await resilientFetch("https://x", undefined, base({ fetchImpl:m.fetchImpl }).o); assert.equal(r.status,s); assert.equal(m.log.length,1); }
});
test("resilientFetch: 401 refreshes the token once (even for writes), then succeeds", async () => {
  const m = mk([401,200]); const b = base({ fetchImpl:m.fetchImpl });
  const r = await resilientFetch("https://x", { method:"POST" }, b.o);
  assert.equal(r.status,200); assert.equal(b.stats().invalidated,1); assert.notEqual(m.log[0].auth, m.log[1].auth);
  const m2 = mk([401,401,200]); const r2 = await resilientFetch("https://x", undefined, base({ fetchImpl:m2.fetchImpl }).o);
  assert.equal(r2.status,401); assert.equal(m2.log.length,2);   // only ONE refresh attempt
});
test("resilientFetch: a stalled request is aborted by the timeout", async () => {
  const hang = async (_u, init) => new Promise((_, rej) => init.signal.addEventListener("abort", () => rej(init.signal.reason)));
  const t0 = Date.now();
  await assert.rejects(resilientFetch("https://x", { method:"POST" }, { ...base().o, fetchImpl: hang, timeoutMs: 40 }));
  assert.ok(Date.now()-t0 < 1000, "must fail fast, not hang");
});

test("publicImageSrc: data URLs become cacheable URLs, everything else is untouched", () => {
  const data = "data:image/jpeg;base64," + "A".repeat(5000);
  const u = publicImageSrc("agent", "abc123XYZ", data);
  assert.match(u, /^\/api\/img\/agent\/abc123XYZ\?v=[0-9a-z]+$/);
  assert.ok(u.length < 60, "the URL must be tiny compared with the inline image");
  assert.equal(publicImageSrc("agent", "abc123XYZ", data), u, "stable for the same image");
  assert.notEqual(publicImageSrc("agent", "abc123XYZ", data + "B"), u, "changes when the image changes");
  assert.equal(publicImageSrc("agent", "abc", "/brand/agent-x.png"), "/brand/agent-x.png");
  assert.equal(publicImageSrc("agent", "abc", "https://cdn.example.com/a.jpg"), "https://cdn.example.com/a.jpg");
  assert.equal(publicImageSrc("agent", "abc", ""), "");
  assert.equal(publicImageSrc("agent", "abc", undefined), "");
  assert.equal(publicImageSrc("agent", "../etc/passwd", data), data, "an unsafe id is never put in a URL path");
  assert.equal(publicImageSrc("media", "id1", data).startsWith("/api/img/media/id1?v="), true);
  assert.equal(publicImageSrc("featured", "p1", data).startsWith("/api/img/featured/p1?v="), true);
});
test("image id / served-image helpers", () => {
  assert.ok(SAFE_DOC_ID.test("aB3-_xyz9") && !SAFE_DOC_ID.test("a/b") && !SAFE_DOC_ID.test("") && !SAFE_DOC_ID.test("a".repeat(65)) && !SAFE_DOC_ID.test("a b"));
  assert.equal(isServedImage("/api/img/agent/x?v=1"), true);
  assert.equal(isServedImage("/brand/logo.png"), false);
  assert.equal(isServedImage("https://x.com/a.jpg"), false);
  assert.notEqual(shortHash("a"), shortHash("b"));
});

const jpg = (n) => "data:image/jpeg;base64," + "A".repeat(n);
test("certificate images: list, legacy single field, order and defaults", () => {
  const a = jpg(100), b = jpg(200);
  assert.deepEqual(normalizeCertificateImages({ images: [a, b] }).images, [a, b], "order is preserved (first = newest)");
  assert.deepEqual(normalizeCertificateImages({ image: a }).images, [a], "legacy single image still accepted");
  assert.deepEqual(normalizeCertificateImages({ images: [" " + a + " ", "", b] }).images, [a, b], "trims and drops blank rows");
  assert.deepEqual(normalizeCertificateImages({ images: ["/brand/certificate-rera.jpg", "https://cdn.example.com/c.png"] }).images.length, 2);
  assert.equal(normalizeCertificateImages({ images: [a], image: "ignored" }).images[0], a, "images wins over image");
});
test("certificate images: rejects bad input", () => {
  const bad = (body, re) => { const r = normalizeCertificateImages(body); assert.equal(r.ok, false, JSON.stringify(body).slice(0,60)); if (re) assert.match(r.error, re); };
  bad({}, /At least one/);
  bad({ images: [] }, /At least one/);
  bad({ images: ["", "  "] }, /At least one/);
  bad({ images: "nope" }, /At least one|image/i);
  bad({ images: [123] }, /file or a link/);
  bad({ images: ["http://insecure.com/a.jpg"] }, /https/);
  bad({ images: ["javascript:alert(1)"] }, /https/);
  bad({ images: ["data:image/svg+xml;base64,PHN2Zz4="] }, /https/);        // SVG can carry scripts
  bad({ images: ["data:text/html;base64,PGI+"] }, /https/);
  bad({ images: ["/brand/../secret.png"] }, /https/);
  bad({ images: ["//evil.com/a.png"] }, /https/);
  bad({ images: ["/etc/passwd"] }, /https/);
  bad({ images: [jpg(600_001)] }, /too large/);
  bad({ images: Array.from({ length: MAX_CERT_IMAGES + 1 }, () => jpg(10)) }, /up to 8/);
  bad({ images: Array.from({ length: 4 }, () => jpg(250_000)) }, /together are too large/);
});
test("publicImageSrc: per-image index for certificates", () => {
  const data = "data:image/jpeg;base64," + "A".repeat(500), other = "data:image/jpeg;base64," + "B".repeat(500);
  const u0 = publicImageSrc("certificate", "cert1", data, 0), u1 = publicImageSrc("certificate", "cert1", other, 1);
  assert.match(u0, /^\/api\/img\/certificate\/cert1\?v=[0-9a-z]+$/, "image 0 keeps the plain URL");
  assert.match(u1, /^\/api\/img\/certificate\/cert1\?i=1&v=[0-9a-z]+$/);
  assert.notEqual(u0, publicImageSrc("certificate", "cert1", data, 1), "different index => different URL (separate cache entries)");
  assert.equal(publicImageSrc("certificate", "cert1", "/brand/certificate-rera.jpg", 1), "/brand/certificate-rera.jpg");
});

test("project film: embed URLs from Drive / YouTube / Vimeo, nothing else", () => {
  const id = "1_UB02c8k3oEn1kLGZnij_PPy0GSepuSD";
  const drive = `https://drive.google.com/file/d/${id}/preview`;
  assert.equal(getFilmEmbedUrl(`https://drive.google.com/file/d/${id}/view?usp=sharing`), drive);
  assert.equal(getFilmEmbedUrl(`https://drive.google.com/open?id=${id}`), drive);
  assert.equal(getFilmEmbedUrl(`https://drive.google.com/uc?id=${id}&export=download`), drive);
  assert.equal(getFilmEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(getFilmEmbedUrl("https://youtu.be/dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(getFilmEmbedUrl("https://vimeo.com/123456789"), "https://player.vimeo.com/video/123456789");
  for (const bad of ["", "not a url", "http://drive.google.com/file/d/" + id + "/view", "https://drive.google.com/drive/folders/" + id,
    "https://drive.google.com/file/d/short/view", "https://evil.com/file/d/" + id + "/view", "https://drive.google.com.evil.io/file/d/" + id,
    "javascript:alert(1)", "https://youtube.com/watch?v=<script>", "https://vimeo.com/abc"]) assert.equal(getFilmEmbedUrl(bad), null, bad);
});
test("project film: validation and normalisation", () => {
  const good = { id: "binghatti-city", visible: true, kicker: "", title: " Binghatti City ", location: "Dubai", description: "d", facts: [{ value: "12", label: "Towers" }, { value: "", label: "" }], videoUrl: "https://drive.google.com/file/d/1_UB02c8k3oEn1kLGZnij_PPy0GSepuSD/view", poster: "/brand/binghatti/night-skyline.jpg", images: [{ src: "/brand/binghatti/pool-aerial.jpg", alt: " Pool ", ratio: 1.39349 }] };
  const r = parseProjectFilm(good); assert.equal(r.ok, true); assert.equal(r.value.title, "Binghatti City"); assert.equal(r.value.kicker, "Project Film"); assert.equal(r.value.facts.length, 1);
  assert.equal(r.value.images[0].alt, "Pool"); assert.equal(r.value.images[0].ratio, 1.393);
  const bad = (patch, re) => { const x = parseProjectFilm({ ...good, ...patch }); assert.equal(x.ok, false, JSON.stringify(patch).slice(0, 80)); assert.match(x.error, re); };
  bad({ title: "" }, /Title/); bad({ visible: 1 }, /Visibility/); bad({ videoUrl: "https://example.com/page.html" }, /Drive/);
  bad({ description: "x".repeat(701) }, /Description/); bad({ facts: [{ value: "1", label: "" }] }, /both/);
  bad({ facts: Array.from({ length: 5 }, () => ({ value: "1", label: "a" })) }, /up to 4/);
  bad({ id: "bad id!" }, /id/); bad({ id: "../x" }, /id/);
  bad({ poster: "javascript:alert(1)" }, /poster/); bad({ poster: "/etc/passwd" }, /poster/); bad({ poster: "/brand/../secret.png" }, /poster/);
  bad({ images: [{ src: "http://insecure.com/a.jpg", alt: "", ratio: 1 }] }, /gallery/); bad({ images: [{ src: "/brand/a.jpg", alt: "", ratio: 0 }] }, /gallery/); bad({ images: [{ src: "/brand/a.jpg", alt: "", ratio: 99 }] }, /gallery/);
  bad({ images: Array.from({ length: 17 }, () => ({ src: "/brand/a.jpg", alt: "", ratio: 1 })) }, /up to 16/);
  assert.equal(parseProjectFilm(null).ok, false);
  assert.equal(parseProjectFilm({ ...good, poster: "", images: [] }).ok, true, "poster and images are optional");
});
test("project films: list rules", () => {
  const f = (id) => ({ id, visible: true, kicker: "", title: "T " + id, location: "", description: "", facts: [], videoUrl: "https://youtu.be/dQw4w9WgXcQ", poster: "", images: [] });
  assert.equal(parseProjectFilms({ films: [f("a"), f("b")] }).value.films.length, 2);
  assert.equal(parseProjectFilms({ films: [] }).ok, true, "an empty list (everything deleted) is allowed");
  assert.equal(parseProjectFilms({ films: [f("a"), f("a")] }).ok, false, "duplicate ids");
  assert.equal(parseProjectFilms({ films: Array.from({ length: MAX_FILMS + 1 }, (_, i) => f("x" + i)) }).ok, false);
  assert.equal(parseProjectFilms({ nope: 1 }).ok, false); assert.equal(parseProjectFilms(null).ok, false);
  const r = parseProjectFilms({ films: [f("a"), { ...f("b"), title: "" }] }); assert.equal(r.ok, false); assert.match(r.error, /^Project 2:/);
  const cfg = parseProjectFilms({ heading: " Big ", intro: "x", films: [f("a")] }); assert.equal(cfg.value.heading, "Big"); assert.equal(cfg.value.films.length, 1);
  assert.equal(parseProjectFilms({ heading: "x".repeat(81), films: [] }).ok, false); assert.equal(parseProjectFilms({ intro: "x".repeat(301), films: [] }).ok, false);
});

test("project film: ONLY the name is required; everything else is optional", () => {
  const r = parseProjectFilm({ id: "x1", title: "Just a name" });
  assert.equal(r.ok, true);
  assert.deepEqual({ ...r.value, id: undefined }, { id: undefined, visible: true, shape: "landscape", kicker: "Project Film", title: "Just a name", location: "", description: "", facts: [], videoUrl: "", poster: "", images: [] });
  assert.equal(parseProjectFilm({ id: "x1", title: "T", shape: "portrait" }).value.shape, "portrait");
  assert.equal(parseProjectFilm({ id: "x1", title: "T", shape: "weird" }).value.shape, "landscape");
  assert.equal(parseProjectFilm({ id: "x1", title: "T", poster: "/api/img/film/AbC123xyz" }).ok, true, "an uploaded film image is a valid poster");
  assert.equal(parseProjectFilm({ id: "x1", title: "T", poster: "/api/img/agent/AbC123xyz" }).ok, false, "other image routes are not");
});
test("project film: how each kind of link is played", () => {
  const id = "1_UB02c8k3oEn1kLGZnij_PPy0GSepuSD";
  const d = getFilmVideo(`https://drive.google.com/file/d/${id}/view?usp=sharing`);
  assert.equal(d.kind, "file"); assert.equal(d.src, `/api/film/drive/${id}`); assert.equal(d.fallback, `https://drive.google.com/file/d/${id}/preview`);
  assert.equal(getFilmVideo("/brand/binghatti/mercedes-city.mp4").src, "/api/film/file/binghatti/mercedes-city.mp4");
  assert.equal(getFilmVideo("https://cdn.example.com/clips/a.mp4?x=1").kind, "file");
  const y = getFilmVideo("https://youtu.be/dQw4w9WgXcQ"); assert.equal(y.kind, "embed"); assert.match(y.src, /autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ&controls=0/);
  assert.match(getFilmVideo("https://vimeo.com/123456789").src, /player\.vimeo\.com\/video\/123456789\?autoplay=1&muted=1&loop=1/);
  for (const bad of ["", "javascript:alert(1)", "/brand/../x.mp4", "//evil.com/a.mp4", "/etc/passwd.mp4", "http://cdn.example.com/a.mp4", "https://example.com/page", "https://drive.google.com/drive/folders/" + id, "https://drive.google.com.evil.io/file/d/" + id])
    assert.equal(getFilmVideo(bad), null, bad);
});

test("driveIdsIn finds every Drive file id in saved data", () => {
  const txt = JSON.stringify({ a: "https://drive.google.com/file/d/12E_FyDnZ1duO1P4tsq-yxm9rZA0n6YMy/view?usp=sharing", b: "https://drive.google.com/open?id=1_UB02c8k3oEn1kLGZnij_PPy0GSepuSD", c: "https://youtu.be/dQw4w9WgXcQ", d: "https://drive.google.com/drive/folders/AAAAAAAAAAAAAAAAAA" });
  assert.deepEqual(driveIdsIn(txt).sort(), ["12E_FyDnZ1duO1P4tsq-yxm9rZA0n6YMy", "1_UB02c8k3oEn1kLGZnij_PPy0GSepuSD"]);
  assert.deepEqual(driveIdsIn(""), []);
});

test("reels: every platform's links are recognised and normalised", () => {
  const tt = parseReelUrl("https://www.tiktok.com/@meteorite.real.es/video/7701700031061003541?is_from_webapp=1&sender_device=pc");
  assert.deepEqual(tt, { ok: true, platform: "tiktok", id: "7701700031061003541", url: "https://www.tiktok.com/@meteorite.real.es/video/7701700031061003541" });
  assert.equal(parseReelUrl("https://m.tiktok.com/@a.b_c/video/7701007988298992917/").id, "7701007988298992917");
  assert.equal(parseReelUrl("https://vm.tiktok.com/ZMabc123/").resolve, true);
  assert.equal(parseReelUrl("https://www.tiktok.com/t/ZTabc123/").resolve, true);
  assert.equal(parseReelUrl("https://www.tiktok.com/@meteorite.real.es").ok, false, "a profile page is not a video");
  assert.equal(parseReelUrl("https://www.youtube.com/shorts/dQw4w9WgXcQ").platform, "youtube");
  assert.equal(parseReelUrl("https://youtu.be/dQw4w9WgXcQ?si=x").id, "dQw4w9WgXcQ");
  assert.equal(parseReelUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=5").id, "dQw4w9WgXcQ");
  assert.deepEqual(parseReelUrl("https://www.instagram.com/reel/C8abcDEF12/?igsh=xyz"), { ok: true, platform: "instagram", id: "reel/C8abcDEF12", url: "https://www.instagram.com/reel/C8abcDEF12/" });
  assert.equal(parseReelUrl("https://www.instagram.com/reels/C8abcDEF12/").id, "reel/C8abcDEF12");
  assert.equal(parseReelUrl("https://www.instagram.com/meteorite.real.estate.dubai/reel/C8abcDEF12/").id, "reel/C8abcDEF12");
  assert.equal(parseReelUrl("https://www.instagram.com/p/C8abcDEF12/").id, "p/C8abcDEF12");
  assert.equal(parseReelUrl("https://www.facebook.com/reel/1234567890123").platform, "facebook");
  assert.equal(parseReelUrl("https://www.facebook.com/watch/?v=1234567890123").id, "1234567890123");
  assert.equal(parseReelUrl("https://www.facebook.com/MeteoriteRE/videos/1234567890123/").id, "1234567890123");
  assert.equal(parseReelUrl("https://fb.watch/abc123/").resolve, true);
  for (const bad of ["", "nope", "http://www.tiktok.com/@a/video/7701700031061003541", "https://evil.com/@a/video/7701700031061003541", "https://tiktok.com.evil.io/@a/video/7701700031061003541", "https://www.youtube.com/channel/UCabc", "https://www.instagram.com/meteorite/", "javascript:alert(1)", "https://www.facebook.com/MeteoriteRE"])
    assert.equal(parseReelUrl(bad).ok, false, bad);
});
test("reels: player addresses are derived from the link and only for the right platform", () => {
  const u = "https://www.tiktok.com/@meteorite.real.es/video/7701700031061003541";
  assert.match(reelEmbedSrc("tiktok", u, true), /^https:\/\/www\.tiktok\.com\/player\/v1\/7701700031061003541\?.*autoplay=1&muted=1&loop=1/);
  assert.match(reelEmbedSrc("tiktok", u, false), /autoplay=0/);
  assert.equal(reelEmbedSrc("youtube", u, true), null, "a TikTok link is not a YouTube reel");
  assert.match(reelEmbedSrc("youtube", "https://youtu.be/dQw4w9WgXcQ", true), /^https:\/\/www\.youtube-nocookie\.com\/embed\/dQw4w9WgXcQ\?autoplay=1&mute=1&loop=1&playlist=dQw4w9WgXcQ/);
  assert.equal(reelEmbedSrc("instagram", "https://www.instagram.com/reel/C8abcDEF12/", true), "https://www.instagram.com/reel/C8abcDEF12/embed/");
  assert.match(reelEmbedSrc("facebook", "https://www.facebook.com/reel/1234567890123", true), /plugins\/video\.php\?href=https%3A%2F%2Fwww\.facebook\.com%2Freel%2F1234567890123&show_text=false&autoplay=true/);
  assert.equal(reelEmbedSrc("tiktok", "https://evil.com/x", true), null);
  assert.equal(autoCover("youtube", "https://youtu.be/dQw4w9WgXcQ"), "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg");
  assert.equal(autoCover("tiktok", u), "");
});
test("reels: admin input needs only a working link", () => {
  const ok = parseReelFields({ url: "https://www.tiktok.com/@meteorite.real.es/video/7701700031061003541?x=1" });
  assert.equal(ok.ok, true); assert.equal(ok.value.title, ""); assert.equal(ok.value.visible, true); assert.equal(ok.value.cover, ""); assert.equal(ok.value.platform, "tiktok");
  assert.equal(parseReelFields({ url: "https://youtu.be/dQw4w9WgXcQ", title: "  Hello   world ", cover: "/api/img/film/AbC123", visible: false }).value.title, "Hello world");
  const bad = (b, re) => { const r = parseReelFields(b); assert.equal(r.ok, false); assert.match(r.error, re); };
  bad(null, /Invalid/); bad({}, /Paste the link/); bad({ url: "https://example.com/v" }, /isn't a TikTok/); bad({ url: "https://vm.tiktok.com/ZMabc123/" }, /short link/);
  bad({ url: "https://youtu.be/dQw4w9WgXcQ", title: "x".repeat(101) }, /100 characters/); bad({ url: "https://youtu.be/dQw4w9WgXcQ", cover: "/etc/passwd" }, /cover/); bad({ url: "https://youtu.be/dQw4w9WgXcQ", cover: "http://x.com/a.jpg" }, /cover/); bad({ url: "https://youtu.be/dQw4w9WgXcQ", visible: "no" }, /Visibility/);
});
test("social accounts: only real TikTok / YouTube pages, empty hides the link", () => {
  assert.deepEqual(parseSocialAccounts({ tiktok: "https://www.tiktok.com/@meteorite.real.es", youtube: "" }).value, { tiktok: "https://www.tiktok.com/@meteorite.real.es", youtube: "" });
  assert.equal(parseSocialAccounts({ tiktok: "", youtube: "https://www.youtube.com/@meteorite" }).ok, true);
  assert.equal(parseSocialAccounts({}).ok, true);
  for (const b of [{ tiktok: "https://evil.com/@a" }, { tiktok: "http://tiktok.com/@a" }, { youtube: "https://tiktok.com/@a" }, { tiktok: "javascript:alert(1)" }, { tiktok: "https://tiktok.com.evil.io/@a" }]) assert.equal(parseSocialAccounts(b).ok, false, JSON.stringify(b));
});
