import { Movie } from "@/lib/movies";

interface MovieCardProps {
  movie: Movie;
  onAction?: (movieId: number) => void;
  actionType?: string;
  isDragging?: boolean;
}

export default function MovieCard({ movie, onAction, actionType, isDragging }: MovieCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${isDragging ? 'opacity-50' : ''}`}>
      <img 
        src={movie.poster} 
        alt={movie.title} 
        className="w-full h-48 object-cover rounded"
      />
      <h3 className="mt-2 font-semibold">{movie.title}</h3>
      <p className="text-gray-500">{movie.year}</p>
      {onAction && (
        <button onClick={() => onAction(movie.id)} className="mt-2">
          {actionType}
        </button>
      )}
    </div>
  );
}