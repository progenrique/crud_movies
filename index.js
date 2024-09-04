import express from "express";
import { movieRouter } from "./router/router_movies.js";

const PUERTO = process.env.PORT || 3000;
const app = express();

app.disable("x-powered-by");

app.use("/movies", movieRouter);

app.listen(PUERTO, () => {
  console.log(
    `el servidor esta ecuchando en el el puerto http://localhost:${PUERTO}`
  );
});
