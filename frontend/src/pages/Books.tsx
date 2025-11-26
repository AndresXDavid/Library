import { useQuery, useMutation } from "@apollo/client/react/hooks";
import { GET_BOOKS, CREATE_BOOK } from "../graphql/books";

export default function Books() {
  const { data, loading, error } = useQuery(GET_BOOKS);
  const [createBook] = useMutation(CREATE_BOOK);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar libros</p>;

  return (
    <div>
      <h2>Libros</h2>

      <ul>
        {data.getBooks.map((book: any) => (
          <li key={book.id}>
            {book.title} — {book.author.name}
          </li>
        ))}
      </ul>

      <button
        onClick={() =>
          createBook({
            variables: { title: "Nuevo libro", authorId: "ID_DEL_AUTOR" },
          })
        }
      >
        Agregar libro
      </button>
    </div>
  );
}
