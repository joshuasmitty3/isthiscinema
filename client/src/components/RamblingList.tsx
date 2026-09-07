import { Link } from "wouter";
import { format } from "date-fns";
import { getRamblings } from "@/lib/ramblings";

export default function RamblingList() {
  const ramblings = getRamblings();

  if (ramblings.length === 0) {
    return (
      <div className="py-16 text-center font-mono text-sm text-muted-foreground">
        nothing written yet.
      </div>
    );
  }

  return (
    <div className="border-t border-border">
      {ramblings.map((r) => (
        <Link
          key={r.slug}
          href={`/rambling/${r.slug}`}
          className="group flex items-baseline justify-between gap-3 py-4 border-b border-border transition-all duration-150 ease-out hover:-translate-y-px"
        >
          <h3 className="font-heading text-base font-medium text-foreground truncate transition-colors group-hover:text-primary">
            {r.title}
          </h3>
          {r.date && (
            <span className="flex-none font-mono text-xs text-muted-foreground/70 whitespace-nowrap tabular-nums">
              {format(new Date(r.date), "MMM d, yyyy")}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
