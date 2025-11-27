import bcrypt from "bcryptjs";
// @ts-ignore - project has JS models without type declarations; require to avoid TS import error
const { User, Book, Loan, Reservation, Event, AuditLog } = require("../models");
import { createToken, requireRole } from "../core/auth";

interface Context {
  user: { id: string; role: string } | null;
}

// Helper para logging
async function logAction(userId: string | null, action: string, description: string) {
  try {
    await AuditLog.create({
      userId,
      action,
      description,
      timestamp: new Date()
    });
  } catch (err) {
    console.error("Error logging action:", err);
  }
}

export const resolvers = {
  Query: {
    me: async (_: any, __: any, { user }: Context) => {
      if (!user) return null;
      return await User.findById(user.id).lean();
    },

    // BOOKS
    books: async (_: any, args: { search?: string; category?: string; available?: boolean }) => {
      const filter: any = {};
      
      if (args.search) {
        filter.$or = [
          { title: { $regex: args.search, $options: "i" } },
          { author: { $regex: args.search, $options: "i" } }
        ];
      }
      
      if (args.category) {
        filter.category = args.category;
      }
      
      if (args.available !== undefined) {
        filter.availableCopies = args.available ? { $gt: 0 } : 0;
      }

      return await Book.find(filter).lean();
    },

    book: async (_: any, args: { id: string }) => {
      return await Book.findById(args.id).lean();
    },

    // LOANS
    loans: async (_: any, args: { userId?: string; status?: string }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const filter: any = {};
      if (args.userId) filter.userId = args.userId;
      if (args.status) filter.status = args.status;

      const loans = await Loan.find(filter)
        .populate("userId")
        .populate("bookId")
        .lean();

      return loans.map((loan: any) => ({
        ...loan,
        user: loan.userId,
        book: loan.bookId
      }));
    },

    myLoans: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");

      const loans = await Loan.find({ userId: user.id })
        .populate("bookId")
        .lean();

      return loans.map((loan: any) => ({
        ...loan,
        user: { id: user.id },
        book: loan.bookId
      }));
    },

    // RESERVATIONS
    reservations: async (_: any, args: { userId?: string }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      
      const filter: any = args.userId ? { userId: args.userId } : {};
      
      const reservations = await Reservation.find(filter)
        .populate("userId")
        .populate("bookId")
        .lean();

      return reservations.map((res: any) => ({
        ...res,
        user: res.userId,
        book: res.bookId
      }));
    },

    myReservations: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");

      const reservations = await Reservation.find({ userId: user.id })
        .populate("bookId")
        .lean();

      return reservations.map((res: any) => ({
        ...res,
        user: { id: user.id },
        book: res.bookId
      }));
    },

    // EVENTS
    events: async () => {
      return await Event.find().populate("participants").populate("createdBy").lean();
    },

    event: async (_: any, args: { id: string }) => {
      return await Event.findById(args.id).populate("participants").populate("createdBy").lean();
    },

    // USER MANAGEMENT
    users: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }
      return await User.find().lean();
    },

    // STATS
    stats: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const [totalBooks, totalUsers, activeLoans, overdueLoans, totalEvents] = await Promise.all([
        Book.countDocuments(),
        User.countDocuments(),
        Loan.countDocuments({ status: "active" }),
        Loan.countDocuments({ status: "overdue" }),
        Event.countDocuments()
      ]);

      return { totalBooks, totalUsers, activeLoans, overdueLoans, totalEvents };
    },

    // AUDIT
    auditLogs: async (_: any, args: { limit?: number }, { user }: Context) => {
      requireRole("admin", user);
      
      const logs = await AuditLog.find()
        .sort({ timestamp: -1 })
        .limit(args.limit || 50)
        .populate("userId")
        .lean();

      return logs.map((log: any) => ({
        ...log,
        user: log.userId
      }));
    }
  },

  Mutation: {
    // AUTH
    register: async (_: any, args: { name: string; email: string; password: string }) => {
      const hash = await bcrypt.hash(args.password, 10);
      const user: any = await User.create({
        name: args.name,
        email: args.email,
        password: hash
      });

      await logAction(user._id.toString(), "USER_REGISTER", `Usuario registrado: ${args.email}`);

      return { token: createToken(user), user };
    },

    login: async (_: any, args: { email: string; password: string }) => {
      const user: any = await User.findOne({ email: args.email });
      if (!user) throw new Error("Usuario no existe");

      const ok = await bcrypt.compare(args.password, user.password);
      if (!ok) throw new Error("Contraseña incorrecta");

      await logAction(user._id.toString(), "USER_LOGIN", `Usuario inició sesión: ${args.email}`);

      return { token: createToken(user), user };
    },

    // BOOKS
    createBook: async (_: any, args: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const availableCopies = args.totalCopies || 1;
      
      const book = await Book.create({
        ...args,
        totalCopies: args.totalCopies || 1,
        availableCopies
      });

      await logAction(user.id, "BOOK_CREATE", `Libro creado: ${args.title}`);

      return book;
    },

    updateBook: async (_: any, args: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const { id, ...updates } = args;
      const book = await Book.findByIdAndUpdate(id, updates, { new: true });
      
      if (!book) throw new Error("Libro no encontrado");

      await logAction(user.id, "BOOK_UPDATE", `Libro actualizado: ${id}`);

      return book;
    },

    deleteBook: async (_: any, args: { id: string }, { user }: Context) => {
      requireRole("admin", user);

      await Book.findByIdAndDelete(args.id);
      await logAction(user!.id, "BOOK_DELETE", `Libro eliminado: ${args.id}`);

      return true;
    },

    // LOANS
    createLoan: async (_: any, args: { userId: string; bookId: string; days?: number }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const book: any = await Book.findById(args.bookId);
      if (!book || book.availableCopies <= 0) {
        throw new Error("Libro no disponible");
      }

      const userDoc: any = await User.findById(args.userId);
      const activeLoans = await Loan.countDocuments({
        userId: args.userId,
        status: "active"
      });

      if (activeLoans >= userDoc.maxLoans) {
        throw new Error("Usuario ha alcanzado el límite de préstamos");
      }

      const days = args.days || 14;
      const returnDeadline = new Date();
      returnDeadline.setDate(returnDeadline.getDate() + days);

      const loan = await Loan.create({
        userId: args.userId,
        bookId: args.bookId,
        returnDeadline,
        status: "active"
      });

      book.availableCopies -= 1;
      await book.save();

      await logAction(user.id, "LOAN_CREATE", `Préstamo creado para usuario ${args.userId}`);

      const populated = await Loan.findById(loan._id)
        .populate("userId")
        .populate("bookId");

      return {
        ...populated!.toObject(),
        user: (populated as any).userId,
        book: (populated as any).bookId
      };
    },

    returnBook: async (_: any, args: { loanId: string }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const loan: any = await Loan.findById(args.loanId);
      if (!loan) throw new Error("Préstamo no encontrado");

      loan.actualReturnDate = new Date();
      loan.status = "returned";

      // Calcular multa si está atrasado
      if (loan.actualReturnDate > loan.returnDeadline) {
        const daysLate = Math.floor(
          (loan.actualReturnDate.getTime() - loan.returnDeadline.getTime()) / (1000 * 60 * 60 * 24)
        );
        loan.fine = daysLate * 1000; // $1000 por día
      }

      await loan.save();

      // Devolver copia al libro
      await Book.findByIdAndUpdate(loan.bookId, {
        $inc: { availableCopies: 1 }
      });

      await logAction(user.id, "LOAN_RETURN", `Devolución de préstamo ${args.loanId}`);

      const populated = await Loan.findById(loan._id)
        .populate("userId")
        .populate("bookId");

      return {
        ...populated!.toObject(),
        user: (populated as any).userId,
        book: (populated as any).bookId
      };
    },

    // RESERVATIONS
    createReservation: async (_: any, args: { bookId: string }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");

      const book = await Book.findById(args.bookId);
      if (!book) throw new Error("Libro no encontrado");

      const existing = await Reservation.findOne({
        userId: user.id,
        bookId: args.bookId,
        status: "pending"
      });

      if (existing) throw new Error("Ya tienes una reserva activa para este libro");

      const reservation = await Reservation.create({
        userId: user.id,
        bookId: args.bookId
      });

      await logAction(user.id, "RESERVATION_CREATE", `Reserva creada para libro ${args.bookId}`);

      const populated = await Reservation.findById(reservation._id)
        .populate("userId")
        .populate("bookId");

      return {
        ...populated!.toObject(),
        user: (populated as any).userId,
        book: (populated as any).bookId
      };
    },

    cancelReservation: async (_: any, args: { id: string }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");

      const reservation = await Reservation.findById(args.id);
      if (!reservation) throw new Error("Reserva no encontrada");

      if (reservation.userId.toString() !== user.id && user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      await Reservation.findByIdAndUpdate(args.id, { status: "cancelled" });

      await logAction(user.id, "RESERVATION_CANCEL", `Reserva cancelada ${args.id}`);

      return true;
    },

    // EVENTS
    createEvent: async (_: any, args: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const event = await Event.create({
        ...args,
        availableSpots: args.maxCapacity,
        createdBy: user.id
      });

      await logAction(user.id, "EVENT_CREATE", `Evento creado: ${args.title}`);

      return event;
    },

    updateEvent: async (_: any, args: any, { user }: Context) => {
      if (!user) throw new Error("No autenticado");
      if (user.role !== "staff" && user.role !== "admin") {
        throw new Error("Sin permisos");
      }

      const { id, ...updates } = args;
      const event = await Event.findByIdAndUpdate(id, updates, { new: true });

      if (!event) throw new Error("Evento no encontrado");

      await logAction(user.id, "EVENT_UPDATE", `Evento actualizado: ${id}`);

      return event;
    },

    deleteEvent: async (_: any, args: { id: string }, { user }: Context) => {
      requireRole("admin", user);

      await Event.findByIdAndDelete(args.id);
      await logAction(user!.id, "EVENT_DELETE", `Evento eliminado: ${args.id}`);

      return true;
    },

    registerForEvent: async (_: any, args: { eventId: string }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");

      const event: any = await Event.findById(args.eventId);
      if (!event) throw new Error("Evento no encontrado");

      if (event.participants.includes(user.id)) {
        throw new Error("Ya estás registrado en este evento");
      }

      if (event.availableSpots <= 0) {
        throw new Error("No hay cupos disponibles");
      }

      event.participants.push(user.id);
      event.availableSpots -= 1;
      await event.save();

      await logAction(user.id, "EVENT_REGISTER", `Registrado en evento ${args.eventId}`);

      return await Event.findById(event._id).populate("participants").populate("createdBy");
    },

    unregisterFromEvent: async (_: any, args: { eventId: string }, { user }: Context) => {
      if (!user) throw new Error("No autenticado");

      const event: any = await Event.findById(args.eventId);
      if (!event) throw new Error("Evento no encontrado");

      const index = event.participants.indexOf(user.id);
      if (index === -1) {
        throw new Error("No estás registrado en este evento");
      }

      event.participants.splice(index, 1);
      event.availableSpots += 1;
      await event.save();

      await logAction(user.id, "EVENT_UNREGISTER", `Desregistrado de evento ${args.eventId}`);

      return await Event.findById(event._id).populate("participants").populate("createdBy");
    },

    // USER MANAGEMENT
    updateUser: async (_: any, args: any, { user }: Context) => {
      requireRole("admin", user);

      const { id, ...updates } = args;
      const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });

      if (!updatedUser) throw new Error("Usuario no encontrado");

      await logAction(user!.id, "USER_UPDATE", `Usuario actualizado: ${id}`);

      return updatedUser;
    },

    deleteUser: async (_: any, args: { id: string }, { user }: Context) => {
      requireRole("admin", user);

      await User.findByIdAndDelete(args.id);
      await logAction(user!.id, "USER_DELETE", `Usuario eliminado: ${args.id}`);

      return true;
    }
  }
};