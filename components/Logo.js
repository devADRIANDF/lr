import { TallyMark } from "./Tally";

export default function Logo({ className = "" }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <TallyMark className="h-[22px] w-auto" />
      <span className="cond text-[28px] leading-none">Lamine Resell</span>
    </span>
  );
}
