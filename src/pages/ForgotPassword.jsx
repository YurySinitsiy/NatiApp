import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Link, Alert, Paper } from '@mui/material';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ type: '', text: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'http://localhost:3000/update-password', // Замените на ваш URL
            });

            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'An email with instructions has been sent to your email',
            });
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.message || 'There was an error sending your email',
            });
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
                        backgroundColor: "white"
                    }}
                >
                    <Typography variant="h4" gutterBottom>
                        Password recovery
                    </Typography>

                    {message.text && (
                        <Alert severity={message.type} sx={{ width: '100%', mb: 2 }}>
                            {message.text}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            fullWidth
                            margin="normal"
                            variant="outlined"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                        >
                            {'SUBMIT'}
                        </Button>

                        <Box sx={{ mt: 2, textAlign: 'center' }}>
                            <Link href="/login" variant="body2">
                                Back to Log In
                            </Link>
                        </Box>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
}