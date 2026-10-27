import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";

const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: vi.fn() } } }),
      getSession: async () => ({ data: { session: null } }),
    },
    functions: { invoke },
  },
}));

describe("signup error propagation", () => {
  beforeEach(() => invoke.mockReset());

  it("rejects a weak password rather than reporting successful registration", async () => {
    const message = "Questa password è troppo comune o facile da indovinare. Scegli una password più sicura e riprova.";
    invoke.mockResolvedValue({ error: {
      message: "Edge Function returned a non-2xx status code",
      context: new Response(JSON.stringify({ code: "weak_password", error: message }), { status: 422 }),
    } });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      const outcome = await result.current.signUp("signup-test@example.com", "rejected-password");
      expect(outcome.error).toBeInstanceOf(Error);
      expect(outcome.error?.message).toBe(message);
    });
  });

  it("allows successful neutral signup responses", async () => {
    invoke.mockResolvedValue({ data: { ok: true }, error: null });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(async () => {
      expect(await result.current.signUp("signup-test@example.com", "test-only-password")).toEqual({ error: null });
    });
  });
});