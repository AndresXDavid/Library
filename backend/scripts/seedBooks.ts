import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const Book = require("../src/models/book.model");

const books = [
  { "title": "Cien años de soledad", "author": "Gabriel García Márquez" },
  { "title": "El amor en los tiempos del cólera", "author": "Gabriel García Márquez" },
  { "title": "1984", "author": "George Orwell" },
  { "title": "Rebelión en la granja", "author": "George Orwell" },
  { "title": "La metamorfosis", "author": "Franz Kafka" },
  { "title": "Crimen y castigo", "author": "Fiódor Dostoievski" },
  { "title": "Los hermanos Karamázov", "author": "Fiódor Dostoievski" },
  { "title": "El retrato de Dorian Gray", "author": "Oscar Wilde" },
  { "title": "Orgullo y prejuicio", "author": "Jane Austen" },
  { "title": "Emma", "author": "Jane Austen" },
  { "title": "Don Quijote de la Mancha", "author": "Miguel de Cervantes" },
  { "title": "La sombra del viento", "author": "Carlos Ruiz Zafón" },
  { "title": "El juego del ángel", "author": "Carlos Ruiz Zafón" },
  { "title": "El alquimista", "author": "Paulo Coelho" },
  { "title": "Brida", "author": "Paulo Coelho" },
  { "title": "Harry Potter y la piedra filosofal", "author": "J.K. Rowling" },
  { "title": "Harry Potter y la cámara secreta", "author": "J.K. Rowling" },
  { "title": "El Señor de los Anillos: La comunidad del anillo", "author": "J.R.R. Tolkien" },
  { "title": "El Hobbit", "author": "J.R.R. Tolkien" },
  { "title": "Dune", "author": "Frank Herbert" },
  { "title": "Fundación", "author": "Isaac Asimov" },
  { "title": "Yo, robot", "author": "Isaac Asimov" },
  { "title": "El código Da Vinci", "author": "Dan Brown" },
  { "title": "Ángeles y demonios", "author": "Dan Brown" },
  { "title": "La ladrona de libros", "author": "Markus Zusak" },
  { "title": "El niño con el pijama de rayas", "author": "John Boyne" },
  { "title": "Los juegos del hambre", "author": "Suzanne Collins" },
  { "title": "En llamas", "author": "Suzanne Collins" },
  { "title": "El marciano", "author": "Andy Weir" },
  { "title": "Ready Player One", "author": "Ernest Cline" },
  { "title": "El nombre del viento", "author": "Patrick Rothfuss" },
  { "title": "El temor de un hombre sabio", "author": "Patrick Rothfuss" },
  { "title": "It", "author": "Stephen King" },
  { "title": "El resplandor", "author": "Stephen King" },
  { "title": "Carrie", "author": "Stephen King" },
  { "title": "Fahrenheit 451", "author": "Ray Bradbury" },
  { "title": "Crónica de una muerte anunciada", "author": "Gabriel García Márquez" },
  { "title": "El viejo y el mar", "author": "Ernest Hemingway" },
  { "title": "Por quién doblan las campanas", "author": "Ernest Hemingway" },
  { "title": "Drácula", "author": "Bram Stoker" },
  { "title": "Frankenstein", "author": "Mary Shelley" },
  { "title": "El principito", "author": "Antoine de Saint-Exupéry" },
  { "title": "La isla del tesoro", "author": "Robert Louis Stevenson" },
  { "title": "Sherlock Holmes: Estudio en escarlata", "author": "Arthur Conan Doyle" },
  { "title": "Los miserables", "author": "Victor Hugo" },
  { "title": "Madame Bovary", "author": "Gustave Flaubert" },
  { "title": "Ulises", "author": "James Joyce" },
  { "title": "Matar a un ruiseñor", "author": "Harper Lee" }
]

async function run() {
  try {
    console.log("MONGO_URI =>", process.env.MONGO_URI);
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI no está definido en .env");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Conectado a MongoDB");

    // Opcional: limpiar colección antes
    // await Book.deleteMany({});

    await Book.insertMany(books);
    console.log(`Se insertaron ${books.length} libros`);

  } catch (err) {
    console.error("Error al ejecutar seed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

run();