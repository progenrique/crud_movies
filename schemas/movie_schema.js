import z from "zod";

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "el titulo debe ser un string",
    required_error: "campo requerido",
  }),
  year: z.number().min(1880).max(2024).int(),
  director: z.string({
    invalid_type_error: "el titulo debe ser un string",
    required_error: "campo requerido",
  }),
  duration: z.number().min(0).int(),
  poster: z.string().url({
    invalid_type_error: "se espera un string",
    required_error: "campo requerido",
  }),
  genres: z.array(
    z.enum([
      "Drama",
      "Action",
      "Crime",
      "Adventure",
      "Sci-Fi",
      "Romance",
      "animation",
      "biography",
      "Fantasy",
    ])
  ),
  rate: z.number().min(0).max(10),
});

export const validacion = (obj) => movieSchema.safeParse(obj);
export const validacionPartial = (obj) => movieSchema.partial().safeParse(obj);
