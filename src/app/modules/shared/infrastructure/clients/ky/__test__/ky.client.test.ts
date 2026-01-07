import { AUTH_RESPONSE_MOCK } from "@/data/mocks/auth-response/auth-response.mock";
import { tokenStorageRepositoryImpl } from "@/modules/shared/infrastructure/storage/token/token-storage.repository.impl";
import ky, {
  type AfterResponseState,
  type BeforeRequestState,
  type NormalizedOptions,
  type Options,
} from "ky";
import type { MockedFunction } from "vitest";

vi.mock("ky", () => {
  const create = vi.fn();
  return {
    __esModule: true,
    default: { create },
    create,
  };
});

const setup = async (): Promise<unknown> => await import("../ky.client");

let mockKyCreate: MockedFunction<typeof ky.create>;
let capturedConfig: Options | undefined;

const authTokenRepoGetSpy = vi.spyOn(tokenStorageRepositoryImpl, "get");
// Opcional: Si quieres testear el logout en el afterResponse, espía remove también
const authTokenRepoRemoveSpy = vi.spyOn(tokenStorageRepositoryImpl, "remove");

describe("API Configuration", () => {
  beforeAll(async () => {
    await setup();

    mockKyCreate = ky.create as MockedFunction<typeof ky.create>;
    capturedConfig = mockKyCreate.mock.calls[0]?.[0];

    if (!capturedConfig) {
      throw new Error(
        "Failed to capture ky.create configuration. Check the import path or mock setup.",
      );
    }
  });

  beforeEach(() => {
    authTokenRepoGetSpy.mockClear();
    authTokenRepoRemoveSpy.mockClear();
    authTokenRepoGetSpy.mockReturnValue(AUTH_RESPONSE_MOCK);
  });

  afterEach(() => vi.clearAllMocks());

  it("should call ky.create with the correct configuration", () => {
    expect(mockKyCreate).toHaveBeenNthCalledWith(1, {
      timeout: false,
      hooks: {
        beforeRequest: expect.arrayContaining([
          expect.any(Function),
        ]) as Array<unknown>,
        afterResponse: expect.arrayContaining([
          expect.any(Function),
        ]) as Array<unknown>,
      },
    });
  });

  it("should call authTokenRepositoryImpl.get and set the Authorization header correctly", async () => {
    const beforeRequestHook = capturedConfig?.hooks?.beforeRequest?.[0];
    expect(beforeRequestHook).toBeInstanceOf(Function);

    const setFn = vi.fn();

    const mockRequest = {
      headers: {
        set: setFn,
      },
    } as unknown as Request;

    await beforeRequestHook!(
      mockRequest,
      {} as NormalizedOptions,
      {} as BeforeRequestState,
    );

    expect(authTokenRepoGetSpy).toHaveBeenCalledTimes(1);

    const expectedHeaderValue = `Bearer ${AUTH_RESPONSE_MOCK.accessToken}`;
    expect(setFn).toHaveBeenNthCalledWith(
      1,
      "Authorization",
      expectedHeaderValue,
    );
  });

  it("should NOT set the Authorization header if authTokenRepositoryImpl.get returns null (no token)", async () => {
    authTokenRepoGetSpy.mockReturnValue(null);

    const beforeRequestHook = capturedConfig?.hooks?.beforeRequest?.[0];
    const setFn = vi.fn();

    const mockRequest = {
      headers: {
        set: setFn,
      },
    } as unknown as Request;

    await beforeRequestHook!(
      mockRequest,
      {} as NormalizedOptions,
      {} as BeforeRequestState,
    );

    expect(authTokenRepoGetSpy).toHaveBeenCalledTimes(1);

    expect(setFn).not.toHaveBeenCalled();
  });

  it("should call authTokenRepositoryImpl.remove when response is 401", () => {
    const afterResponseHook = capturedConfig?.hooks?.afterResponse?.[0];
    expect(afterResponseHook).toBeInstanceOf(Function);

    const mockResponse = {
      status: 401,
      statusText: "Unauthorized",
    } as Response;

    expect(() => {
      void afterResponseHook!(
        new Request("test"),
        {} as NormalizedOptions,
        mockResponse,
        {} as AfterResponseState,
      );
    }).toThrow("Unauthorized. Please try reloading the site.");

    expect(authTokenRepoRemoveSpy).toHaveBeenCalledTimes(1);
  });

  it("should return the response unchanged and NOT remove token when status is OK (e.g. 200)", () => {
    const afterResponseHook = capturedConfig?.hooks?.afterResponse?.[0];
    expect(afterResponseHook).toBeInstanceOf(Function);

    const mockResponse = {
      status: 200,
      statusText: "OK",
    } as Response;

    const result = afterResponseHook!(
      new Request("https://test.com"),
      {} as NormalizedOptions,
      mockResponse,
      {} as AfterResponseState,
    );

    expect(result).toBe(mockResponse);

    expect(authTokenRepoRemoveSpy).not.toHaveBeenCalled();
  });
});
