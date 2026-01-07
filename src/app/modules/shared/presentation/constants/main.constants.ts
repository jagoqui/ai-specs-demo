import { getLastPathSegment } from "../helpers/get-last-path-segment/get-last-path-segment.helper";

const BASE_PATH = "/todo-app";

export const PATHNAME_ROUTES = {
  INDEX: "/",
  HOME: BASE_PATH,
  AUTH: `${BASE_PATH}/auth`,
  AUTH_LOGIN: `${BASE_PATH}/auth/login`,
  AUTH_REGISTER: `${BASE_PATH}/auth/register`,
  PROPERTIES: `${BASE_PATH}/properties`,
  PROPERTY_DETAILS: `${BASE_PATH}/properties/$propertyId`,
  AGENTS: `${BASE_PATH}/agents`,
  SERVICES: `${BASE_PATH}/services`,
  BLOG: `${BASE_PATH}/blog`,
  CALCULATOR: `${BASE_PATH}/calculator`,
  FAVORITES: `${BASE_PATH}/favorites`,
  CONTACT: `${BASE_PATH}/contact`,
  ADMIN: `${BASE_PATH}/admin`,
  ADMIN_USERS: `${BASE_PATH}/admin/users`,
  ADMIN_PROPERTIES: `${BASE_PATH}/admin/properties`,
  ADMIN_OWNERS: `${BASE_PATH}/admin/owners`,
  ADMIN_ANALYTICS: `${BASE_PATH}/admin/analytics`,
  ADMIN_LOGS: `${BASE_PATH}/admin/logs`,
} as const satisfies Readonly<Record<string, string>>;

type LastSegment<T extends string> = T extends `${string}/${infer Tail}`
  ? LastSegment<Tail>
  : T;

type PathnameRoutesLastSegments = {
  [K in keyof typeof PATHNAME_ROUTES]: LastSegment<(typeof PATHNAME_ROUTES)[K]>;
};

export const PATHNAME_ROUTES_LAST_SEGMENTS: PathnameRoutesLastSegments =
  Object.fromEntries(
    Object.entries(PATHNAME_ROUTES).map(([key, path]) => [
      key,
      getLastPathSegment(path),
    ]),
  ) as PathnameRoutesLastSegments;
