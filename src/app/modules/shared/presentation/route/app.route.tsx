import { createRootRoute, createRoute, Navigate } from "@tanstack/react-router";
import { PATHNAME_ROUTES } from "../constants/main.constants";
import { AppContainer } from "../containers/app/app.container";
import { HomeContainer } from "../containers/home/home.container";

export const appRoute = createRootRoute({
  component: AppContainer,
});

const indexRoute = createRoute({
  getParentRoute: () => appRoute,
  path: PATHNAME_ROUTES.INDEX,
  component: () => <Navigate to={PATHNAME_ROUTES.HOME} />,
});

const homeRoute = createRoute({
  getParentRoute: () => appRoute,
  path: PATHNAME_ROUTES.HOME,
  component: HomeContainer,
});

appRoute.addChildren([indexRoute, homeRoute]);
