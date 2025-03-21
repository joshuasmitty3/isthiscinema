import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const movies = pgTable("movies", {
  id: serial("id").primaryKey(),
  imdbId: text("imdb_id").notNull().unique(),
  title: text("title").notNull(),
  year: text("year").notNull(),
  director: text("director").notNull(),
  poster: text("poster").notNull(),
  plot: text("plot").notNull(),
  runtime: text("runtime"),
  genre: text("genre"),
  actors: text("actors"),
});

export const insertMovieSchema = createInsertSchema(movies).omit({
  id: true,
});

export const watchList = pgTable("watch_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  order: integer("order").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWatchListSchema = createInsertSchema(watchList).omit({
  id: true,
  createdAt: true,
});

export const watchedList = pgTable("watched_list", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  movieId: integer("movie_id").notNull(),
  watchedDate: timestamp("watched_date").defaultNow(),
  review: text("review"),
  rating: integer("rating"),
});

export const insertWatchedListSchema = createInsertSchema(watchedList).omit({
  id: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Movie = typeof movies.$inferSelect;
export type InsertMovie = z.infer<typeof insertMovieSchema>;

export type WatchListItem = typeof watchList.$inferSelect;
export type InsertWatchListItem = z.infer<typeof insertWatchListSchema>;

export type WatchedListItem = typeof watchedList.$inferSelect;
export type InsertWatchedListItem = z.infer<typeof insertWatchedListSchema>;

export type MovieWithDetails = Movie & {
  inWatchList?: boolean;
  inWatchedList?: boolean;
  watchedDate?: Date;
  review?: string;
  order?: number;
};

export type SearchResult = {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
};

export type OmdbDetailedMovie = {
  imdbID: string;
  Title: string;
  Year: string;
  Rated: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Writer: string;
  Actors: string;
  Plot: string;
  Language: string;
  Country: string;
  Awards: string;
  Poster: string;
  Ratings: { Source: string; Value: string }[];
  Metascore: string;
  imdbRating: string;
  imdbVotes: string;
  Type: string;
  DVD: string;
  BoxOffice: string;
  Production: string;
  Website: string;
  Response: string;
};


// Storage interface
export interface StorageInterface {
  // User operations
  getUser(id: number): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<void>;
  deleteUser(id: number): Promise<void>;

  // Movie operations
  getMovie(id: number): Promise<Movie | null>;
  getMovieByImdbId(imdbId: string): Promise<Movie | null>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  updateMovie(id: number, data: Partial<Movie>): Promise<void>;
  deleteMovie(id: number): Promise<void>;

  // Watch list operations
  getWatchListForUser(userId: number): Promise<MovieWithDetails[]>;
  addToWatchList(watchListItem: InsertWatchListItem): Promise<WatchListItem>;
  removeFromWatchList(userId: number, movieId: number): Promise<void>;
  updateWatchListOrder(userId: number, movieIds: number[]): Promise<void>;

  // Watched list operations
  getWatchedListForUser(userId: number): Promise<MovieWithDetails[]>;
  addToWatchedList(watchedListItem: InsertWatchedListItem): Promise<WatchedListItem>;
  updateReview(userId: number, movieId: number, review: string): Promise<void>;
  removeFromWatchedList(userId: number, movieId: number): Promise<void>;
}