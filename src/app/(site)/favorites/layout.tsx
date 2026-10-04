import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Favorites",
  description: "Your saved properties at Meteorite Real Estate.",
  path: "/favorites",
  noindex: true,
});

export default function FavoritesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
