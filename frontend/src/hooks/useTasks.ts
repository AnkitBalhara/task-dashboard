import { useCallback, useEffect, useState } from "react";
import tasksApi from "@api/tasksApi";
import type { PaginationMeta, Task, TaskListQuery } from "@types";

interface UseTasksResult {
  tasks: Task[];
  meta: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTasks(query: TaskListQuery): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const queryKey = JSON.stringify(query);

  const refetch = useCallback(() => setRefetchToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    tasksApi
      .getAll(query)
      .then((result) => {
        if (cancelled) return;
        setTasks(result.data);
        setMeta(result.meta);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, refetchToken]);

  return { tasks, meta, loading, error, refetch };
}

export default useTasks;
