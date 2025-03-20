
import MovieCard from './MovieCard';
import { Movie } from '@/lib/types';

const sampleMovies: Movie[] = [
  {
    id: '1',
    imdbId: 'tt0111161',
    title: 'The Shawshank Redemption',
    year: '1994',
    director: 'Frank Darabont',
    plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',
    rating: 5,
    review: 'A masterpiece that never gets old.',
    inWatchedList: true,
    watchedDate: '2024-01-15'
  },
  {
    id: '2',
    imdbId: 'tt0068646',
    title: 'The Godfather',
    year: '1972',
    director: 'Francis Ford Coppola',
    plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',
    inWatchList: true
  }
];

export default function MovieCardTest() {
  return (
    <div className="p-8 bg-neutral-100 min-h-screen">
      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Movie Card Test</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <MovieCard 
            movie={sampleMovies[0]} 
            actionType="remove"
            onAction={(movie) => console.log('Remove action:', movie)}
            isCompact={true}
          />
          <MovieCard 
            movie={sampleMovies[1]} 
            actionType="watch"
            onAction={(movie) => console.log('Watch action:', movie)}
            isCompact={true}
          />
        </div>
      </div>
    </div>
  );
}
