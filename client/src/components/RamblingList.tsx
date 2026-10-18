import { Link } from "wouter";
import { format } from "date-fns";
import { combineRamblings } from "@/lib/ramblings";
import { usePrivateRamblings } from "@/hooks/use-private-ramblings";
import { User } from "@/lib/types";

export default function RamblingList({ user }: { user: User | null }) {
  const { ramblings: privateRamblings } = usePrivateRamblings(!!user);
  const ramblings = combineRamblings(privateRamblings);

  const headerImage = (
    <img
      src="/ramblings/ramblings-header.jpg"
      alt=""
      className="mb-8 w-full rounded-md border border-border"
    />
  );

  if (ramblings.length === 0) {
    return (
      <>
        {headerImage}
        <div className="py-16 text-center font-mono text-sm text-muted-foreground">
          nothing written yet.
        </div>
      </>
    );
  }

  return (
    <>
      {headerImage}
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
                {format(new Date(`${r.date}T00:00:00`), "MMM d, yyyy")}
              </span>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
