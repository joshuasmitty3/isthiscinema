import { 
  users, type User, type InsertUser,
  movies, type Movie, type InsertMovie,
  watchList, type WatchListItem, type InsertWatchListItem,
  watchedList, type WatchedListItem, type InsertWatchedListItem,
  type MovieWithDetails, type StorageInterface
} from "@shared/schema";
import { db } from './db';
import { eq, and, desc } from 'drizzle-orm';

export class PostgresStorage implements StorageInterface {
  // User operations
  async getUser(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<User>): Promise<void> {
    await db.update(users).set(data).where(eq(users.id, id));
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Movie operations
  async getMovie(id: number): Promise<Movie | null> {
    const result = await db.select().from(movies).where(eq(movies.id, id));
    return result[0] || null;
  }

  async getMovieByImdbId(imdbId: string): Promise<Movie | null> {
    const result = await db.select().from(movies).where(eq(movies.imdbId, imdbId));
    return result[0] || null;
  }

  async createMovie(movie: InsertMovie): Promise<Movie> {
    const result = await db.insert(movies).values(movie).returning();
    return result[0];
  }

  async updateMovie(id: number, data: Partial<Movie>): Promise<void> {
    await db.update(movies).set(data).where(eq(movies.id, id));
  }

  async deleteMovie(id: number): Promise<void> {
    await db.delete(movies).where(eq(movies.id, id));
  }

  // Watch list operations
  async getWatchListForUser(userId: number): Promise<MovieWithDetails[]> {
    const watchListItems = await db
      .select({
        ...movies,
        order: watchList.order,
      })
      .from(movies)
      .innerJoin(watchList, eq(movies.id, watchList.movieId))
      .where(eq(watchList.userId, userId))
      .orderBy(desc(watchList.order));

    return watchListItems.map(item => ({
      ...item,
      inWatchList: true
    }));
  }

  async addToWatchList(watchListItem: InsertWatchListItem): Promise<WatchListItem> {
    const result = await db.insert(watchList).values(watchListItem).returning();
    return result[0];
  }

  async removeFromWatchList(userId: number, movieId: number): Promise<void> {
    await db.delete(watchList)
      .where(and(
        eq(watchList.userId, userId),
        eq(watchList.movieId, movieId)
      ));
  }

  async updateWatchListOrder(userId: number, movieIds: number[]): Promise<void> {
    await Promise.all(
      movieIds.map((movieId, index) =>
        db.update(watchList)
          .set({ order: movieIds.length - index })
          .where(and(
            eq(watchList.userId, userId),
            eq(watchList.movieId, movieId)
          ))
      )
    );
  }

  // Watched list operations
  async getWatchedListForUser(userId: number): Promise<MovieWithDetails[]> {
    const watchedListItems = await db
      .select({
        ...movies,
        watchedDate: watchedList.watchedDate,
        review: watchedList.review,
        rating: watchedList.rating
      })
      .from(movies)
      .innerJoin(watchedList, eq(movies.id, watchedList.movieId))
      .where(eq(watchedList.userId, userId))
      .orderBy(desc(watchedList.watchedDate));

    return watchedListItems.map(item => ({
      ...item,
      inWatchedList: true
    }));
  }

  async addToWatchedList(watchedListItem: InsertWatchedListItem): Promise<WatchedListItem> {
    const result = await db.insert(watchedList).values(watchedListItem).returning();
    return result[0];
  }

  async updateReview(userId: number, movieId: number, review: string): Promise<void> {
    await db.update(watchedList)
      .set({ review })
      .where(and(
        eq(watchedList.userId, userId),
        eq(watchedList.movieId, movieId)
      ));
  }

  async removeFromWatchedList(userId: number, movieId: number): Promise<void> {
    await db.delete(watchedList)
      .where(and(
        eq(watchedList.userId, userId),
        eq(watchedList.movieId, movieId)
      ));
  }

  async moveToWatched(userId: number, movieId: number, review?: string): Promise<void> {
    try {
      // Check if movie exists in watch list.  This needs to be implemented using Postgres.
      const watchListItemExists = await db.select().from(watchList).where(and(eq(watchList.userId, userId), eq(watchList.movieId, movieId))).count() > 0;
      if (!watchListItemExists) {
        throw new Error('Movie not found in watch list');
      }

      await this.removeFromWatchList(userId, movieId);
      await this.addToWatchedList({ userId, movieId, watchedDate: new Date(), review, rating: null });
      console.log(`Successfully moved movie ${movieId} to watched list for user ${userId}`);
    } catch (error) {
      console.error('Error in moveToWatched:', error);
      throw error;
    }
  }

  async getMovieById(id: number): Promise<Movie | undefined> {
    const result = await this.getMovie(id);
    return result;
  }

  async getWatchListForUser(userId: number): Promise<MovieWithDetails[]> {
      return await this.getWatchListForUser(userId);
  }

  async addToWatchList(watchListItem: InsertWatchListItem): Promise<WatchListItem> {
      return await this.addToWatchList(watchListItem);
  }

  async removeFromWatchList(userId: number, movieId: number): Promise<void> {
    await this.removeFromWatchList(userId, movieId);
  }

  async updateWatchListOrder(userId: number, orderedMovieIds: number[]): Promise<void> {
    await this.updateWatchListOrder(userId, orderedMovieIds);
  }

  async getWatchedListForUser(userId: number): Promise<MovieWithDetails[]> {
    return await this.getWatchedListForUser(userId);
  }

  async addToWatchedList(watchedListItem: InsertWatchedListItem): Promise<WatchedListItem> {
    return await this.addToWatchedList(watchedListItem);
  }

  async updateReview(userId: number, movieId: number, review: string): Promise<void> {
    await this.updateReview(userId, movieId, review);
  }

  async removeFromWatchedList(userId: number, movieId: number): Promise<void> {
      await this.removeFromWatchedList(userId, movieId);
  }
}

export const storage = new PostgresStorage();