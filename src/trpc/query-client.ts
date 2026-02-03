import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from "@tanstack/react-query";
/**
 * Create a QueryClient configured for the application.
 *
 * The returned client sets query staleTime to 30,000 ms and uses a dehydrate
 * predicate that includes queries when the default predicate is truthy or when
 * the query's state.status is "pending".
 *
 * @returns The constructed QueryClient with the described defaults.
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // serializeData: superjson.serialize,
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === "pending",
      },
      hydrate: {
        // deserializeData: superjson.deserialize,
      },
    },
  });
}