
interface MovieCardProps {
  movie: Movie;
  actions: {
    type: "watch" | "remove" | "review" | "details";
    handler: (movie: Movie) => void;
  }[];
  isCompact?: boolean;
}

import { motion } from "framer-motion";

export default function MovieCard({ movie, actions, isCompact = false }: MovieCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white shadow rounded-lg overflow-hidden p-4 w-full"
    >
      <div className="flex gap-4">
        <img 
          src={movie.poster} 
          alt={movie.title}
          className="w-20 h-28 object-cover rounded-md"
        />
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1">{movie.title}</h3>
          <p className="text-neutral-600 text-sm mb-2">{movie.year}</p>
          <p className="text-neutral-600 text-sm mb-2">Genre: {movie.genre}</p>
          <p className="text-neutral-600 text-sm mb-4">Cast: {movie.actors}</p>
          
          <div className="flex gap-2">
            {actions.map(({type, handler}) => (
              <button
                key={type}
                onClick={() => handler(movie)}
                className="p-2 rounded-full hover:bg-neutral-100 transition-colors"
              >
                {type === "watch" && <span>👁️</span>}
                {type === "remove" && <span>🗑️</span>}
                {type === "details" && <span>ℹ️</span>}
                {type === "review" && <span>✏️</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
