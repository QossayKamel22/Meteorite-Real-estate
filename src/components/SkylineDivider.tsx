export default function SkylineDivider({
  flip = false,
  className = "",
}: {
  flip?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`pointer-events-none relative h-14 w-full overflow-hidden text-brand-navy sm:h-20 ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className={`h-full w-full ${flip ? "-scale-y-100" : ""}`}
      >
        <path
          d="M0 120V60L40 60V40L70 40V70L100 70V20L130 20V50L160 50V10L190 10V50L220 50V30L260 30V80L300 80V45L330 45V65L370 65V25L410 25V55L450 55V15L490 15V60L540 60V35L580 35V70L620 70V20L660 20V50L700 50V90L740 90V40L780 40V60L820 60V30L860 30V55L900 55V15L940 15V60L990 60V35L1030 35V70L1070 70V25L1110 25V55L1150 55V80L1190 80V40L1230 40V60L1270 60V30L1310 30V50L1350 50V70L1390 70V45L1440 45V120H0Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
