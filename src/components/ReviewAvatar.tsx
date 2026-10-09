import { getAvatarGradient, getInitials } from "@/lib/reviews-ui";

const SIZES = {
  sm: "h-9 w-9 text-[13px]",
  md: "h-11 w-11 text-[15px]",
  lg: "h-14 w-14 text-lg",
} as const;

/**
 * Apple-contacts-style monogram: a soft gradient disc, a hairline highlight
 * and the reviewer's first + last initials. Decorative — the name is always
 * rendered next to it, so it is hidden from assistive tech.
 */
export default function ReviewAvatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ backgroundImage: getAvatarGradient(name) }}
      className={`inline-flex flex-none select-none items-center justify-center rounded-full font-semibold leading-none tracking-[0.02em] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(15,23,42,0.18)] ring-1 ring-black/5 ${SIZES[size]} ${className}`}
    >
      {getInitials(name)}
    </span>
  );
}
