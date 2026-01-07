import { Outlet, useRouterState } from "@tanstack/react-router";
import { PATHNAME_ROUTES } from "../../constants/main.constants";

export const AppLayout = (): React.ReactElement => {
  const { location } = useRouterState();
  const showHeader =
    !location.pathname.includes(PATHNAME_ROUTES.AUTH) &&
    !location.pathname.includes(PATHNAME_ROUTES.ADMIN);

  return (
    <main
      className={showHeader ? "mt-20 min-h-[calc(100vh-80px)]" : "min-h-screen"}
    >
      <Outlet />
    </main>
  );
};
