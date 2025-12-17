'use client';

import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink, from } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { getMainDefinition } from '@apollo/client/utilities';
import { createClient } from 'graphql-ws';
import { setContext } from '@apollo/client/link/context';
import { ReactNode, useMemo } from 'react';

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const httpLink = new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
    });

    const authLink = setContext((_, { headers }) => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      return {
        headers: {
          ...headers,
          authorization: token ? `Bearer ${token}` : '',
        },
      };
    });

    const wsLink =
      typeof window !== 'undefined'
        ? new GraphQLWsLink(
            createClient({
              url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql',
              connectionParams: () => {
                const token = localStorage.getItem('token');
                const params = token ? { authorization: `Bearer ${token}` } : {};
                console.log('🔌 Пытаемся подключиться к WebSocket:', process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:4000/graphql', params.authorization ? 'с токеном' : 'без токена');
                return params;
              },
              shouldRetry: () => true,
              retryAttempts: 5,
              retryWait: async function* retryWait() {
                for (let i = 0; i < 5; i++) {
                  yield new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
                }
              },
              on: {
                connected: () => {
                  console.log('✅ WebSocket подключен для subscriptions');
                },
                error: (error) => {
                  console.error('❌ WebSocket ошибка:', error);
                  console.error('Детали ошибки:', {
                    message: error.message,
                    type: error.type,
                    target: error.target,
                  });
                },
                closed: () => {
                  console.log('⚠️ WebSocket соединение закрыто');
                },
                opened: () => {
                  console.log('🔌 WebSocket соединение открыто');
                },
              },
            })
          )
        : null;

    const splitLink =
      typeof window !== 'undefined' && wsLink
        ? split(
            ({ query }) => {
              const definition = getMainDefinition(query);
              return (
                definition.kind === 'OperationDefinition' &&
                definition.operation === 'subscription'
              );
            },
            wsLink,
            from([authLink, httpLink])
          )
        : from([authLink, httpLink]);

    return new ApolloClient({
      link: splitLink,
      cache: new InMemoryCache(),
      defaultOptions: {
        watchQuery: {
          fetchPolicy: 'cache-and-network',
        },
      },
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

