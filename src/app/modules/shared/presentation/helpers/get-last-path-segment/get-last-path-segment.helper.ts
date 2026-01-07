import { PATHNAME_ROUTES } from "../../constants/main.constants";

export const getLastPathSegment = (path: string): string =>
  path.split("/").pop() || PATHNAME_ROUTES.INDEX;
