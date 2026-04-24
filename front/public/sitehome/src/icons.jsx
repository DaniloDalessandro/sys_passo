// Icon library — minimal stroke icons, 24x24 viewBox, inherit color via stroke="currentColor"

const IconBase = ({ children, size = 20, stroke = 1.6, className = "", ...rest }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={stroke}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    {children}
  </svg>
);

const IconCar = (p) => (
  <IconBase {...p}>
    <path d="M3 13l2-5a2 2 0 0 1 1.9-1.3h10.2A2 2 0 0 1 19 8l2 5" />
    <path d="M3 13h18v4a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-1H7v1a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-4z" />
    <circle cx="7.5" cy="15.5" r="1" />
    <circle cx="16.5" cy="15.5" r="1" />
  </IconBase>
);

const IconUser = (p) => (
  <IconBase {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" />
  </IconBase>
);

const IconUsers = (p) => (
  <IconBase {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c.8-3.5 3.5-5 6.5-5s5.7 1.5 6.5 5" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M16 15.5c2.5.3 4.5 1.8 5 4.5" />
  </IconBase>
);

const IconShield = (p) => (
  <IconBase {...p}>
    <path d="M12 3l8 3v5c0 5-3.4 8.7-8 10-4.6-1.3-8-5-8-10V6l8-3z" />
    <path d="M9.5 12.5l2 2 3.5-4" />
  </IconBase>
);

const IconFlag = (p) => (
  <IconBase {...p}>
    <path d="M5 21V4" />
    <path d="M5 4h11l-2 3 2 3H5" />
  </IconBase>
);

const IconSearch = (p) => (
  <IconBase {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-3.5-3.5" />
  </IconBase>
);

const IconArrowRight = (p) => (
  <IconBase {...p}>
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </IconBase>
);

const IconArrowUpRight = (p) => (
  <IconBase {...p}>
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </IconBase>
);

const IconPhone = (p) => (
  <IconBase {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.8.7 2.6a2 2 0 0 1-.5 2.1L8 9.6a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.8.3 1.7.6 2.6.7A2 2 0 0 1 22 16.9z" />
  </IconBase>
);

const IconMail = (p) => (
  <IconBase {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 7l9 6 9-6" />
  </IconBase>
);

const IconMap = (p) => (
  <IconBase {...p}>
    <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </IconBase>
);

const IconMessageCircle = (p) => (
  <IconBase {...p}>
    <path d="M21 12a8 8 0 0 1-12.1 6.9L3 21l2.1-5.9A8 8 0 1 1 21 12z" />
  </IconBase>
);

const IconFacebook = (p) => (
  <IconBase {...p}>
    <path d="M15 8h-2a2 2 0 0 0-2 2v11" />
    <path d="M8 13h7" />
    <rect x="3" y="3" width="18" height="18" rx="3" />
  </IconBase>
);

const IconInstagram = (p) => (
  <IconBase {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </IconBase>
);

const IconLinkedin = (p) => (
  <IconBase {...p}>
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <path d="M8 10v7" />
    <circle cx="8" cy="7.5" r="0.8" fill="currentColor" />
    <path d="M12 17v-4a2.5 2.5 0 0 1 5 0v4" />
    <path d="M12 10v7" />
  </IconBase>
);

const IconMenu = (p) => (
  <IconBase {...p}>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h10" />
  </IconBase>
);

const IconClose = (p) => (
  <IconBase {...p}>
    <path d="M6 6l12 12" />
    <path d="M18 6L6 18" />
  </IconBase>
);

const IconLogin = (p) => (
  <IconBase {...p}>
    <path d="M10 17l5-5-5-5" />
    <path d="M15 12H3" />
    <path d="M15 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
  </IconBase>
);

const IconFile = (p) => (
  <IconBase {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
  </IconBase>
);

const IconCalendar = (p) => (
  <IconBase {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18" />
    <path d="M8 3v4" />
    <path d="M16 3v4" />
  </IconBase>
);

const IconCheck = (p) => (
  <IconBase {...p}>
    <path d="M5 12l4 4 10-10" />
  </IconBase>
);

const IconAlert = (p) => (
  <IconBase {...p}>
    <path d="M12 3l10 18H2L12 3z" />
    <path d="M12 10v5" />
    <path d="M12 18h.01" />
  </IconBase>
);

const IconSparkle = (p) => (
  <IconBase {...p}>
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z" />
  </IconBase>
);

const IconZap = (p) => (
  <IconBase {...p}>
    <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />
  </IconBase>
);

const IconActivity = (p) => (
  <IconBase {...p}>
    <path d="M3 12h4l2-7 4 14 2-7h6" />
  </IconBase>
);

const IconCamera = (p) => (
  <IconBase {...p}>
    <path d="M4 8h3l2-2h6l2 2h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    <circle cx="12" cy="13" r="3.5" />
  </IconBase>
);

const IconUpload = (p) => (
  <IconBase {...p}>
    <path d="M21 15v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3" />
    <path d="M12 3v13" />
    <path d="M7 8l5-5 5 5" />
  </IconBase>
);

const IconHash = (p) => (
  <IconBase {...p}>
    <path d="M4 9h16" />
    <path d="M4 15h16" />
    <path d="M10 3L8 21" />
    <path d="M16 3l-2 18" />
  </IconBase>
);

const IconChevronDown = (p) => (
  <IconBase {...p}>
    <path d="M6 9l6 6 6-6" />
  </IconBase>
);

const IconGlobe = (p) => (
  <IconBase {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3a14 14 0 0 1 0 18" />
    <path d="M12 3a14 14 0 0 0 0 18" />
  </IconBase>
);

const IconClock = (p) => (
  <IconBase {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </IconBase>
);

const IconLock = (p) => (
  <IconBase {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </IconBase>
);

const IconEye = (p) => (
  <IconBase {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
    <circle cx="12" cy="12" r="3" />
  </IconBase>
);

const IconPlus = (p) => (
  <IconBase {...p}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </IconBase>
);

const IconMinus = (p) => (
  <IconBase {...p}>
    <path d="M5 12h14" />
  </IconBase>
);

const IconLoader = (p) => (
  <IconBase {...p} className={`animate-spin ${p.className || ""}`}>
    <path d="M12 3v3" />
    <path d="M12 18v3" />
    <path d="M4.9 4.9l2.1 2.1" />
    <path d="M17 17l2.1 2.1" />
    <path d="M3 12h3" />
    <path d="M18 12h3" />
    <path d="M4.9 19.1L7 17" />
    <path d="M17 7l2.1-2.1" />
  </IconBase>
);

Object.assign(window, {
  IconCar, IconUser, IconUsers, IconShield, IconFlag, IconSearch,
  IconArrowRight, IconArrowUpRight, IconPhone, IconMail, IconMap,
  IconMessageCircle, IconFacebook, IconInstagram, IconLinkedin,
  IconMenu, IconClose, IconLogin, IconFile, IconCalendar,
  IconCheck, IconAlert, IconSparkle, IconZap, IconActivity,
  IconCamera, IconUpload, IconHash, IconChevronDown, IconGlobe,
  IconClock, IconLock, IconEye, IconPlus, IconMinus, IconLoader,
});
