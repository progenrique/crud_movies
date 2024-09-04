import { getAllMovies } from "../model/model_novies.js";

export const moviesController = {
  getAllMovies: async (req, res) => {
    const movies = await getAllMovies();

    res.send(movies);
  },
};
