import msql from "mysql2/promise";
import { compareArrays } from "../utilitis/compareArrays.js";

const config = {
  host: "bk8spwyixe1h8nizlfsh-mysql.services.clever-cloud.com",
  user: "uwcn0pghsmkpwzi8",
  port: 3306,
  password: "eXVgnIfa95EMMwCRmBTC",
  database: "bk8spwyixe1h8nizlfsh",
};

const connection = await msql.createConnection(config);

const getIdsGenres = async (genres) => {
  /* obtener los id de genre para insertarlo en la tabla movies_renge */
  // se le pasa un aray con el nombre de los generos que va a buscar
  const requestIdGenres = `select genre_id from genre where genre.genre IN (${genres
    .map((el) => "?")
    .join(",")});`;

  const [genres_id] = await connection.query(requestIdGenres, genres);
  const ids = genres_id.map((el) => el.genre_id);
  return ids;
};

export const getAllMovies = async () => {
  const [movies] = await connection.query(`SELECT 
  BIN_TO_UUID(id) id, 
  title, 
  year, 
  director, 
  duration,
  poster, 
  rate,
  JSON_ARRAYAGG(genre.genre) as genres
  FROM movies
  JOIN movies_genre ON movies.id=movies_genre.movies_id
  JOIN genre ON movies_genre.genre_id=genre.genre_id
  GROUP BY ID;`);
  return movies;
};

export const getMoviesById = async (id) => {
  const [result] = await connection.query(
    `SELECT 
  BIN_TO_UUID(id) id, 
  title, 
  year, 
  director, 
  duration,
  poster, 
  rate,
  JSON_ARRAYAGG(genre.genre) as genres
  FROM movies
  JOIN movies_genre ON movies.id=movies_genre.movies_id
  JOIN genre ON movies_genre.genre_id=genre.genre_id
  where id = UUID_TO_BIN(?)
  GROUP BY ID;`,
    [id]
  );
  if (result.length === 0) return { status: 404, mesage: "movie no found" };
  return result[0];
};

export const getMovieByGenre = async (genre) => {
  const lowerCaseGenre = genre.toLowerCase();
  console.log(lowerCaseGenre);
  const id = await getIdsGenres([lowerCaseGenre]);

  if (id.length === 0) return { status: 404, mesage: "Genre no found" };

  const [movies] = await connection.query(
    `SELECT 
  BIN_TO_UUID(id) id, 
  title, 
  year, 
  director, 
  duration,
  poster, 
  rate,
  JSON_ARRAYAGG(genre.genre) as genres
  FROM movies
  JOIN movies_genre ON movies.id=movies_genre.movies_id
  JOIN genre ON movies_genre.genre_id=genre.genre_id
  group by id
  HAVING COUNT(CASE WHEN genre.genre_id = ? THEN 1 END) > 0;`,
    [id]
  );
  return movies;
};

export const addMovie = async (newMovie) => {
  try {
    const { id, title, year, director, duration, poster, rate, genres } =
      newMovie;

    const ids = await getIdsGenres(genres);

    const [resultMovie] = await connection.query(
      `INSERT INTO movies (id, title, year, director, duration, poster, rate) VALUES 
(UUID_TO_BIN(?),?,?,?,?,?,?);`,
      [id, title, year, director, duration, poster, rate]
    );

    const requestMovie_genre = `INSERT INTO movies_genre (movies_id,genre_id) VALUES
${ids.map((el) => `(UUID_TO_BIN("${id}"),${el})`).join(",")};`;

    const [resultMovie_genre] = await connection.query(requestMovie_genre);
    return [
      {
        movie: "ok",
        status: 200,
        mesage: `movie add ok`,
        resultMovie: resultMovie.affectedRows,
      },
      {
        genre: "ok",
        status: 200,
        mesage: `genres add ok`,
        resultMovie_genre: resultMovie_genre.affectedRows,
      },
      newMovie,
    ];
  } catch (error) {
    return error;
  }
};

export const updateMovie = async (id, newMovie) => {
  try {
    const [[oldMovie]] = await connection.query(
      `SELECT 
    BIN_TO_UUID(id) id, 
    title, 
    year, 
    director, 
    duration,
    poster, 
    rate,
    JSON_ARRAYAGG(genre.genre) as genres
    FROM movies
    JOIN movies_genre ON movies.id=movies_genre.movies_id
    JOIN genre ON movies_genre.genre_id=genre.genre_id
    where BIN_TO_UUID(id) = ?
    group by id`,
      [id]
    );

    if (!oldMovie) return { message: `movie no found`, status: 404 };

    const updateMovie = {};
    let response = {};

    const compareGenres = compareArrays(oldMovie.genres, newMovie.genres);

    //compara todos los campos de la old movie con los de la newmovie excluyendo el campo genre y verificando si en la new movie existe el campo key
    // se crea un nuevo objeto solo con los valores que se van a actualizar para evitar consulas en la bd
    //y solo actualizar los que sea nesesarios y no toda la movie
    for (const key in oldMovie) {
      if (key != "genres") {
        if (JSON.stringify(oldMovie[key]) !== JSON.stringify(newMovie[key])) {
          if (newMovie[key]) {
            updateMovie[key] = newMovie[key];
          }
        }
      }
    }

    // verificar si hay cambios si update movie tiene algo y si genre es true  en ese caso no hay cambios que hacer a la bd
    if (Object.keys(updateMovie).length === 0 && compareGenres)
      return { message: `No changes detected`, status: 204 };

    if (!compareGenres) {
      await connection.query(
        ` DELETE FROM movies_genre WHERE movies_id =  UUID_TO_BIN(?);`,
        [id]
      );

      const ids = await getIdsGenres(newMovie.genres);

      const addGenres = `INSERT INTO movies_genre (movies_id,genre_id) VALUES
        ${ids.map((el) => `(UUID_TO_BIN("${id}"),${el})`).join(",")};`;

      const [resultMovie_genre] = await connection.query(addGenres);

      delete updateMovie.genres;
      response = {
        ...response,
        genres: `ok`,
        status: 200,
        newGenres: newMovie.genres,
        message: "Genres updated successfully",
        affectedRows: resultMovie_genre.affectedRows,
      };
    }

    // si updateMovie tiene elementos se hace la actualizacion
    //nota en las peticiones se puede pasar un objeto y lo pone como clave valor  duration = 218
    if (Object.keys(updateMovie).length > 0) {
      const [resultMovie] = await connection.query(
        `UPDATE movies SET ? WHERE id = UUID_TO_BIN(?);`,
        [updateMovie, id]
      );
      response = {
        ...response,
        movie: `Ok`,
        status: 200,
        updatedFields: updateMovie,
        message: "movie updated successfully",
        affectedRows: resultMovie.affectedRows,
      };
    }
    return response;
  } catch (error) {
    return error;
  }
};

export const deleteMovie = async (id) => {
  const [resultMovies] = await connection.query(
    `DELETE FROM movies WHERE id = UUID_TO_BIN(?);`,
    [id]
  );

  if (resultMovies.affectedRows > 0) {
    return { mesage: `movie delete ok`, status: 200 };
  } else {
    return { mesage: `movie no found`, status: 404 };
  }
};
