import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import usersApi from "@api/usersApi";
import { USER_ROLES, type CreateUserInput, type User, type UserRole } from "@types";

interface UserFormDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: User) => void;
}

interface FormState {
  name: string;
  email: string;
  role: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: "Admin",
  MEMBER: "Member",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyForm(): FormState {
  return { name: "", email: "", role: "MEMBER" };
}

export function UserFormDialog({ open, onClose, onCreated }: UserFormDialogProps) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm());
    setErrors({});
    setSubmitError(null);
  }, [open]);

  const handleChange = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as "name" | "email"]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validate = (): boolean => {
    const next: { name?: string; email?: string } = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    else if (!EMAIL_PATTERN.test(form.email.trim())) next.email = "Enter a valid email address";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const input: CreateUserInput = { name: form.name.trim(), email: form.email.trim(), role: form.role };
      const created = await usersApi.create(input);
      onCreated(created);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={submitting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Person</DialogTitle>
      <DialogContent>
        <Stack spacing={2.5} sx={{ mt: 1 }}>
          {submitError && <Alert severity="error">{submitError}</Alert>}

          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
            required
            autoFocus
            fullWidth
          />

          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={Boolean(errors.email)}
            helperText={errors.email}
            required
            fullWidth
          />

          <TextField
            select
            label="Role"
            value={form.role}
            onChange={(e) => handleChange("role", e.target.value as UserRole)}
            fullWidth
          >
            {USER_ROLES.map((role) => (
              <MenuItem key={role} value={role}>
                {ROLE_LABELS[role]}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting}>
          {submitting ? <CircularProgress size={20} color="inherit" /> : "Add Person"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserFormDialog;
