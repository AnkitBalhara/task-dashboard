import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import ToggleButton from "@mui/material/ToggleButton";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";

import FilterBar from "@components/common/FilterBar";
import DataTable, { DataTableColumn } from "@components/common/DataTable";
import StatusBadge from "@components/common/StatusBadge";
import PriorityBadge from "@components/common/PriorityBadge";
import ConfirmDialog from "@components/common/ConfirmDialog";
import TaskFormDialog from "@components/tasks/TaskFormDialog";
import TaskCommentsPanel from "@components/tasks/TaskCommentsPanel";
import useTasks from "@hooks/useTasks";
import useUsers from "@hooks/useUsers";
import { useCurrentUser } from "@context/CurrentUserContext";
import tasksApi from "@api/tasksApi";
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type SortDir,
  type Task,
  type TaskListQuery,
  type TaskPriority,
  type TaskStatus,
} from "@types";

const STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BLOCKED: "Blocked",
};

const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

const DEFAULT_LIMIT = 10;
const DEFAULT_SORT_BY: NonNullable<TaskListQuery["sortBy"]> = "createdAt";
const DEFAULT_SORT_DIR: SortDir = "desc";

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

export function TasksPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { users } = useUsers();
  const { currentUserId } = useCurrentUser();

  const status = (searchParams.get("status") as TaskStatus | null) ?? "";
  const priority = (searchParams.get("priority") as TaskPriority | null) ?? "";
  const assignedTo = searchParams.get("assignedTo") ?? "";
  const search = searchParams.get("search") ?? "";
  const sortBy = (searchParams.get("sortBy") as TaskListQuery["sortBy"]) ?? DEFAULT_SORT_BY;
  const sortDir = (searchParams.get("sortDir") as SortDir) ?? DEFAULT_SORT_DIR;
  const page = Number(searchParams.get("page") ?? "1") || 1;
  const limit = Number(searchParams.get("limit") ?? String(DEFAULT_LIMIT)) || DEFAULT_LIMIT;

  const isAssignedToMe = Boolean(currentUserId) && assignedTo === currentUserId;

  const query: TaskListQuery = useMemo(
    () => ({
      status: status ? status : undefined,
      priority: priority ? priority : undefined,
      assignedTo: assignedTo ? assignedTo : undefined,
      search: search ? search : undefined,
      sortBy,
      sortDir,
      page,
      limit,
    }),
    [status, priority, assignedTo, search, sortBy, sortDir, page, limit]
  );

  const { tasks, meta, loading, error, refetch } = useTasks(query);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);

  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [commentsTask, setCommentsTask] = useState<Task | null>(null);

  const updateParams = (updates: Record<string, string | number | null | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const handleSearchChange = (value: string) => {
    updateParams({ search: value || undefined, page: 1 });
  };

  const handleSortChange = (key: string) => {
    if (sortBy === key) {
      updateParams({ sortDir: sortDir === "asc" ? "desc" : "asc", page: 1 });
    } else {
      updateParams({ sortBy: key, sortDir: "asc", page: 1 });
    }
  };

  const handlePageChange = (zeroBasedPage: number) => {
    updateParams({ page: zeroBasedPage + 1 });
  };

  const handleLimitChange = (newLimit: number) => {
    updateParams({ limit: newLimit, page: 1 });
  };

  const handleAssignedToMeToggle = () => {
    if (!currentUserId) return;
    updateParams({ assignedTo: isAssignedToMe ? undefined : currentUserId, page: 1 });
  };

  const openCreateDialog = () => {
    setFormMode("create");
    setEditingTask(undefined);
    setFormOpen(true);
  };

  const openEditDialog = (task: Task) => {
    setFormMode("edit");
    setEditingTask(task);
    setFormOpen(true);
  };

  const handleTaskSaved = () => {
    setFormOpen(false);
    setEditingTask(undefined);
    refetch();
  };

  const requestDelete = (task: Task) => {
    setDeleteError(null);
    setTaskPendingDelete(task);
  };

  const confirmDelete = async () => {
    if (!taskPendingDelete) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await tasksApi.remove(taskPendingDelete.id);
      setTaskPendingDelete(null);
      refetch();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const columns: DataTableColumn<Task>[] = [
    {
      key: "title",
      label: "Title",
      sortable: true,
      render: (task) => (
        <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ "&:hover": { color: "primary.main" } }}>
          {task.title}
        </Typography>
      ),
    },
    {
      key: "assignee",
      label: "Assignee",
      render: (task) => (
        <Typography variant="body2" color={task.assignee ? "text.primary" : "text.disabled"}>
          {task.assignee?.name ?? "Unassigned"}
        </Typography>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (task) => <PriorityBadge priority={task.priority} />,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (task) => <StatusBadge status={task.status} />,
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      render: (task) => (
        <Typography variant="body2" color={task.isOverdue ? "error.main" : "text.primary"}>
          {formatDate(task.dueDate)}
        </Typography>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (task) => formatDate(task.createdAt),
    },
    {
      key: "updatedAt",
      label: "Updated",
      sortable: true,
      render: (task) => formatDate(task.updatedAt),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (task) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end" onClick={(e) => e.stopPropagation()}>
          <Tooltip title="Comments">
            <IconButton size="small" onClick={() => setCommentsTask(task)}>
              <ChatBubbleOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => openEditDialog(task)}>
              <EditOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => requestDelete(task)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <Box className="flex flex-col gap-4">
      <Box className="flex items-center justify-between flex-wrap gap-2">
        <Box>
          <Typography variant="h4" gutterBottom>
            Tasks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Browse, filter, and manage tasks across the team.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
          New Task
        </Button>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      <FilterBar
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Search tasks by title..."
      >
        <TextField
          select
          size="small"
          label="Status"
          value={status}
          onChange={(e) => updateParams({ status: e.target.value || undefined, page: 1 })}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All statuses</MenuItem>
          {TASK_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Priority"
          value={priority}
          onChange={(e) => updateParams({ priority: e.target.value || undefined, page: 1 })}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">All priorities</MenuItem>
          {TASK_PRIORITIES.map((p) => (
            <MenuItem key={p} value={p}>
              {PRIORITY_LABELS[p]}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          select
          size="small"
          label="Assignee"
          value={assignedTo}
          onChange={(e) => updateParams({ assignedTo: e.target.value || undefined, page: 1 })}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All assignees</MenuItem>
          {users.map((user) => (
            <MenuItem key={user.id} value={user.id}>
              {user.name}
            </MenuItem>
          ))}
        </TextField>

        <ToggleButton
          value="assignedToMe"
          selected={isAssignedToMe}
          onChange={handleAssignedToMeToggle}
          disabled={!currentUserId}
          size="small"
          sx={{
            height: 40,
            borderRadius: 999,
            px: 2,
            textTransform: "none",
            fontWeight: 600,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "primary.contrastText",
              "&:hover": { bgcolor: "primary.dark" },
            },
          }}
        >
          <PersonOutlineOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
          Assigned to me
        </ToggleButton>
      </FilterBar>

      <DataTable<Task>
        columns={columns}
        rows={tasks}
        getRowId={(task) => task.id}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        page={Math.max(0, page - 1)}
        limit={limit}
        total={meta?.total ?? 0}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        loading={loading}
        emptyMessage="No tasks match your filters."
        onRowClick={(task) => navigate(`/tasks/${task.id}`)}
      />

      <TaskFormDialog
        open={formOpen}
        mode={formMode}
        initialTask={editingTask}
        onClose={() => setFormOpen(false)}
        onSaved={handleTaskSaved}
      />

      <ConfirmDialog
        open={Boolean(taskPendingDelete)}
        title="Delete task"
        message={
          <>
            <Typography variant="body2" gutterBottom>
              Are you sure you want to delete "{taskPendingDelete?.title}"? This action cannot be undone.
            </Typography>
            {deleteError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {deleteError}
              </Alert>
            )}
          </>
        }
        confirmLabel="Delete"
        confirmColor="error"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setTaskPendingDelete(null)}
      />

      <Drawer anchor="right" open={Boolean(commentsTask)} onClose={() => setCommentsTask(null)}>
        <Box sx={{ width: { xs: 320, sm: 420 }, p: 3 }} role="presentation">
          <Typography variant="h6" gutterBottom noWrap>
            Comments — {commentsTask?.title}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {commentsTask && <TaskCommentsPanel taskId={commentsTask.id} />}
        </Box>
      </Drawer>
    </Box>
  );
}

export default TasksPage;
