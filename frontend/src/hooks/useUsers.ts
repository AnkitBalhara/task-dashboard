import { useCallback, useEffect, useState } from "react";
import usersApi from "@api/usersApi";
import type { User } from "@types";

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Thin wrapper over usersApi.getAll for components (e.g. assignee dropdowns)
 * that just need the raw user list without the "current user" concept.
 */
export function useUsers(): UseUsersResult {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    usersApi
      .getAll()
      .then((fetchedUsers) => {
        if (cancelled) return;
        setUsers(fetchedUsers);
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

export default useUsers;
