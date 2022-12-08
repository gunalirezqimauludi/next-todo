import toast, { Toaster } from 'react-hot-toast';
import { ChakraProvider } from '@chakra-ui/react';
import { MutationCache, QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';

let localStorage;
if (typeof window !== 'undefined') {
  localStorage = window.localStorage;
}

const persister = createSyncStoragePersister({
  storage: localStorage,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 2000,
      retry: 0,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: data => {
      toast.success(data.message);
    },
    onError: error => {
      toast.error(error.message);
    },
  }),
});

function App({ Component, pageProps }) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
      onSuccess={() => {
        queryClient.resumePausedMutations().then(() => {
          queryClient.invalidateQueries();
        });
      }}>
      <ChakraProvider>
        <Toaster />
        <Component {...pageProps} />
        <ReactQueryDevtools initialIsOpen={false} />
      </ChakraProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
