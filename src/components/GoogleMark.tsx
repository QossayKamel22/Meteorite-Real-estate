/** A small four-dot mark nodding at Google's brand colors, not a reproduction of the Google logo. */
export default function GoogleMark({ className = "" }: { className?: string }) {
  return (
    <span aria-hidden="true" className={`inline-flex gap-0.5 ${className}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
      <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
    </span>
  );
}
