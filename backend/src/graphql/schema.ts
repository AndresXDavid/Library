export const typeDefs = `#graphql
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    document: String
    phone: String
    maxLoans: Int!
    registrationDate: String
    active: Boolean!
  }

  type Book {
    id: ID!
    isbn: String
    title: String!
    author: String!
    editorial: String
    year: Int
    category: String
    totalCopies: Int!
    availableCopies: Int!
    location: String
    imageUrl: String
    description: String
    createdAt: String
  }

  type Loan {
    id: ID!
    user: User!
    book: Book!
    loanDate: String!
    returnDeadline: String!
    actualReturnDate: String
    status: String!
    fine: Float
  }

  type Reservation {
    id: ID!
    user: User!
    book: Book!
    reservationDate: String!
    status: String!
    notificationSent: Boolean!
  }

  type Event {
    id: ID!
    title: String!
    description: String
    date: String!
    maxCapacity: Int!
    availableSpots: Int!
    location: String
    participants: [User!]!
    createdBy: User
    createdAt: String
  }

  type AuditLog {
    id: ID!
    user: User
    action: String!
    description: String!
    timestamp: String!
  }

  type Stats {
    totalBooks: Int!
    totalUsers: Int!
    activeLoans: Int!
    overdueLoans: Int!
    totalEvents: Int!
  }

  type Auth {
    token: String!
    user: User!
  }

  type Query {
    me: User
    books(search: String, category: String, available: Boolean): [Book!]!
    book(id: ID!): Book
    loans(userId: ID, status: String): [Loan!]!
    myLoans: [Loan!]!
    reservations(userId: ID): [Reservation!]!
    myReservations: [Reservation!]!
    events: [Event!]!
    event(id: ID!): Event
    users: [User!]!
    stats: Stats!
    auditLogs(limit: Int): [AuditLog!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!): Auth!
    login(email: String!, password: String!): Auth!
    
    createBook(
      isbn: String
      title: String!
      author: String!
      editorial: String
      year: Int
      category: String
      totalCopies: Int
      location: String
      imageUrl: String
      description: String
    ): Book!
    
    updateBook(
      id: ID!
      isbn: String
      title: String
      author: String
      editorial: String
      year: Int
      category: String
      totalCopies: Int
      availableCopies: Int
      location: String
      imageUrl: String
      description: String
    ): Book!
    
    deleteBook(id: ID!): Boolean!
    
    createLoan(userId: ID!, bookId: ID!, days: Int): Loan!
    returnBook(loanId: ID!): Loan!
    
    createReservation(bookId: ID!): Reservation!
    cancelReservation(id: ID!): Boolean!
    
    createEvent(
      title: String!
      description: String
      date: String!
      maxCapacity: Int!
      location: String
    ): Event!
    
    updateEvent(
      id: ID!
      title: String
      description: String
      date: String
      maxCapacity: Int
      location: String
    ): Event!
    
    deleteEvent(id: ID!): Boolean!
    registerForEvent(eventId: ID!): Event!
    unregisterFromEvent(eventId: ID!): Event!
    
    updateUser(
      id: ID!
      name: String
      email: String
      role: String
      document: String
      phone: String
      maxLoans: Int
      active: Boolean
    ): User!
    
    deleteUser(id: ID!): Boolean!
  }
`;