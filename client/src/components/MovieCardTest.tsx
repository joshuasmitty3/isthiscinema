
import MovieCard from './MovieCard';
import { Movie } from '@/lib/types';

const sampleMovie: Movie = {
  id: 1,
  imdbId: "tt0317219",
  title: "Cars",
  year: "2006",
  director: "John Lasseter",
  poster: "https://m.media-amazon.com/images/M/MV5BMTg5NzY0MzA2MV5BMl5BanBnXkFtZTYwNDc3NTc2._V1_SX300.jpg",
  plot: "A hot-shot race-car named Lightning McQueen gets waylaid in Radiator Springs, where he finds the true meaning of friendship and family.",
  runtime: "117 min",
  genre: "Animation, Comedy",
  actors: "Owen Wilson, Bonnie Hunt",
};

export default function MovieCardTest() {
  const handleAction = (movie: Movie) => {
    console.log('Action triggered for movie:', movie);
  };

  return (
    <div className="p-8 bg-neutral-100 min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Movie Card Test</h1>
        <div className="grid gap-4">
          <MovieCard 
            movie={sampleMovie} 
            actionType="watch"
            onAction={handleAction}
          />
          <MovieCard 
            movie={sampleMovie} 
            actionType="remove"
            onAction={handleAction}
          />
          <MovieCard 
            movie={sampleMovie} 
            actionType="review"
            onAction={handleAction}
          />
          <MovieCard 
            movie={sampleMovie} 
            actionType="watch"
            onAction={handleAction}
            isCompact={true}
          />
        </div>
      </div>
    </div>
  );
}
