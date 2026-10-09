import test from "node:test";
import assert from "node:assert/strict";
const R=new URL("../src/lib/", import.meta.url).href;
const { getInitials, getAvatarGradient } = await import(R+"reviews-ui.ts");
const { parseFeaturedProject, featuredImageSrc, isHttpsUrl, MAX_FACTS } = await import(R+"featured-project-shared.ts");
const { resilientFetch } = await import(R+"resilient-fetch.ts");
const { isGoogleUrl } = await import(R+"google-reviews-shared.ts");
const { countWords } = await import(R+"ceo-message-shared.ts");
const { publicImageSrc, isServedImage, shortHash, SAFE_DOC_ID } = await import(R+"image-url.ts");

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
  assert.equal(featuredImageSrc({ image:"", imageVersion:3 }), null);
  assert.equal(featuredImageSrc({ image:"https://a.b/c.jpg", imageVersion:3 }), "https://a.b/c.jpg");
  assert.equal(featuredImageSrc({ image:"data:image/png;base64,AAAA", imageVersion:3 }), "/api/featured-project/image?v=3");
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
});
test("image id / served-image helpers", () => {
  assert.ok(SAFE_DOC_ID.test("aB3-_xyz9") && !SAFE_DOC_ID.test("a/b") && !SAFE_DOC_ID.test("") && !SAFE_DOC_ID.test("a".repeat(65)) && !SAFE_DOC_ID.test("a b"));
  assert.equal(isServedImage("/api/img/agent/x?v=1"), true);
  assert.equal(isServedImage("/api/featured-project/image?v=2"), true);
  assert.equal(isServedImage("/brand/logo.png"), false);
  assert.equal(isServedImage("https://x.com/a.jpg"), false);
  assert.notEqual(shortHash("a"), shortHash("b"));
});
