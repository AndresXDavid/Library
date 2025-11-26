// src/server.ts
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import express, { Request } from "express";
import cors from "cors";

import { connectDB } from "./core/db";
import { typeDefs } from "./graphql/schema";
import { resolvers } from "./graphql/resolvers";
import { getUserFromToken } from "./core/auth";

// Tipo de contexto para Apollo
interface MyContext {
  user: any; // luego se puede tipar mejor si quieres
}

async function start() {
  await connectDB();

  const server = new ApolloServer<MyContext>({
    typeDefs,
    resolvers,
  });

  await server.start();

  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(
    "/graphql",
    expressMiddleware(server, {
      // 👇 TIPAMOS req para quitar el error:
      // Binding element 'req' implicitly has an 'any' type
      context: async ({ req }: { req: Request }): Promise<MyContext> => ({
        user: getUserFromToken(req),
      }),
    })
  );

  app.listen(4000, () => {
    console.log("GraphQL listo en http://localhost:4000/graphql");
  });
}

start().catch((err) => {
  console.error("Error al iniciar el servidor GraphQL:", err);
  process.exit(1);
});
