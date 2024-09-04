import { Router } from "express";
import { moviesController } from "../controler/controller_movies.js";

export const movieRouter = Router();

movieRouter.get("/", moviesController.getAllMovies);
/* 
movieRouter.get("/id/:id", moviesController.getMoviesById);

movieRouter.get("/genre/:genre", moviesController.getMovieByGenre);

movieRouter.post("/", moviesController.addMovie);

movieRouter.patch("/:id", moviesController.updateMovie);

movieRouter.delete("/:id", moviesController.deleteMovie); */
