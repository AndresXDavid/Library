import React from "react";
import { ApolloClient, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

interface Props {
  children: React.ReactNode;
}

const client = new ApolloClient({
  cache: new InMemoryCache(),
});

export default function ApolloConfig({ children }: Props) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
