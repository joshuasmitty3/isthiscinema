import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Movie } from "@/lib/types";
import { useState } from "react";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: Movie;
  actionType: 'watch' | 'remove';
  onAction: (movie: Movie) => void;
  isCompact?: boolean;
}

export default function MovieCard({ movie, actionType, onAction, isCompact }: MovieCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [swipeDistance, setSwipeDistance] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentTouch = e.touches[0].clientX;
    const distance = currentTouch - touchStart;
    setSwipeDistance(distance);
  };

  const handleTouchEnd = () => {
    if (Math.abs(swipeDistance) > 100) {
      onAction(movie);
    }
    setSwipeDistance(0);
  };

  return (
    <motion.div
      className={`bg-white rounded-lg shadow-md overflow-hidden touch-manipulation
        ${isDragging ? 'opacity-50' : ''}`}
      animate={{ x: swipeDistance }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative aspect-[2/3] md:aspect-[3/4]">
        <img 
          src={movie.poster !== "N/A" ? movie.poster : "https://via.placeholder.com/300x450?text=No+Poster"}
          alt={movie.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      <div className="p-4">
        <h3 className="text-base md:text-lg font-semibold mb-2 line-clamp-2">{movie.title}</h3>
        {!isCompact && (
          <div className="space-y-1">
            <p className="text-sm text-gray-600">{movie.year}</p>
            <p className="text-sm text-gray-600 line-clamp-1">{movie.director}</p>
          </div>
        )}

        <Button 
          onClick={() => onAction(movie)} 
          className="w-full mt-3 min-h-[44px] text-sm md:text-base"
          variant={actionType === 'watch' ? 'default' : 'destructive'}
        >
          {actionType === 'watch' ? 'Watch' : 'Remove'}
        </Button>
      </div>
    </motion.div>
  );
}