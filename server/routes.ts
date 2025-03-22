import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertMovieSchema, 
  insertWatchListSchema, 
  insertWatchedListSchema,
  type OmdbDetailedMovie,
  type SearchResult
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import session from "express-session";
import MemoryStore from "memorystore";
import { Parser } from "json2csv";

export function setupWatchListRoutes(app: Express) {
  // Get watch list
  app.get("/api/watchlist", async (req: Request, res: Response) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const movies = await storage.getWatchList(req.session.userId);
    res.json(movies);
  });

  // Remove from watch list
  app.delete("/api/watchlist/:movieId", async (req: Request, res: Response) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    await storage.removeFromWatchList(req.session.userId, req.params.movieId);
    res.json({ success: true });
  });

  // Reorder watch list
  app.post("/api/watchlist/reorder", async (req: Request, res: Response) => {
    if (!req.session.userId) return res.status(401).json({ message: "Not authenticated" });
    const { movieId, direction } = req.body;
    await storage.reorderWatchList(req.session.userId, movieId, direction);
    res.json({ success: true });
  });
}

const OMDB_API_KEY = process.env.OMDB_API_KEY;

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up session middleware
  const MemoryStoreSession = MemoryStore(session);
  app.use(
    session({
      secret: "movie-watch-list-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { secure: false, maxAge: 86400000 }, // 24 hours
      store: new MemoryStoreSession({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;

      return res.status(200).json({ 
        id: user.id,
        username: user.username
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.status(200).json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ 
      id: user.id,
      username: user.username
    });
  });

  // OMDB API routes
  app.get("/api/movies/search", requireAuth, async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
      const data = await response.json();

      if (data.Response === "False") {
        return res.status(200).json({ results: [] });
      }

      return res.status(200).json({ results: data.Search });
    } catch (error) {
      console.error("Movie search error:", error);
      return res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get("/api/movies/:imdbId", requireAuth, async (req, res) => {
    try {
      const { imdbId } = req.params;
      const userId = req.session.userId as number;

      // First check if movie exists in our database
      let movie = await storage.getMovieByImdbId(imdbId);

      if (!movie) {
        // Fetch from OMDB API
        const response = await fetch(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`);
        const omdbMovie = await response.json() as OmdbDetailedMovie;

        if (omdbMovie.Response === "False") {
          return res.status(404).json({ message: "Movie not found" });
        }

        // Save to database
        movie = await storage.createMovie({
          imdbId: omdbMovie.imdbID,
          title: omdbMovie.Title,
          year: omdbMovie.Year,
          director: omdbMovie.Director,
          poster: omdbMovie.Poster,
          plot: omdbMovie.Plot,
          runtime: omdbMovie.Runtime,
          genre: omdbMovie.Genre,
          actors: omdbMovie.Actors
        });
      }

      // Get user-specific data
      const watchList = await storage.getWatchListForUser(userId);
      const watchedList = await storage.getWatchedListForUser(userId);

      const inWatchList = watchList.some(item => item.id === movie!.id);
      const watchedItem = watchedList.find(item => item.id === movie!.id);

      return res.status(200).json({
        ...movie,
        inWatchList,
        inWatchedList: !!watchedItem,
        watchedDate: watchedItem?.watchedDate,
        review: watchedItem?.review,
        order: watchList.find(item => item.id === movie!.id)?.order
      });
    } catch (error) {
      console.error("Get movie error:", error);
      return res.status(500).json({ message: "Failed to get movie details" });
    }
  });

  // Watch list routes
  app.get("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const watchList = await storage.getWatchListForUser(userId);

      return res.status(200).json(watchList);
    } catch (error) {
      console.error("Get watch list error:", error);
      return res.status(500).json({ message: "Failed to get watch list" });
    }
  });

  app.post("/api/watchlist", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;

      // Validate request
      let data;
      try {
        data = insertWatchListSchema.parse({
          ...req.body,
          userId
        });
      } catch (e) {
        if (e instanceof ZodError) {
          return res.status(400).json({ 
            message: "Invalid data", 
            errors: zodToValidationError(e).details 
          });
        }
        throw e;
      }

      // Get current watch list to determine order
      const currentWatchList = await storage.getWatchListForUser(userId);
      const order = (currentWatchList.length > 0) 
        ? Math.max(...currentWatchList.map(item => item.order || 0)) + 1 
        : 1;

      const result = await storage.addToWatchList({
        ...data,
        order
      });

      return res.status(201).json(result);
    } catch (error) {
      console.error("Add to watch list error:", error);
      return res.status(500).json({ message: "Failed to add to watch list" });
    }
  });

  app.delete("/api/watchlist/:movieId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const movieId = parseInt(req.params.movieId, 10);

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      await storage.removeFromWatchList(userId, movieId);

      return res.status(200).json({ message: "Removed from watch list" });
    } catch (error) {
      console.error("Remove from watch list error:", error);
      return res.status(500).json({ message: "Failed to remove from watch list" });
    }
  });

  app.put("/api/watchlist/order", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const { movieIds } = req.body;

      if (!Array.isArray(movieIds)) {
        return res.status(400).json({ message: "movieIds must be an array" });
      }

      await storage.updateWatchListOrder(userId, movieIds);

      return res.status(200).json({ message: "Watch list order updated" });
    } catch (error) {
      console.error("Update watch list order error:", error);
      return res.status(500).json({ message: "Failed to update watch list order" });
    }
  });

  // Watched list routes
  app.get("/api/watchedlist", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const watchedList = await storage.getWatchedListForUser(userId);

      return res.status(200).json(watchedList);
    } catch (error) {
      console.error("Get watched list error:", error);
      return res.status(500).json({ message: "Failed to get watched list" });
    }
  });

  app.post("/api/watchedlist", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;

      // Validate request
      let data;
      try {
        data = insertWatchedListSchema.parse({
          ...req.body,
          userId
        });
      } catch (e) {
        if (e instanceof ZodError) {
          return res.status(400).json({ 
            message: "Invalid data", 
            errors: zodToValidationError(e).details 
          });
        }
        throw e;
      }

      const result = await storage.addToWatchedList(data);

      return res.status(201).json(result);
    } catch (error) {
      console.error("Add to watched list error:", error);
      return res.status(500).json({ message: "Failed to add to watched list" });
    }
  });

  app.put("/api/watchedlist/:movieId/review", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const movieId = parseInt(req.params.movieId, 10);
      const { review } = req.body;

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      if (typeof review !== 'string' || review.length > 140) {
        return res.status(400).json({ message: "Review must be a string with max 140 characters" });
      }

      await storage.updateReview(userId, movieId, review);

      return res.status(200).json({ message: "Review updated" });
    } catch (error) {
      console.error("Update review error:", error);
      return res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/watchedlist/:movieId", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const movieId = parseInt(req.params.movieId, 10);

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      await storage.removeFromWatchedList(userId, movieId);
      return res.status(200).json({ message: "Removed from watched list" });
    } catch (error) {
      console.error("Remove from watched list error:", error);
      return res.status(500).json({ message: "Failed to remove from watched list" });
    }
  });

  app.post("/api/movies/:movieId/move-to-watched", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const movieId = parseInt(req.params.movieId, 10);
      const { review } = req.body;

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      if (review && (typeof review !== 'string' || review.length > 140)) {
        return res.status(400).json({ message: "Review must be a string with max 140 characters" });
      }

      await storage.moveToWatched(userId, movieId, review);

      return res.status(200).json({ message: "Moved to watched list" });
    } catch (error) {
      console.error("Move to watched error:", error);
      return res.status(500).json({ message: "Failed to move to watched list" });
    }
  });

  // CSV Export
  app.get("/api/export/csv", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId as number;
      const watchedList = await storage.getWatchedListForUser(userId);

      // Prepare data for CSV
      const csvData = [
        ...watchedList.map(movie => ({
          title: movie.title,
          year: movie.year,
          director: movie.director,
          list: "Watched",
          order: "",
          watchedDate: movie.watchedDate ? new Date(movie.watchedDate).toISOString().split('T')[0] : "",
          review: movie.review || ""
        }))
      ];

      // Generate CSV
      const fields = ['title', 'year', 'director', 'list', 'order', 'watchedDate', 'review'];
      const parser = new Parser({ fields });
      const csv = parser.parse(csvData);

      // Set headers for file download
      res.setHeader('Content-Disposition', 'attachment; filename=movie-watch-list.csv');
      res.setHeader('Content-Type', 'text/csv');

      return res.status(200).send(csv);
    } catch (error) {
      console.error("CSV export error:", error);
      return res.status(500).json({ message: "Failed to export CSV" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

const { fromZodError } = await import("zod-validation-error");
const { insertUserSchema, insertMovieSchema, insertWatchListSchema, insertWatchedListSchema } = await import("@shared/schema");

const zodToValidationError = (error: ZodError) => fromZodError(error);