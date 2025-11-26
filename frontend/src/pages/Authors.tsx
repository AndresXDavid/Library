import React from "react";
import { useQuery, useMutation } from "@apollo/client/react/hooks";
import { GET_AUTHORS, CREATE_AUTHOR } from "../graphql/authors";

export default function Authors() {
  const { data, loading, error } = useQuery(GET_AUTHORS);
  const [createAuthor] = useMutation(CREATE_AUTHOR);

  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error al cargar autores</p>;

  return (
    <div>
      <h2>Autores</h2>

      <ul>
        {data.getAuthors.map((author: any) => (
          <li key={author.id}>{author.name}</li>
        ))}
      </ul>

      <button
        onClick={() =>
          createAuthor({
            variables: { name: "Autor nuevo" },
          })
        }
      >
        Crear autor
      </button>
    </div>
  );
}
