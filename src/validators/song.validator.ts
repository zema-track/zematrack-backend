import z from "zod";
import { Genre } from "../models";

export const songSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artist: z.string().min(1, "Artist is required"),
  album: z.string().optional(),
  genre: z.nativeEnum(Genre),
})


export const songUpdateSchema = z.object({
  title: z.string().optional(),
  artist: z.string().optional(),
  album: z.string().optional(),
  genre: z.nativeEnum(Genre).optional(),
})

export const songFilterSchema = z.object({
  genre: z.nativeEnum(Genre).optional(),
})
