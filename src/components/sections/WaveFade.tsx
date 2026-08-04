export function WaveFade() {
  return (
    <div
      className="relative h-[104px] overflow-hidden bg-page md:h-[156px]"
      aria-hidden="true"
    >
      <svg
        className="animate-wave-drift absolute inset-x-[-4%] top-0 h-[70%] w-[108%] text-wave"
        viewBox="0 0 1440 110"
        preserveAspectRatio="none"
      >
        <path
          fill="currentColor"
          d="M0 58
            C 90 34, 170 18, 260 28
            C 360 40, 420 78, 540 72
            C 670 64, 720 24, 860 30
            C 1000 36, 1080 78, 1200 70
            C 1300 64, 1380 40, 1440 34
            L 1440 110 L 0 110 Z"
        />
      </svg>
      <div className="absolute inset-x-0 bottom-0 h-[78%] bg-gradient-to-b from-wave via-[#eaf6f3] to-white" />
      <div className="absolute inset-x-0 bottom-0 h-5 bg-white" />
    </div>
  );
}
