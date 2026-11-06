// Post-deploy smoke test: does the live site still do the basics? Run by hand with `npm run smoke`, and
// automatically after `npm run deploy`. Read-only: it never submits a form or writes anything.
//   SMOKE_URL=https://example.com npm run smoke      (default: https://meteoriterealestate.com)
const BASE = (process.env.SMOKE_URL || "https://meteoriterealestate.com").replace(/\/$/, "");
const UA = "Mozilla/5.0 (smoke-test)";

const results = [];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(path, init = {}) {
  const t0 = Date.now();
  const res = await fetch(BASE + path, { redirect: "manual", headers: { "User-Agent": UA }, ...init });
  const text = init.method === "POST" || init.method === "PATCH" ? await res.text() : await res.text();
  return { res, text, ms: Date.now() - t0 };
}
async function check(name, fn) {
  // The network and the freshly deployed Worker can both be briefly slow: try a few times before failing.
  let last;
  for (let i = 0; i < 4; i++) {
    try {
      const msg = await fn();
      results.push({ name, ok: true, msg });
      return;
    } catch (e) {
      last = e;
      await sleep(2500);
    }
  }
  results.push({ name, ok: false, msg: last instanceof Error ? last.message : String(last) });
}
const expect = (cond, msg) => {
  if (!cond) throw new Error(msg);
};

const PAGES = [
  ["/", ["Meteorite", "Browse properties for sale"]],
  ["/about-us", ["Registration Details", "Our certificates"]],
  ["/for-sale", ["Properties for sale", "Search by area"]],
  ["/for-rent", ["Properties for rent", "Search by area"]],
  ["/media", ["News, updates"]],
  ["/contact-us", ["hear from you", "Send message"]],
  ["/privacy-policy", ["Privacy"]],
  ["/login", ["Sign in"]],
];
for (const [path, words] of PAGES) {
  await check(`page ${path}`, async () => {
    const { res, text, ms } = await get(path);
    expect(res.status === 200, `status ${res.status}`);
    for (const w of words) expect(text.includes(w), `missing text "${w}"`);
    expect(!text.includes("Something went wrong"), "shows the error screen");
    expect(ms < 4000, `slow (${ms} ms)`);
    return `${ms} ms`;
  });
}

await check("headers: security + caching", async () => {
  const { res } = await get("/");
  const csp = res.headers.get("content-security-policy") || "";
  expect(csp.includes("frame-ancestors 'none'"), "CSP missing frame-ancestors");
  expect(res.headers.get("x-content-type-options") === "nosniff", "nosniff missing");
  expect((res.headers.get("strict-transport-security") || "").includes("max-age"), "HSTS missing");
  return "ok";
});

await check("static assets are cached for good", async () => {
  const { text } = await get("/");
  const css = text.match(/\/_next\/static\/css\/[^"]+\.css/)?.[0];
  expect(css, "no stylesheet link found");
  const { res } = await get(css);
  expect((res.headers.get("cache-control") || "").includes("immutable"), "stylesheet not immutable");
  return css.split("/").pop();
});

await check("a listing page opens", async () => {
  const { text } = await get("/for-sale");
  const href = text.match(/\/property\/[A-Za-z0-9_-]+/)?.[0];
  expect(href, "no listing link on For Sale");
  const { res, text: page } = await get(href);
  expect(res.status === 200, `listing status ${res.status}`);
  expect(page.includes("Book a viewing"), "viewing form missing");
  return href;
});

await check("unknown listing is a 404", async () => {
  const { res } = await get("/property/does-not-exist");
  expect(res.status === 404, `status ${res.status}`);
  return "404";
});

await check("sitemap and robots", async () => {
  const s = await get("/sitemap.xml");
  const r = await get("/robots.txt");
  expect(s.res.status === 200 && s.text.includes("/for-sale"), "sitemap problem");
  expect(r.res.status === 200, "robots problem");
  return "ok";
});

await check("admin is protected", async () => {
  const { res } = await get("/admin");
  expect(res.status === 307 || res.status === 302, `status ${res.status}`);
  expect((res.headers.get("location") || "").includes("/login"), "does not go to login");
  const api = await get("/api/admin/messages/abc", { method: "PATCH", headers: { "User-Agent": UA, "Content-Type": "application/json" }, body: "{}" });
  expect(api.res.status === 401, `admin API open (${api.res.status})`);
  const bk = await get("/api/admin/backup?collection=messages");
  expect(bk.res.status === 401, `backup API open (${bk.res.status})`);
  return "ok";
});

await check("contact API validates (nothing is stored)", async () => {
  const bad = await get("/api/contact", { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/json" }, body: JSON.stringify({ name: "x", email: "nope", message: "hello there" }) });
  expect(bad.res.status === 400, `bad input status ${bad.res.status}`);
  const bot = await get("/api/contact", { method: "POST", headers: { "User-Agent": UA, "Content-Type": "application/json" }, body: JSON.stringify({ name: "bot", email: "a@b.co", message: "hello there", website: "spam" }) });
  expect(bot.res.status === 200 && bot.text.includes("ok"), "honeypot not silent");
  return "ok";
});

await check("visit beacon ignores crawlers", async () => {
  const r = await get("/api/track-visit", { method: "POST", headers: { "User-Agent": "Googlebot", "Content-Type": "application/json" }, body: JSON.stringify({ path: "/" }) });
  expect(r.res.status === 200, `status ${r.res.status}`);
  return "ok";
});

await check("saved-list API needs sign-in", async () => {
  const r = await get("/api/favorites");
  expect(r.res.status === 401, `status ${r.res.status}`);
  return "ok";
});

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? "  ok " : "FAIL "} ${r.name}${r.msg ? `  — ${r.msg}` : ""}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed on ${BASE}`);
process.exit(failed ? 1 : 0);
