/** Inline brand marks — lucide-react dropped brand/logo icons, so these follow
 *  the same pattern as AuthForm's GoogleIcon: small, self-contained SVGs. */

export function FacebookIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.1 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.1 24 18.1 24 12.07Z"
        fill="#1877F2"
      />
    </svg>
  );
}

export function InstagramIcon({ size = 20 }: { size?: number }) {
  const gradId = "ig-grad";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={gradId} cx="30%" cy="107%" r="150%">
          <stop offset="0%" stopColor="#FFDD55" />
          <stop offset="10%" stopColor="#FFDD55" />
          <stop offset="50%" stopColor="#FF543E" />
          <stop offset="100%" stopColor="#C837AB" />
        </radialGradient>
      </defs>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill={`url(#${gradId})`} />
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" stroke="white" strokeOpacity="0.15" />
      <circle cx="12" cy="12" r="4.6" stroke="white" strokeWidth="1.8" />
      <circle cx="17.4" cy="6.6" r="1.1" fill="white" />
    </svg>
  );
}

export function XIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect width="24" height="24" rx="6" fill="#000000" />
      <path
        d="M13.86 10.94 19.86 4h-1.42l-5.2 6.03L9.1 4H4.2l6.3 9.17-6.3 7.32h1.42l5.5-6.38 4.4 6.38h4.9l-6.56-9.55Zm-1.95 2.26-.64-.92-5.07-7.26h2.18l4.09 5.86.64.92 5.32 7.62h-2.18l-4.34-6.22Z"
        fill="white"
      />
    </svg>
  );
}

export function WhatsAppIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="12" fill="#25D366" />
      <path
        d="M17.47 6.51a7.36 7.36 0 0 0-11.6 8.85L5 20l4.77-.85a7.36 7.36 0 0 0 10.94-6.4 7.3 7.3 0 0 0-3.24-6.24Zm-5.44 11.3a6.1 6.1 0 0 1-3.11-.85l-.22-.13-2.32.41.41-2.26-.14-.23a6.11 6.11 0 1 1 11.35-3.2 6.11 6.11 0 0 1-5.97 6.26Zm3.35-4.57c-.18-.09-1.07-.53-1.24-.59-.17-.06-.29-.09-.41.09-.12.18-.47.59-.58.71-.11.12-.21.14-.4.05-.18-.09-.78-.29-1.48-.92-.55-.49-.92-1.09-1.03-1.27-.11-.18-.01-.28.08-.37.08-.08.18-.21.27-.32.09-.11.12-.18.18-.3.06-.12.03-.23-.02-.32-.05-.09-.41-.98-.56-1.35-.15-.35-.3-.31-.41-.31h-.35c-.12 0-.32.05-.48.23-.17.18-.63.62-.63 1.5 0 .88.65 1.74.74 1.86.09.12 1.27 1.94 3.08 2.72.43.19.77.3 1.03.38.43.14.83.12 1.14.07.35-.05 1.07-.44 1.22-.86.15-.42.15-.78.11-.86-.05-.08-.17-.13-.35-.22Z"
        fill="white"
      />
    </svg>
  );
}
