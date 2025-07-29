import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Link,
  Alert,
  InputAdornment,
  IconButton
} from "@mui/material";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import Logo from "/logo.svg";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {
      email: "",
      password: "",
    };

    let isValid = true;

    if (!formData.email) {
      newErrors.email = "Email required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a correct email";
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = "Password required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const checkUserStatus = async (userId) => {
    const { data: user, error } = await supabase
      .from('profiles')
      .select('is_blocked')
      .eq('id', userId)
      .single();

    if (error || !user || user.is_blocked) {
      await supabase.auth.signOut();
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validate()) return;

    try {
      const { data: { user, session }, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      const isUserValid = await checkUserStatus(user.id);
      if (!isUserValid) {
        throw new Error('Your account is blocked or delete');
      }

      if (formData.rememberMe) {
        localStorage.setItem("supabase.auth.token", JSON.stringify(session));
      } else {
        sessionStorage.setItem("supabase.auth.token", JSON.stringify(session));
      }

      navigate("/main");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      minHeight="100vh"
      width="100vw"
      sx={{
        background: "linear-gradient(45deg, #1fbfd1 30%, #d11f9f 90%)",
        p: 2,
      }}
    >
      <Box component="img" src={Logo} sx={{ mb: 2, maxWidth: 150 }} />

      <Paper
        elevation={3}
        sx={{
          p: { xs: 2, sm: 3 },
          width: '100%',
          maxWidth: 400,
          borderRadius: 2
        }}
      >
        <Typography variant="h5" component="h1" gutterBottom align="center" sx={{ fontWeight: 500 }}>
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
            autoComplete="email"
            inputProps={{
              autoCapitalize: "none",
            }}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
            error={!!errors.password}
            helperText={errors.password}
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleClickShowPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box display="flex" justifyContent="space-between" alignItems="center">
            <FormControlLabel
              control={
                <Checkbox
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  color="primary"
                />
              }
              label="Remember me"
            />

            <Link
              component={RouterLink}
              to="/forgot-password"
              underline="hover"
              sx={{ fontSize: "0.875rem" }}
            >
              Forgot password?
            </Link>
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            sx={{ mt: 3, py: 1.5 }}
          >
            {"SIGN IN"}
          </Button>
        </Box>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2">
            Don't have an account?{" "}
            <Link
              component={RouterLink}
              to="/signup"
              underline="hover"
              fontWeight="bold"
            >
              Sign Up
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default SignIn;