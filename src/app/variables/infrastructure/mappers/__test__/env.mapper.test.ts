import { ENVS_MOCK } from "@/data/mocks/envs/envs.mock";
import { type MockInstance, vi } from "vitest";

import { getEnvs } from "../env.mapper";

let mockExit: MockInstance<typeof process.exit>;

describe("getEnvs", () => {
  beforeEach(() => {
    const { VITE_MODE: _, ...rest } = ENVS_MOCK;
    for (const [key, value] of Object.entries(rest)) {
      vi.stubEnv(key, String(value));
    }

    mockExit = vi.spyOn(process, "exit").mockImplementation(((
      code?: number,
    ) => {
      throw new Error(`process.exit: ${code}`);
    }) as never);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("should return parsed envs from process.env", () => {
    expect(getEnvs()).toEqual(ENVS_MOCK);
  });

  it("should call exit(1) if envs are invalid", () => {
    vi.stubEnv("VITE_API_BASE_URL", "");

    expect(() => getEnvs()).toThrow("process.exit: 1");
    expect(mockExit).toHaveBeenCalledWith(1);
  });

  it("should not set VITE_SNYK_ORG in production", () => {
    vi.stubEnv("MODE", "production");

    if (ENVS_MOCK.VITE_MODE !== "test")
      throw new Error("MODE should be test for this check");

    const { VITE_SNYK_ORG: _VITE_SNYK_ORG_DEV, ...rest } = ENVS_MOCK;

    expect(getEnvs()).toEqual({
      ...rest,
      VITE_MODE: "production",
    });
  });
});
