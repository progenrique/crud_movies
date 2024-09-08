import {
  getAllMovies,
  getMoviesById,
  getMovieByGenre,
  addMovie,
  updateMovie,
  deleteMovie,
} from "../model/model_novies.js";
import { validacion, validacionPartial } from "../schemas/movie_schema.js";
import crypto from "node:crypto";

export const moviesController = {
  getAllMovies: async (req, res) => {
    const movies = await getAllMovies();

    res.send(movies);
  },
  getMoviesById: async (req, res) => {
    const movie = await getMoviesById(req.params.id);
    res.send(movie);
  },
  getMovieByGenre: async (req, res) => {
    const movie = await getMovieByGenre(req.params.genre);
    res.send(movie);
  },
  addMovie: async (req, res) => {
    const result = validacion(req.body);
    if (result.success == false) return res.status(400).send(result.error);

    const newMovie = {
      id: crypto.randomUUID(),
      ...result.data,
    };

    const response = await addMovie(newMovie);
    res.send(response);
  },
  updateMovie: async (req, res) => {
    const genres = req.body.genres.map(
      (genre) => genre.charAt(0).toUpperCase() + genre.slice(1)
    );
    const newBody = { ...req.body, genres };

    let result = validacionPartial(newBody);

    if (result.success == false) return res.status(400).send(result.error);
    const response = await updateMovie(req.params.id, result.data);
    res.send(response);
  },
  deleteMovie: async (req, res) => {
    const response = await deleteMovie(req.params.id);
    res.send(response);
  },
};
