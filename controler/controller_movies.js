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
    if (movie.length === 0)
      return res.status(404).end(`no hay pelicula con el genero ${genre}`);
    res.send(movie);
  },
  addMovie: (req, res) => {
    const result = validacion(req.body);
    if (result.success == false) return res.status(400).send(result.error);

    const newMovie = {
      id: crypto.randomUUID(),
      ...result.data,
    };

    res.send(newMovie);
    addMovie(newMovie);
  },
  updateMovie: async (req, res) => {
    const id = req.params.id;
    const genres = req.body.genres.map(
      (genre) => genre.charAt(0).toUpperCase() + genre.slice(1)
    );
    const newBody = { ...req.body, genres };

    let result = validacionPartial(newBody);

    if (result.success == false) return res.status(400).send(result.error);
    const oldMovie = await updateMovie(id, result.data);

    res.send(oldMovie);
  },
  deleteMovie: async (req, res) => {
    const id = req.params.id;
    const response = await deleteMovie(id);
    res.send(response);
  },
};
