import { Toaster } from "@/components/ui/sonner";
import { RouterProvider } from "@tanstack/react-router";
import { MainLayout } from "../../layouts/main/main.layout";
import { appRouter } from "../../router/app.router";

export const MainContainer = (): React.ReactElement => {
  return (
    <>
      <RouterProvider
        router={appRouter}
        InnerWrap={({ children }) => <MainLayout>{children}</MainLayout>}
      />
      <Toaster
        richColors
        toastOptions={{
          classNames: {
            toast:
              "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:pointer-events-auto",
          },
        }}
      />
    </>
  );
};
