import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import usersApi from "../api/usersApi";
import type { User } from "../types";

const STORAGE_KEY = "task-dashboard:currentUserId";

interface CurrentUserContextValue {
  users: User[];
  currentUser: User | null;
  currentUserId: string | null;
  setCurrentUserId: (id: string) => void;
  loading: boolean;
  error: string | null;
  refetchUsers: () => void;
}

const CurrentUserContext = createContext<CurrentUserContextValue | undefined>(undefined);

export function CurrentUserProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserIdState] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

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

  // Default to the first user once users have loaded, if nothing is stored yet
  // (or the stored id no longer refers to a known user).
  useEffect(() => {
    if (loading || users.length === 0) return;
    const stillValid = currentUserId && users.some((u) => u.id === currentUserId);
    if (!stillValid) {
      setCurrentUserIdState(users[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, users]);

  const setCurrentUserId = (id: string) => {
    setCurrentUserIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // localStorage may be unavailable (e.g. private mode) — safe to ignore.
    }
  };

  const currentUser = useMemo(
    () => users.find((u) => u.id === currentUserId) ?? null,
    [users, currentUserId]
  );

  const value: CurrentUserContextValue = {
    users,
    currentUser,
    currentUserId,
    setCurrentUserId,
    loading,
    error,
    refetchUsers: () => setRefetchToken((t) => t + 1),
  };

  return <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>;
}

export function useCurrentUser(): CurrentUserContextValue {
  const ctx = useContext(CurrentUserContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used within a CurrentUserProvider");
  }
  return ctx;
}
