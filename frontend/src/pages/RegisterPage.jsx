import { useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { Box, Typography, TextField, Button, Alert, Link, IconButton, InputAdornment } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 409 ? "An account with that email already exists." : "Could not create an account."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const passwordAdornment = (
    <InputAdornment position="end">
      <IconButton
        onClick={() => setShowPassword((v) => !v)}
        edge="end"
        size="small"
        aria-label={showPassword ? "hide password" : "show password"}
      >
        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
      </IconButton>
    </InputAdornment>
  );

  return (
    <AuthLayout title="Create your account">
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          variant="filled"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          autoFocus
        />
        <TextField
          variant="filled"
          label="Password"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          helperText="At least 8 characters"
          InputProps={{ endAdornment: passwordAdornment }}
        />
        <TextField
          variant="filled"
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          fullWidth
        />
        <Button
          type="submit"
          variant="contained"
          disableElevation
          disabled={submitting}
          sx={{ borderRadius: 999, py: 1.25, fontWeight: 700, mt: 1 }}
        >
          Create account
        </Button>
        <Typography variant="body2" sx={{ textAlign: "center", color: "text.secondary" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/login" sx={{ fontWeight: 600 }}>
            Log in
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
}
