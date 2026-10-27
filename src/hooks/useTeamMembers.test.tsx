import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useInviteMember } from "./useTeamMembers";

const { invoke, toastError } = vi.hoisted(() => ({ invoke: vi.fn(), toastError: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { functions: { invoke } } }));
vi.mock("sonner", () => ({ toast: { error: toastError, success: vi.fn() } }));

function setup() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return renderHook(() => useInviteMember(), {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  });
}

describe("team invitation failures", () => {
  beforeEach(() => vi.clearAllMocks());

  it("propagates a rejected invitation rather than a generic HTTP error", async () => {
    const message = "Esiste già un utente con questa email";
    invoke.mockResolvedValue({ data: null, error: {
      message: "Edge Function returned a non-2xx status code",
      context: new Response(JSON.stringify({ error: message }), { status: 409 }),
    } });
    const { result } = setup();
    await act(async () => {
      await expect(result.current.mutateAsync({ email: "existing@example.com", role: "owner" })).rejects.toThrow(message);
    });
    expect(toastError).toHaveBeenCalledWith(message);
  });

  it("handles a non-JSON failure without leaking a transport error", async () => {
    invoke.mockResolvedValue({ data: null, error: { context: new Response("unavailable", { status: 502 }) } });
    const { result } = setup();
    await act(async () => {
      await expect(result.current.mutateAsync({ email: "new@example.com", role: "owner" })).rejects.toThrow("Non è stato possibile creare l’invito");
    });
  });
});