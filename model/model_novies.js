import msql from "mysql2/promise";

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
  //console.log(movies);
  return movies;
};

export const getMoviesById = async (id) => {
  const [[result]] = await connection.query(
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
  return result;
};

export const getMovieByGenre = async (genre) => {
  if (genre) {
    const lowerCaseGenre = genre.toLowerCase();
    const [genres] = await connection.query(
      `SELECT genre_id AS id,genre AS genre_name from genre WHERE genre= ?;`,
      [lowerCaseGenre]
    );
    if (genres.length <= 0) return [];

    const [{ id }] = genres;
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
  }
};

export const addMovie = async (newMovie) => {
  const { id, title, year, director, duration, poster, rate, genres } =
    newMovie;

  const ids = await getIdsGenres(genres);

  const [resultMovie] = await connection.query(
    `INSERT INTO movies (id, title, year, director, duration, poster, rate) VALUES 
  (UUID_TO_BIN(?),?,?,?,?,?,?);`,
    [id, title, year, director, duration, poster, rate]
  );
  console.log(resultMovie);

  const requestMovie_genre = `INSERT INTO movies_genre (movies_id,genre_id) VALUES
    ${ids.map((el) => `(UUID_TO_BIN("${id}"),${el})`).join(",")};`;

  const [resultMovie_genre] = await connection.query(requestMovie_genre);
  console.log(resultMovie_genre);
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

    if (!oldMovie) throw { message: `movie no found`, status: 404 };

    const updateMovie = {};

    const ordenNewMovie = newMovie.genres.sort();

    const updateGenres = oldMovie.genres
      .sort()
      .every((genre, index) => genre === ordenNewMovie[index]);

    //console.log(updateGenres ? "no hay cambios" : ` si hay ${newMovie.genres}`);

    for (const key in oldMovie) {
      if (key != "genres") {
        if (JSON.stringify(oldMovie[key]) !== JSON.stringify(newMovie[key])) {
          if (newMovie[key]) {
            updateMovie[key] = newMovie[key];
          }
        }
      }
    }

    //console.log(updateMovie);

    if (Object.keys(updateMovie).length === 0 && updateGenres)
      return { message: `No changes detected`, status: 204 };

    if (!updateGenres) {
      await connection.query(
        ` DELETE FROM movies_genre WHERE movies_id =  UUID_TO_BIN(?);`,
        [id]
      );

      const ids = await getIdsGenres(newMovie.genres);

      const addGenres = `INSERT INTO movies_genre (movies_id,genre_id) VALUES
        ${ids.map((el) => `(UUID_TO_BIN("${id}"),${el})`).join(",")};`;

      const [resultMovie_genre] = await connection.query(addGenres);

      delete updateMovie.genres;
      return {
        message: "Movie updated successfully",
        affectedRows: resultMovie_genre.affectedRows,
      };
    }

    if (Object.keys(updateMovie).length > 0) {
      //console.log(updateMovie);
      const [resultMovie] = await connection.query(
        `UPDATE movies SET ? WHERE id = UUID_TO_BIN(?);`,
        [updateMovie, id]
      );
      return resultMovie;
    }
    return oldMovie;
  } catch (error) {
    return error;
  }
};

export const deleteMovie = async (id) => {
  const [resultGenres] = await connection.query(
    `DELETE FROM movies_genre WHERE movies_id = UUID_TO_BIN(?);`,
    [id]
  );
  const [resultMovies] = await connection.query(
    `DELETE FROM movies WHERE id = UUID_TO_BIN(?);`,
    [id]
  );

  if (resultGenres.affectedRows > 0) {
    return { mesage: `movie delete ok`, status: 200 };
  } else if (resultMovies.affectedRows > 0) {
    return { mesage: `movie delete ok`, status: 200 };
  } else {
    return { mesage: `id no found`, status: 404 };
  }
};
