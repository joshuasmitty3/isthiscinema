CREATE TABLE "movies" (
	"id" serial PRIMARY KEY NOT NULL,
	"imdb_id" text NOT NULL,
	"title" text NOT NULL,
	"year" text NOT NULL,
	"director" text NOT NULL,
	"poster" text NOT NULL,
	"plot" text NOT NULL,
	"runtime" text,
	"genre" text,
	"actors" text,
	CONSTRAINT "movies_imdb_id_unique" UNIQUE("imdb_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "watch_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"order" integer NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "watched_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"movie_id" integer NOT NULL,
	"watched_date" timestamp DEFAULT now(),
	"review" text,
	"rating" integer
);
