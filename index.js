import express from "express";

const PUERTO = process.env.PORT || 3000;
const app = express();

app.disable("x-powered-by");

app.get("/", (req, res) => {
  res.send("expres funcionando");
});

app.listen(PUERTO, () => {
  console.log(
    `el servidor esta ecuchando en el el puerto http://localhost:${PUERTO}`
  );
});
