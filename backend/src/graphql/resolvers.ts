// src/graphql/resolvers.ts
import bcrypt from "bcryptjs";
import { User } from "../models/user.model";
import { Book } from "../models/book.model";
import { Loan } from "../models/loan.model";
import { createToken, requireRole } from "../core/auth";

// Tipos sencillos para los args y para el contexto
interface Context {
  user: { id: string; role: string } | null;
}

interface BookArgs {
  id: string;
}

interface RegisterArgs {
  name: string;
  email: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface AddBookArgs {
  title: string;
  author: string;
}

interface LoanBookArgs {
  bookId: string;
}

export const resolvers = {
  Query: {
    me: (_parent: unknown, _args: unknown, { user }: Context) => user,

    books: async () => {
      // ejecuta la consulta y devuelve un array plano
      return await Book.find().lean();
    },

    book: async (_parent: unknown, args: BookArgs) => {
      return await Book.findById(args.id).lean();
    },
  },

  Mutation: {
    register: async (_parent: unknown, args: RegisterArgs) => {
      const { name, email, password } = args;

      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password: hash });
      return { token: createToken(user), user };
    },

    login: async (_parent: unknown, args: LoginArgs) => {
      const { email, password } = args;

      const user: any = await User.findOne({ email });
      if (!user) throw new Error("No existe el usuario");

      const ok = await bcrypt.compare(password, user.password);
      if (!ok) throw new Error("Contraseña incorrecta");

      return { token: createToken(user), user };
    },

    addBook: async (_parent: unknown, args: AddBookArgs, { user }: Context) => {
      requireRole("admin", user);
      const { title, author } = args;
      return Book.create({ title, author });
    },

    loanBook: async (
      _parent: unknown,
      args: LoanBookArgs,
      { user }: Context
    ) => {
      if (!user) throw new Error("No autenticado");

      const { bookId } = args;
      await Book.findByIdAndUpdate(bookId, { available: false });
      return Loan.create({ bookId, userId: user.id });
    },
  },
};

