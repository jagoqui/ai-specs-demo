import { createRouter, type Route } from "@tanstack/react-router";
import { NotFoundPage } from "../components/not-fount-page/not-fount-page";
import { appRoute } from "../route/app.route";

const appRouteChildren: Array<Route> = Array.isArray(appRoute.children)
  ? (appRoute.children as Array<Route>)
  : [];

const routeTree = appRoute.addChildren([...appRouteChildren]);

export const appRouter = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
  scrollRestoration: true,
});
