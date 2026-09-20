import type { Metadata } from "next";
import { Image as ImageIcon } from "lucide-react";
import { getMediaPosts } from "@/lib/media-posts-data";
import AdminMediaPanel from "@/components/AdminMediaPanel";

export const metadata: Metadata = { title: "Media · Admin" };
export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const posts = await getMediaPosts({ includeHidden: true });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gold/15 text-brand-gold">
          <ImageIcon size={16} strokeWidth={1.75} />
        </span>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-heading">Media</h1>
          <p className="text-sm text-brand-ink/55">
            Shown on the Media page. Link to an existing social media post, or publish a photo and
            text directly.
          </p>
        </div>
      </div>

      <div className="glass shimmer-border mt-6 rounded-3xl p-6 sm:p-8">
        <AdminMediaPanel posts={posts} />
      </div>
    </div>
  );
}
