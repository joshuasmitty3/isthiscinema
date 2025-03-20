import { 
  users, type User, type InsertUser,
  movies, type Movie, type InsertMovie,
  watchList, type WatchListItem, type InsertWatchListItem,
  watchedList, type WatchedListItem, type InsertWatchedListItem,
  type MovieWithDetails, type OmdbDetailedMovie
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Movie operations
  getMovieById(id: number): Promise<Movie | undefined>;
  getMovieByImdbId(imdbId: string): Promise<Movie | undefined>;
  createMovie(movie: InsertMovie): Promise<Movie>;
  
  // Watch list operations
  getWatchListForUser(userId: number): Promise<MovieWithDetails[]>;
  addToWatchList(watchListItem: InsertWatchListItem): Promise<WatchListItem>;
  removeFromWatchList(userId: number, movieId: number): Promise<void>;
  updateWatchListOrder(userId: number, orderedMovieIds: number[]): Promise<void>;
  
  // Watched list operations
  getWatchedListForUser(userId: number): Promise<MovieWithDetails[]>;
  addToWatchedList(watchedListItem: InsertWatchedListItem): Promise<WatchedListItem>;
  updateReview(userId: number, movieId: number, review: string): Promise<void>;
  
  // Move between lists
  moveToWatched(userId: number, movieId: number, review?: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private movies: Map<number, Movie>;
  private watchListItems: Map<number, WatchListItem>;
  private watchedListItems: Map<number, WatchedListItem>;
  
  private userIdCounter: number;
  private movieIdCounter: number;
  private watchListIdCounter: number;
  private watchedListIdCounter: number;

  constructor() {
    this.users = new Map();
    this.movies = new Map();
    this.watchListItems = new Map();
    this.watchedListItems = new Map();
    
    this.userIdCounter = 1;
    this.movieIdCounter = 1;
    this.watchListIdCounter = 1;
    this.watchedListIdCounter = 1;
    
    // Add shared Gmail login
    this.createUser({
      username: "shared@gmail.com",
      password: "password123" // In a real app, this would be hashed
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Movie operations
  async getMovieById(id: number): Promise<Movie | undefined> {
    return this.movies.get(id);
  }

  async getMovieByImdbId(imdbId: string): Promise<Movie | undefined> {
    return Array.from(this.movies.values()).find(
      (movie) => movie.imdbId === imdbId
    );
  }

  async createMovie(insertMovie: InsertMovie): Promise<Movie> {
    const id = this.movieIdCounter++;
    const movie: Movie = { ...insertMovie, id };
    this.movies.set(id, movie);
    return movie;
  }

  // Watch list operations
  async getWatchListForUser(userId: number): Promise<MovieWithDetails[]> {
    const watchListItems = Array.from(this.watchListItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => a.order - b.order);

    const result: MovieWithDetails[] = [];
    for (const item of watchListItems) {
      const movie = await this.getMovieById(item.movieId);
      if (movie) {
        result.push({
          ...movie,
          inWatchList: true,
          order: item.order
        });
      }
    }
    
    return result;
  }

  async addToWatchList(insertWatchListItem: InsertWatchListItem): Promise<WatchListItem> {
    // Check if movie is already in the watch list
    const existingItem = Array.from(this.watchListItems.values()).find(
      item => item.userId === insertWatchListItem.userId && item.movieId === insertWatchListItem.movieId
    );
    
    if (existingItem) {
      return existingItem;
    }
    
    const id = this.watchListIdCounter++;
    const watchListItem: WatchListItem = { 
      ...insertWatchListItem, 
      id,
      createdAt: new Date()
    };
    
    this.watchListItems.set(id, watchListItem);
    return watchListItem;
  }

  async removeFromWatchList(userId: number, movieId: number): Promise<void> {
    const itemToRemove = Array.from(this.watchListItems.values()).find(
      item => item.userId === userId && item.movieId === movieId
    );
    
    if (itemToRemove) {
      this.watchListItems.delete(itemToRemove.id);
      
      // Re-order remaining items
      const remainingItems = Array.from(this.watchListItems.values())
        .filter(item => item.userId === userId)
        .sort((a, b) => a.order - b.order);
        
      remainingItems.forEach((item, index) => {
        this.watchListItems.set(item.id, { ...item, order: index + 1 });
      });
    }
  }

  async updateWatchListOrder(userId: number, orderedMovieIds: number[]): Promise<void> {
    for (let i = 0; i < orderedMovieIds.length; i++) {
      const movieId = orderedMovieIds[i];
      const item = Array.from(this.watchListItems.values()).find(
        item => item.userId === userId && item.movieId === movieId
      );
      
      if (item) {
        this.watchListItems.set(item.id, { ...item, order: i + 1 });
      }
    }
  }

  // Watched list operations
  async getWatchedListForUser(userId: number): Promise<MovieWithDetails[]> {
    const watchedListItems = Array.from(this.watchedListItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => b.watchedDate.getTime() - a.watchedDate.getTime()); // Most recent first

    const result: MovieWithDetails[] = [];
    for (const item of watchedListItems) {
      const movie = await this.getMovieById(item.movieId);
      if (movie) {
        result.push({
          ...movie,
          inWatchedList: true,
          watchedDate: item.watchedDate,
          review: item.review || ''
        });
      }
    }
    
    return result;
  }

  async addToWatchedList(insertWatchedListItem: InsertWatchedListItem): Promise<WatchedListItem> {
    // Check if movie is already in the watched list
    const existingItem = Array.from(this.watchedListItems.values()).find(
      item => item.userId === insertWatchedListItem.userId && item.movieId === insertWatchedListItem.movieId
    );
    
    if (existingItem) {
      // Update existing item
      const updated = {
        ...existingItem,
        review: insertWatchedListItem.review || existingItem.review,
        rating: insertWatchedListItem.rating || existingItem.rating
      };
      this.watchedListItems.set(existingItem.id, updated);
      return updated;
    }
    
    const id = this.watchedListIdCounter++;
    const watchedDate = insertWatchedListItem.watchedDate || new Date();
    
    const watchedListItem: WatchedListItem = { 
      ...insertWatchedListItem, 
      id,
      watchedDate
    };
    
    this.watchedListItems.set(id, watchedListItem);
    return watchedListItem;
  }

  async updateReview(userId: number, movieId: number, review: string): Promise<void> {
    const item = Array.from(this.watchedListItems.values()).find(
      item => item.userId === userId && item.movieId === movieId
    );
    
    if (item) {
      this.watchedListItems.set(item.id, { ...item, review });
    }
  }

  // Move between lists
  async moveToWatched(userId: number, movieId: number, review?: string): Promise<void> {
    // Remove from watch list
    await this.removeFromWatchList(userId, movieId);
    
    // Add to watched list
    await this.addToWatchedList({
      userId,
      movieId,
      watchedDate: new Date(),
      review,
      rating: null
    });
  }
}

export const storage = new MemStorage();
