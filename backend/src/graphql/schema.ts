export const typeDefs = `#graphql
  type User { id: ID!, name: String, email: String, role: String }
  type Book { id: ID!, title: String!, author: String!, available: Boolean }
  type Loan { id: ID!, userId: ID!, bookId: ID!, date: String }

  type Auth { token: String, user: User }

  type Query {
    me: User
    books: [Book]
    book(id: ID!): Book
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): Auth
    login(email: String!, password: String!): Auth

    addBook(title: String!, author: String!): Book
    loanBook(bookId: ID!): Loan
  }
`;
