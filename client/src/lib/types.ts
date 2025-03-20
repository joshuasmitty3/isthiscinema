export interface Movie {
  id: number;
  imdbId: string;
  title: string;
  year: string;
  director: string;
  poster: string;
  plot: string;
  runtime?: string;
  genre?: string;
  actors?: string;
  inWatchList?: boolean;
  inWatchedList?: boolean;
  watchedDate?: string;
  review?: string;
  order?: number;
}

export interface SearchResult {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

export interface User {
  id: number;
  username: string;
}
