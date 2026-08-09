import { Check, X } from "lucide-react";
import type { Movie, MovieAction } from "@/lib/types";

interface MovieCardProps {
  movie: Movie;
  actions: MovieAction[];
}

export default function MovieCard({ movie, actions }: MovieCardProps) {
  const handlerFor = (type: MovieAction["type"]) =>
    actions.find((a) => a.type === type)?.handler;

  const onWatch = handlerFor("watch");
  const onRemove = handlerFor("remove");
  const onDetails = handlerFor("details");

  const hasPoster = movie.poster && movie.poster !== "N/A";
  const meta = [movie.director, movie.genre, movie.runtime]
    .filter(Boolean)
    .join("  ·  ");

  return (
    <div className="group flex items-center gap-4 py-4 border-b border-border">
      <button
        type="button"
        onClick={() => onDetails?.(movie)}
        className="flex-none w-12 h-16 rounded-sm overflow-hidden bg-card"
        aria-label={`details for ${movie.title}`}
      >
        {hasPoster ? (
          <img
            src={movie.poster}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex w-full h-full items-center justify-center font-mono text-[9px] text-muted-foreground">
            poster
          </span>
        )}
      </button>

      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onDetails?.(movie)}
      >
        <h3 className="font-heading text-base font-medium text-foreground truncate">
          {movie.title}
        </h3>
        {meta && (
          <p className="font-mono text-[11px] text-muted-foreground mt-1 truncate">
            {meta}
          </p>
        )}
      </div>

      <span className="font-mono text-xs text-muted-foreground/70 tabular-nums flex-none">
        {movie.year}
      </span>

      <div className="flex items-center gap-1 flex-none opacity-60 group-hover:opacity-100 transition-opacity">
        {onWatch && (
          <button
            type="button"
            onClick={() => onWatch(movie)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            aria-label={`mark ${movie.title} as watched`}
            title="mark as watched"
          >
            <Check className="w-4 h-4" />
          </button>
        )}
        {onRemove && (
          <button
            type="button"
            onClick={() => onRemove(movie)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            aria-label={`remove ${movie.title}`}
            title="remove"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
