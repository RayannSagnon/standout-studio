export function WaveFade() {
  return (
    <div
      className="relative h-[104px] overflow-hidden bg-page md:h-[156px]"
      aria-hidden="true"
    >
      <svg
        className="absolute inset-x-0 top-0 h-[60%] w-full text-wave md:h-[55%]"
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 42C120 18 240 6 360 18c120 12 180 42 300 42s180-30 300-42c120-12 240 0 360 24 60 12 90 18 120 18V90H0V42Z"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[72%] bg-gradient-to-b from-wave via-[#ebf6f4] to-white" />
      <div className="absolute inset-x-0 bottom-0 h-4 bg-white" />
    </div>
  );
}
