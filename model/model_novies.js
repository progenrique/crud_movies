import msql from "mysql2/promise";

const config = {
  host: "bk8spwyixe1h8nizlfsh-mysql.services.clever-cloud.com",
  user: "uwcn0pghsmkpwzi8",
  port: 3306,
  password: "eXVgnIfa95EMMwCRmBTC",
  database: "bk8spwyixe1h8nizlfsh",
};

const connection = await msql.createConnection(config);

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
