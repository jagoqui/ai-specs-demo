import { ENVS_MOCK } from "@/data/mocks/envs/envs.mock";
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";

const { VITE_MODE: _, ...rest } = ENVS_MOCK;

for (const [key, value] of Object.entries(rest)) {
  vi.stubEnv(key, String(value));
}

vi.stubEnv("MODE", "test");

const originalConsole = { ...console };

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
});

beforeAll(() => {
  global.console = {
    ...originalConsole,
    warn: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  };
});

afterAll(() => {
  global.console = originalConsole;
});
