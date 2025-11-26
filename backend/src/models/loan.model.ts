import { Schema, model } from "mongoose";

const loanSchema = new Schema({
  userId: String,
  bookId: String,
  date: { type: Date, default: Date.now }
});

export const Loan = model("Loan", loanSchema);
