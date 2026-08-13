import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import tasksApi from "../../api/tasksApi";
import { useCurrentUser } from "../../context/CurrentUserContext";
import type { Comment } from "../../types";
import EmptyState from "../common/EmptyState";

interface TaskCommentsPanelProps {
  taskId: string;
}

function formatTimestamp(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TaskCommentsPanel({ taskId }: TaskCommentsPanelProps) {
  const { currentUser, currentUserId } = useCurrentUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);

  const loadComments = () => {
    setLoading(true);
    setError(null);
    tasksApi
      .listComments(taskId)
      .then(setComments)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  const handleAddComment = async () => {
    const trimmed = draft.trim();
    if (!trimmed || !currentUserId) return;

    setPosting(true);
    setPostError(null);
    try {
      await tasksApi.addComment(taskId, { userId: currentUserId, comment: trimmed });
      setDraft("");
      loadComments();
    } catch (err) {
      setPostError(err instanceof Error ? err.message : "Failed to add comment");
    } finally {
      setPosting(false);
    }
  };

  return (
    <Box className="flex flex-col gap-4">
      <Box>
        {loading && (
          <Box className="flex justify-center py-6">
            <CircularProgress size={24} />
          </Box>
        )}
        {error && <Alert severity="error">{error}</Alert>}
        {!loading && !error && comments.length === 0 && (
          <EmptyState message="No comments yet" description="Be the first to add one." />
        )}
        {!loading && !error && comments.length > 0 && (
          <Stack divider={<Divider />} spacing={2}>
            {comments.map((comment) => (
              <Box key={comment.id} className="flex gap-3">
                <Avatar sx={{ width: 32, height: 32, fontSize: 14 }}>
                  {initials(comment.user?.name ?? "?")}
                </Avatar>
                <Box className="flex-1">
                  <Box className="flex items-baseline gap-2">
                    <Typography variant="subtitle2">{comment.user?.name ?? "Unknown user"}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatTimestamp(comment.createdAt)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                    {comment.comment}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      <Divider />

      <Box className="flex flex-col gap-2">
        {postError && <Alert severity="error">{postError}</Alert>}
        <TextField
          label={currentUser ? `Comment as ${currentUser.name}` : "Comment"}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          multiline
          minRows={2}
          fullWidth
          disabled={!currentUserId || posting}
        />
        <Box className="flex justify-end">
          <Button
            variant="contained"
            onClick={handleAddComment}
            disabled={!draft.trim() || !currentUserId || posting}
          >
            {posting ? <CircularProgress size={20} color="inherit" /> : "Add comment"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

export default TaskCommentsPanel;
