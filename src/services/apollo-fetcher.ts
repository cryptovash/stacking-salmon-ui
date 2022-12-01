
import ApolloClient, { ApolloQueryResult, OperationVariables } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory';
import { DocumentNode } from 'graphql';

const clientCache: {
  [url: string]: ApolloClient<NormalizedCacheObject>;
} = {};

function getClient(subgraphUrl: string) {
  if (!subgraphUrl) {
    throw new Error('A subgraphUrl is required');
  }
  const key = 'ID:' + JSON.stringify(subgraphUrl);
  let client = clientCache[key];
  if (!client) {
    client = new ApolloClient({
      link: new HttpLink({
        uri: subgraphUrl
      }),
      cache: new InMemoryCache()
    });
    clientCache[key] = client;
  }
  return client;
}

// TODO: should type properly (`any`)
async function apolloFetcher<T = any, TVariables = OperationVariables>(
  subgraphUrl: string,
  query: DocumentNode,
  variables?: TVariables
): Promise<ApolloQueryResult<T>> {
  const client = getClient(subgraphUrl);

  const started = Date.now();
  try {
    const result = await client.query({
      query: query,
      fetchPolicy: 'network-only',
      variables
    });
    return result;
  } finally {
    if (process.env.NODE_ENV === 'test') {
      const elapsed = Date.now() - started;
      const stack = new Error('Slow GraphQL Query').stack || '';
      const stackLines = stack.split('\n');
      const caller = (stackLines[stackLines.length - 1] || '').substring(7);
      console.log('=== GraphQL Query ===');
      console.log('  Subgraph Url: ' + subgraphUrl);
      console.log('  Caller:       ' + caller);
      console.log('  Elapsed:      ' + elapsed + 'ms');
      if (elapsed > 500) {
        console.log(stack);
      }
    }
  }
}

export default apolloFetcher;
