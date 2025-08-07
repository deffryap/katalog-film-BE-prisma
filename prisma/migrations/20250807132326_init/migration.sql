-- CreateTable
CREATE TABLE "public"."Movie" (
    "id" SERIAL NOT NULL,
    "Title" TEXT NOT NULL,
    "Year" TEXT NOT NULL,
    "imdbID" TEXT NOT NULL,
    "Type" TEXT NOT NULL,
    "Poster" TEXT DEFAULT 'N/A',
    "Plot" TEXT,
    "Director" TEXT,
    "Actors" TEXT,
    "Genre" TEXT,
    "Runtime" TEXT,
    "TrailerURL" TEXT,

    CONSTRAINT "Movie_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Movie_imdbID_key" ON "public"."Movie"("imdbID");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");
