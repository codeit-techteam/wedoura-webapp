/** The ink strip above the header. The second line hides on small screens, as in the reference. */
export function Announcement() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 bg-ink px-[3vw] py-2.5 font-sans text-label font-medium tracking-[0.28em] text-mist uppercase md:justify-between">
      <span>India’s luxury wedding planning platform</span>
      <span className="hidden md:inline">Free to use · Prices shown openly</span>
    </div>
  );
}
