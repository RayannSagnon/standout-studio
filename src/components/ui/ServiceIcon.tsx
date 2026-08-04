type IconName =
  | "person"
  | "window"
  | "shield"
  | "bag"
  | "access"
  | "bolt"
  | "chart";

type ServiceIconProps = {
  name: IconName;
  className?: string;
};

export function ServiceIcon({ name, className = "" }: ServiceIconProps) {
  return (
    <span
      className={[
        "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8f3f1] text-teal",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      {name === "person" && (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.8" />
          <path
            d="M5.5 18.25c1.4-3 3.7-4.5 6.5-4.5s5.1 1.5 6.5 4.5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
      {name === "window" && (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <rect
            x="4"
            y="5.5"
            width="16"
            height="13"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.8"
          />
          <path d="M4 9.5h16" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      )}
      {name === "shield" && (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M12 3.75l7 2.5v5.4c0 4.2-2.8 7.2-7 8.6-4.2-1.4-7-4.4-7-8.6v-5.4l7-2.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.5 12.1l1.7 1.7 3.5-3.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {name === "bag" && (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M7 8.5h10l.8 10.2a1.5 1.5 0 0 1-1.5 1.6H7.7a1.5 1.5 0 0 1-1.5-1.6L7 8.5z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9 8.5V7.4a3 3 0 0 1 6 0v1.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
      {name === "access" && (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="12" cy="8.2" r="1.3" fill="currentColor" />
          <path
            d="M8.4 12.4h7.2M12 10.2v3.4l2.2 3.1M12 13.6l-2.2 3.1"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {name === "bolt" && (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor">
          <path d="M13.2 3.5L7 13.2h4.1L10.4 20.5 17.4 10.2h-4.3L13.2 3.5z" />
        </svg>
      )}
      {name === "chart" && (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none">
          <path
            d="M5 18.5V9.5M12 18.5V5.5M19 18.5v-5"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}
