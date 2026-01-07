import { queryClient } from "@/modules/shared/infrastructure/clients/query/query.client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { TanStackRouterDevtoolsInProd } from "@tanstack/react-router-devtools";

export const MainLayout = ({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement => (
  <>
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
    <TanStackRouterDevtoolsInProd initialIsOpen={false} />
    {/* <TanStackDevtools
      plugins={[
        {
          name: "TanStack Query",
          render: <ReactQueryDevtoolsPanel />,
          defaultOpen: true,
        },
        {
          name: "TanStack Router",
          render: <TanStackRouterDevtoolsPanel />,
          defaultOpen: false,
        },
      ]}
    /> */}
  </>
);
