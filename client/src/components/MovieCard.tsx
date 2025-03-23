
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import type { Movie } from "@/lib/types";
import { RiEyeLine, RiDeleteBin6Line, RiInformationLine } from "react-icons/ri";

interface MovieCardProps {
  movie: Movie;
  actions: {
    type: "watch" | "remove" | "review" | "details";
    handler: (movie: Movie) => void;
  }[];
  isCompact?: boolean;
}

export default function MovieCard({ movie, actions, isCompact = false }: MovieCardProps) {
  const getIcon = (type: string) => {
    switch(type) {
      case "watch": return <RiEyeLine className="w-4 h-4" />;
      case "remove": return <RiDeleteBin6Line className="w-4 h-4" />;
      case "details": return <RiInformationLine className="w-4 h-4" />;
      default: return null;
    }
  };

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
                size="icon"
                variant="ghost"
                className={`p-1 ${
                  type === "watch" ? "text-emerald-600 hover:bg-emerald-500/10" :
                  type === "remove" ? "text-red-600 hover:bg-red-500/10" :
                  "text-blue-600 hover:bg-blue-500/10"
                }`}
                onClick={() => handler(movie)}
              >
                {getIcon(type)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
