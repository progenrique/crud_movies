import express from "express";
import { movieRouter } from "./router/router_movies.js";
import { corsMiddleware } from "./middleware/cors.js";

const PUERTO = process.env.PORT || 3000;
const app = express();

app.disable("x-powered-by");

//app.use(express.json())

app.use(corsMiddleware());

app.use("/movies", movieRouter);

app.listen(PUERTO, () => {
  console.log(
    `el servidor esta ecuchando en el el puerto http://localhost:${PUERTO}`
  );
});
