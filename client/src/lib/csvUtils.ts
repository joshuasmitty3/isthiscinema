
import { Movie } from '@/lib/types';

export interface MovieCSVRow {
  title: string;
  year: string;
  director: string;
  list: 'Watch List' | 'Watched';
  order?: number;
  watchedDate?: string;
  review?: string;
}

export function formatMovieForCSV(movie: Movie, list: 'Watch List' | 'Watched'): MovieCSVRow {
  return {
    title: movie.title,
    year: movie.year,
    director: movie.director,
    list,
    order: list === 'Watch List' ? movie.order : undefined,
    watchedDate: movie.watchedDate ? new Date(movie.watchedDate).toISOString().split('T')[0] : undefined,
    review: movie.review
  };
}

export function validateCSVData(data: MovieCSVRow[]): boolean {
  return data.every(row => 
    row.title && 
    row.year && 
    row.director && 
    (row.list === 'Watch List' || row.list === 'Watched')
  );
}
