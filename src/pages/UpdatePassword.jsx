import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Alert, Paper } from '@mui/material';

export default function UpdatePassword() {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Проверяем токен доступа в URL
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const tokenType = searchParams.get('token_type');

        if (accessToken && refreshToken && tokenType) {
            // Устанавливаем сессию из URL
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
                token_type: tokenType,
            }).then(({ error }) => {
                if (error) {
                    setMessage({
                        type: 'error',
                        text: 'Invalid or expired link',
                    });
                }
            });
        }
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: "Passwords don't match" });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: password,
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'The password has been successfully updated! Redirect to the login page...',
            });

            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'Password update error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100vh",
                width: "100vw",
                overflow: "auto",
                bgcolor: "rgba(0, 0, 0, 0.1)",
                background: "linear-gradient(45deg, #1fbfd1 30%, #d11f9f 90%)",
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: { xs: 2, sm: 3 },
                    width: '100%',
                    maxWidth: 400,
                    borderRadius: 2
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        maxWidth: 400,
                        mx: 'auto',
                        p: 3,
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Password Update
                    </Typography>

                    {message.text && (
                        <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
                            {message.text}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            label="New password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />

                        <TextField
                            label="Confirm the password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={loading}
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            {'Update your password'}
                        </Button>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}