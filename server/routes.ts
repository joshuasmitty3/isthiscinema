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
// import session from "express-session"; // Removed
// import MemoryStore from "memorystore"; // Removed
import { Parser } from "json2csv";

export function setupWatchListRoutes(app: Express) {
  // Get watch list
  app.get("/api/watchlist", async (req: Request, res: Response) => {
    const movies = await storage.getWatchList(1); // Always use user ID 1
    res.json(movies);
  });

  // Remove from watch list
  app.delete("/api/watchlist/:movieId", async (req: Request, res: Response) => {
    await storage.removeFromWatchList(1, req.params.movieId); // Always use user ID 1
    res.json({ success: true });
  });

  // Reorder watch list
  app.post("/api/watchlist/reorder", async (req: Request, res: Response) => {
    const { movieId, direction } = req.body;
    await storage.reorderWatchList(1, movieId, direction); // Always use user ID 1
    res.json({ success: true });
  });
}

const OMDB_API_KEY = process.env.OMDB_API_KEY;

// Removed auth middleware - all requests now allowed

// Removed auth routes
// app.post("/api/login", async (req, res) => { ... });
// app.post("/api/logout", (req, res) => { ... });
// app.get("/api/me", async (req, res) => { ... });


export async function registerRoutes(app: Express): Promise<Server> {
  // Removed auth middleware - all requests now allowed

  // Removed auth routes
  app.post("/api/login", async (req, res) => {
    //This route is now a placeholder and does nothing.
    res.status(200).json({ message: "Login not implemented" });
  });

  app.post("/api/logout", (req, res) => {
      res.status(200).json({ message: "Logout not implemented" });
  });

  app.get("/api/me", async (req, res) => {
      res.status(200).json({ message: "Me route not implemented" });
  });

  // OMDB API routes
  app.get("/api/movies/search", async (req, res) => {
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

  app.get("/api/movies/:imdbId", async (req, res) => {
    try {
      const { imdbId } = req.params;
      // const userId = req.session.userId as number; // Removed

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
      const watchList = await storage.getWatchListForUser(1); // Always use user ID 1
      const watchedList = await storage.getWatchedListForUser(1); // Always use user ID 1

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
  app.get("/api/watchlist", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const watchList = await storage.getWatchListForUser(1); // Always use user ID 1

      return res.status(200).json(watchList);
    } catch (error) {
      console.error("Get watch list error:", error);
      return res.status(500).json({ message: "Failed to get watch list" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      // Validate request
      let data;
      try {
        data = insertWatchListSchema.parse({
          ...req.body,
          userId: 1 // Always use user ID 1
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
      const currentWatchList = await storage.getWatchListForUser(1); // Always use user ID 1
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

  app.delete("/api/watchlist/:movieId", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const movieId = parseInt(req.params.movieId, 10);

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      await storage.removeFromWatchList(1, movieId); // Always use user ID 1

      return res.status(200).json({ message: "Removed from watch list" });
    } catch (error) {
      console.error("Remove from watch list error:", error);
      return res.status(500).json({ message: "Failed to remove from watch list" });
    }
  });

  app.put("/api/watchlist/order", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const { movieIds } = req.body;

      if (!Array.isArray(movieIds)) {
        return res.status(400).json({ message: "movieIds must be an array" });
      }

      await storage.updateWatchListOrder(1, movieIds); // Always use user ID 1

      return res.status(200).json({ message: "Watch list order updated" });
    } catch (error) {
      console.error("Update watch list order error:", error);
      return res.status(500).json({ message: "Failed to update watch list order" });
    }
  });

  // Watched list routes
  app.get("/api/watchedlist", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const watchedList = await storage.getWatchedListForUser(1); // Always use user ID 1

      return res.status(200).json(watchedList);
    } catch (error) {
      console.error("Get watched list error:", error);
      return res.status(500).json({ message: "Failed to get watched list" });
    }
  });

  app.post("/api/watchedlist", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed

      // Validate request
      let data;
      try {
        data = insertWatchedListSchema.parse({
          ...req.body,
          userId: 1 // Always use user ID 1
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

  app.put("/api/watchedlist/:movieId/review", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const movieId = parseInt(req.params.movieId, 10);
      const { review } = req.body;

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      if (typeof review !== 'string' || review.length > 140) {
        return res.status(400).json({ message: "Review must be a string with max 140 characters" });
      }

      await storage.updateReview(1, movieId, review); // Always use user ID 1

      return res.status(200).json({ message: "Review updated" });
    } catch (error) {
      console.error("Update review error:", error);
      return res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/watchedlist/:movieId", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const movieId = parseInt(req.params.movieId, 10);

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      await storage.removeFromWatchedList(1, movieId); // Always use user ID 1
      return res.status(200).json({ message: "Removed from watched list" });
    } catch (error) {
      console.error("Remove from watched list error:", error);
      return res.status(500).json({ message: "Failed to remove from watched list" });
    }
  });

  app.post("/api/movies/:movieId/move-to-watched", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const movieId = parseInt(req.params.movieId, 10);
      const { review } = req.body;

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }

      if (review && typeof review !== 'string') {
        return res.status(400).json({ message: "Review must be a string" });
      }

      if (review && review.length > 140) {
        return res.status(400).json({ message: "Review must not exceed 140 characters" });
      }

      await storage.moveToWatched(1, movieId, review); // Always use user ID 1
      console.log(`User 1 moved movie ${movieId} to watched list`); // Always use user ID 1

      return res.status(200).json({ message: "Moved to watched list" });
    } catch (error: any) {
      console.error("Move to watched error:", error);
      if (error.message === 'Movie not found in watch list') {
        return res.status(404).json({ message: error.message });
      }
      return res.status(500).json({ message: "Failed to move to watched list" });
    }
  });

  // CSV Export
  app.get("/api/export/csv", async (req, res) => {
    try {
      // const userId = req.session.userId as number; // Removed
      const watchedList = await storage.getWatchedListForUser(1); // Always use user ID 1

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