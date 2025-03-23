import { motion } from "framer-motion";
import { Button } from "./ui/button";
import type { Movie } from "@/lib/types";
import { logError, logStateChange } from '../utils/logger';

interface MovieCardProps {
  movie: Movie;
  actions: {
    type: "watch" | "remove" | "review" | "details";
    handler: (movie: Movie) => void;
  }[];
  isCompact?: boolean;
}

import React from 'react';

const MovieCard = React.memo(({ movie, actions, isCompact = false }: MovieCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`bg-white shadow rounded-lg overflow-hidden ${isCompact ? 'p-2' : 'p-4'}`}
    >
      <div className="flex">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {actions.map(({type, handler}) => (
              <Button
                key={type}
                size="sm"
                className={`text-xs px-2 py-1 ${
                  type === "watch" ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20" :
                  type === "remove" ? "bg-red-500/10 text-red-600 hover:bg-red-500/20" :
                  type === "review" ? "bg-[#D2B48C]/10 text-primary hover:bg-[#D2B48C]/20" :
                  "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20"
                }`}
                onClick={() => handler(movie)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

export default MovieCard;