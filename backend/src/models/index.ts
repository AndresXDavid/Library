import { Schema, model } from "mongoose";

// USER MODEL
const userSchema = new Schema({
     name: { type: String, required: true },
     email: { type: String, required: true, unique: true },
     password: { type: String, required: true },
     role: { type: String, enum: ["user", "staff", "admin"], default: "user" },
     document: { type: String },
     phone: { type: String },
     maxLoans: { type: Number, default: 3 },
     registrationDate: { type: Date, default: Date.now },
     active: { type: Boolean, default: true }
});

export const User = model("User", userSchema);

// BOOK MODEL
const bookSchema = new Schema({
     isbn: { type: String },
     title: { type: String, required: true },
     author: { type: String, required: true },
     editorial: { type: String },
     year: { type: Number },
     category: { type: String },
     totalCopies: { type: Number, default: 1 },
     availableCopies: { type: Number, default: 1 },
     location: { type: String },
     imageUrl: { type: String },
     description: { type: String },
     createdAt: { type: Date, default: Date.now }
});

export const Book = model("Book", bookSchema);

// LOAN MODEL
const loanSchema = new Schema({
     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
     bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
     loanDate: { type: Date, default: Date.now },
     returnDeadline: { type: Date, required: true },
     actualReturnDate: { type: Date },
     status: { type: String, enum: ["active", "returned", "overdue"], default: "active" },
     fine: { type: Number, default: 0 }
});

export const Loan = model("Loan", loanSchema);

// RESERVATION MODEL
const reservationSchema = new Schema({
     userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
     bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
     reservationDate: { type: Date, default: Date.now },
     status: { type: String, enum: ["pending", "notified", "cancelled"], default: "pending" },
     notificationSent: { type: Boolean, default: false }
});

export const Reservation = model("Reservation", reservationSchema);

// EVENT MODEL
const eventSchema = new Schema({
     title: { type: String, required: true },
     description: { type: String },
     date: { type: Date, required: true },
     maxCapacity: { type: Number, required: true },
     availableSpots: { type: Number, required: true },
     location: { type: String },
     participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
     createdBy: { type: Schema.Types.ObjectId, ref: "User" },
     createdAt: { type: Date, default: Date.now }
});

export const Event = model("Event", eventSchema);

// AUDIT LOG MODEL
const auditLogSchema = new Schema({
     userId: { type: Schema.Types.ObjectId, ref: "User" },
     action: { type: String, required: true },
     description: { type: String, required: true },
     timestamp: { type: Date, default: Date.now },
     ipAddress: { type: String }
});

export const AuditLog = model("AuditLog", auditLogSchema);