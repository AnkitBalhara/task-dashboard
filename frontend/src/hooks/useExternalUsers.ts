import { useCallback, useEffect, useState } from "react";
import externalApi from "../api/externalApi";
import type { ExternalUser } from "../types";

interface UseExternalUsersResult {
  users: ExternalUser[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useExternalUsers(): UseExternalUsersResult {
  const [users, setUsers] = useState<ExternalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    externalApi
      .getUsers()
      .then((fetched) => {
        if (cancelled) return;
        setUsers(fetched);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setError(err.message);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [refetchToken]);

  return { users, loading, error, refetch };
}

export default useExternalUsers;
