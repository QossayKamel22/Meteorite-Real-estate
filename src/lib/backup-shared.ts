// What the admin backup exports. Accounts (users) and saved lists are left out on purpose: they hold personal data and the
// sign-in provider keeps its own copy. Images are included (they live in Firestore), so those pages are small.
export const BACKUP_COLLECTIONS = [
  { name: "messages", label: "Messages", pageSize: 100 },
  { name: "properties", label: "Properties", pageSize: 20 },
  { name: "agents", label: "Team", pageSize: 20 },
  { name: "mediaPosts", label: "Media posts", pageSize: 10 },
  { name: "reels", label: "Reels", pageSize: 50 },
  { name: "certificates", label: "Certificates", pageSize: 5 },
  { name: "featuredProjects", label: "Featured projects", pageSize: 10 },
  { name: "testimonials", label: "Reviews", pageSize: 50 },
  { name: "settings", label: "Settings (hero, FAQ, CEO message…)", pageSize: 50 },
  { name: "stats", label: "Statistics", pageSize: 20 },
  { name: "filmImages", label: "Uploaded pictures", pageSize: 4 },
  { name: "analyticsTotals", label: "Visit totals", pageSize: 20 },
  { name: "analyticsDaily", label: "Daily visits", pageSize: 100 },
] as const;
export const BACKUP_KEY = "meteorite:last-backup";
