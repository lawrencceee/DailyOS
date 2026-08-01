import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Alert } from "@mui/material";
import SettingsService from "../services/SettingsService.js";

export default function SettingsDialog({ open, onClose }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSaved(false);
    setError(null);
    setLoading(true);
    SettingsService.get()
      .then((data) => setEmail(data.alert_email || ""))
      .catch(() => setError("Could not load settings."))
      .finally(() => setLoading(false));
  }, [open]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await SettingsService.update({ alert_email: email.trim() || null });
      setSaved(true);
    } catch (err) {
      setError("Could not save — check the email address is valid.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle sx={{ fontFamily: '"Fraunces", Georgia, serif', fontWeight: 600 }}>Reminder settings</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Deadline reminders (1 day and 1 hour before) are sent to this address.
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {saved && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSaved(false)}>
            Saved.
          </Alert>
        )}
        <TextField
          variant="filled"
          label="Alert email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          fullWidth
          disabled={loading}
          autoFocus
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          disableElevation
          onClick={handleSave}
          disabled={loading || saving}
          sx={{ borderRadius: 999, px: 3, fontWeight: 700 }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
