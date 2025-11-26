import { Schema, model } from "mongoose";

const bookSchema = new Schema({
  title: String,
  author: String,
  available: { type: Boolean, default: true }
});

export const Book = model("Book", bookSchema);
