import { QueryClient } from "@tanstack/react-query";
import { QUERY_CLIENT_CONFIG } from "../query.client";

vi.mock("@tanstack/react-query", () => ({
  QueryClient: vi.fn(),
}));

const setup = async (): Promise<unknown> => await import("../query.client");

describe("queryClient", () => {
  it("should instantiate QueryClient with correct config", async () => {
    await setup();

    expect(QueryClient).toHaveBeenNthCalledWith(1, QUERY_CLIENT_CONFIG);
  });
});
