import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { requireAuth, verifyPassword, hashPassword } from "./auth";
import {
  insertMovieSchema,
  insertWatchListSchema,
  insertWatchedListSchema,
  type OmdbDetailedMovie,
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import fetch from "node-fetch";
import { Parser } from "json2csv";

const OMDB_API_KEY = process.env.OMDB_API_KEY;

const zodToValidationError = (error: ZodError) => fromZodError(error);

function userId(req: Request): number {
  return (req.session as any).userId as number;
}

async function migrateLegacyDataIfNeeded(newUserId: number): Promise<void> {
  if (newUserId === 1) return;
  const legacyUser = await storage.getUser(1);
  if (!legacyUser) {
    await storage.migrateUserData(1, newUserId);
  }
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Auth routes (public)
  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const user = await storage.getUserByUsername(username);
    if (!user || !(await verifyPassword(password, user.password))) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    (req.session as any).userId = user.id;
    await migrateLegacyDataIfNeeded(user.id);
    return res.status(200).json({ id: user.id, username: user.username });
  });

  app.post("/api/logout", (req, res) => {
    req.session = null;
    res.status(200).json({ message: "Logged out" });
  });

  app.get("/api/me", async (req, res) => {
    const id = (req.session as any).userId;
    if (!id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    await migrateLegacyDataIfNeeded(user.id);
    return res.status(200).json({ id: user.id, username: user.username });
  });

  // First-time setup: only works when no users exist yet
  app.post("/api/setup", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(403).json({ message: "Setup already complete" });
    }
    const hashed = await hashPassword(password);
    const user = await storage.createUser({ username, password: hashed });
    (req.session as any).userId = user.id;
    await migrateLegacyDataIfNeeded(user.id);
    return res.status(201).json({ id: user.id, username: user.username });
  });

  // Temporary debug endpoint — public so we can diagnose auth/data issues
  app.get("/api/debug/db-state", async (req, res) => {
    const { db } = await import("./db");
    const { users, watchList, watchedList } = await import("@shared/schema");
    const { count } = await import("drizzle-orm");

    const allUsers = await db.select({ id: users.id, username: users.username }).from(users);

    const watchCounts = await db
      .select({ userId: watchList.userId, count: count() })
      .from(watchList)
      .groupBy(watchList.userId);

    const watchedCounts = await db
      .select({ userId: watchedList.userId, count: count() })
      .from(watchedList)
      .groupBy(watchedList.userId);

    return res.json({
      sessionUserId: (req.session as any)?.userId ?? null,
      usersInDb: allUsers,
      watchListByUserId: watchCounts,
      watchedListByUserId: watchedCounts,
    });
  });

  // All routes below require authentication
  app.use("/api", requireAuth);

  // OMDB API routes
  app.get("/api/movies/search", async (req, res) => {
    try {
      const { query } = req.query;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ message: "Search query is required" });
      }

      const response = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&s=${encodeURIComponent(query)}&type=movie`);
      const data = await response.json();

      if ((data as any).Response === "False") {
        return res.status(200).json({ results: [] });
      }

      return res.status(200).json({ results: (data as any).Search });
    } catch (error) {
      console.error("Movie search error:", error);
      return res.status(500).json({ message: "Failed to search movies" });
    }
  });

  app.get("/api/movies/:imdbId", async (req, res) => {
    try {
      const { imdbId } = req.params;
      const uid = userId(req);

      let movie = await storage.getMovieByImdbId(imdbId);

      if (!movie) {
        const response = await fetch(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&i=${imdbId}&plot=full`);
        const omdbMovie = await response.json() as OmdbDetailedMovie;

        if (omdbMovie.Response === "False") {
          return res.status(404).json({ message: "Movie not found" });
        }

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

      const watchList = await storage.getWatchListForUser(uid);
      const watchedList = await storage.getWatchedListForUser(uid);

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
      const watchList = await storage.getWatchListForUser(userId(req));
      return res.status(200).json(watchList);
    } catch (error) {
      console.error("Get watch list error:", error);
      return res.status(500).json({ message: "Failed to get watch list" });
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      let data;
      try {
        data = insertWatchListSchema.parse({
          ...req.body,
          userId: userId(req)
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

      const currentWatchList = await storage.getWatchListForUser(userId(req));
      const order = (currentWatchList.length > 0)
        ? Math.max(...currentWatchList.map(item => item.order || 0)) + 1
        : 1;

      const result = await storage.addToWatchList({ ...data, order });
      return res.status(201).json(result);
    } catch (error) {
      console.error("Add to watch list error:", error);
      return res.status(500).json({ message: "Failed to add to watch list" });
    }
  });

  app.delete("/api/watchlist/:movieId", async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId, 10);
      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      await storage.removeFromWatchList(userId(req), movieId);
      return res.status(200).json({ message: "Removed from watch list" });
    } catch (error) {
      console.error("Remove from watch list error:", error);
      return res.status(500).json({ message: "Failed to remove from watch list" });
    }
  });

  app.put("/api/watchlist/order", async (req, res) => {
    try {
      const { movieIds } = req.body;
      if (!Array.isArray(movieIds)) {
        return res.status(400).json({ message: "movieIds must be an array" });
      }
      await storage.updateWatchListOrder(userId(req), movieIds);
      return res.status(200).json({ message: "Watch list order updated" });
    } catch (error) {
      console.error("Update watch list order error:", error);
      return res.status(500).json({ message: "Failed to update watch list order" });
    }
  });

  // Watched list routes
  app.get("/api/watchedlist", async (req, res) => {
    try {
      const watchedList = await storage.getWatchedListForUser(userId(req));
      return res.status(200).json(watchedList);
    } catch (error) {
      console.error("Get watched list error:", error);
      return res.status(500).json({ message: "Failed to get watched list" });
    }
  });

  app.post("/api/watchedlist", async (req, res) => {
    try {
      let data;
      try {
        data = insertWatchedListSchema.parse({
          ...req.body,
          userId: userId(req)
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
      const movieId = parseInt(req.params.movieId, 10);
      const { review } = req.body;

      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      if (typeof review !== 'string' || review.length > 140) {
        return res.status(400).json({ message: "Review must be a string with max 140 characters" });
      }
      await storage.updateReview(userId(req), movieId, review);
      return res.status(200).json({ message: "Review updated" });
    } catch (error) {
      console.error("Update review error:", error);
      return res.status(500).json({ message: "Failed to update review" });
    }
  });

  app.delete("/api/watchedlist/:movieId", async (req, res) => {
    try {
      const movieId = parseInt(req.params.movieId, 10);
      if (isNaN(movieId)) {
        return res.status(400).json({ message: "Invalid movie ID" });
      }
      await storage.removeFromWatchedList(userId(req), movieId);
      return res.status(200).json({ message: "Removed from watched list" });
    } catch (error) {
      console.error("Remove from watched list error:", error);
      return res.status(500).json({ message: "Failed to remove from watched list" });
    }
  });

  app.post("/api/movies/:movieId/move-to-watched", async (req, res) => {
    try {
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

      await storage.moveToWatched(userId(req), movieId, review);
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
      const watchedList = await storage.getWatchedListForUser(userId(req));

      const csvData = watchedList.map(movie => ({
        title: movie.title,
        year: movie.year,
        director: movie.director,
        list: "Watched",
        order: "",
        watchedDate: movie.watchedDate ? new Date(movie.watchedDate).toISOString().split('T')[0] : "",
        review: movie.review || ""
      }));

      const fields = ['title', 'year', 'director', 'list', 'order', 'watchedDate', 'review'];
      const parser = new Parser({ fields });
      const csv = parser.parse(csvData);

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
