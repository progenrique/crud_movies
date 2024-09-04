import { Router } from "express";

export const moviesRouter = Router();

moviesRouter.get("/", (req, res) => {
  res.send("expres funcionando");
});
