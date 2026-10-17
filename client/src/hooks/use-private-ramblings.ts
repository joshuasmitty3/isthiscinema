import { useQuery } from "@tanstack/react-query";
import { makeRambling, type Rambling, type RamblingSource } from "@/lib/ramblings";

async function fetchPrivateRamblings(): Promise<Rambling[]> {
  const res = await fetch("/api/ramblings/private", { credentials: "include" });
  if (!res.ok) return [];
  const data = (await res.json()) as RamblingSource[];
  return data.map(makeRambling);
}

// Returns the private (login-only) essays when enabled (signed in), else [].
// The fetch is gated on `enabled`, so logged-out visitors never request it.
// `isLoading` lets the essay page wait before deciding a slug doesn't exist.
export function usePrivateRamblings(enabled: boolean): {
  ramblings: Rambling[];
  isLoading: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: ["private-ramblings"],
    queryFn: fetchPrivateRamblings,
    enabled,
  });
  return { ramblings: data ?? [], isLoading: enabled && isLoading };
}
