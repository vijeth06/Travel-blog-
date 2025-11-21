import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Grid
} from '@mui/material';
import {
  Email,
  Phone,
  Business,
  Language,
  Send
} from '@mui/icons-material';
import { API_URL } from '../config/api';

const ContactProviderDialog = ({ open, onClose, provider, packageInfo }) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setMessage({ ...message, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/contact/provider`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          providerId: provider._id,
          packageId: packageInfo?._id,
          ...message
        })
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose();
          setSuccess(false);
          setMessage({ name: '', email: '', phone: '', subject: '', message: '' });
        }, 2000);
      } else {
        setError('Failed to send message. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!provider) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
        Contact Package Provider
      </DialogTitle>
      <DialogContent>
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Message sent successfully! The provider will contact you soon.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <Typography variant="h6" gutterBottom>
            {provider.providerInfo?.companyName}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                {provider.email}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                {provider.providerInfo?.contactNumber || provider.phone}
              </Typography>
            </Grid>
            {provider.providerInfo?.website && (
              <Grid item xs={12}>
                <Typography variant="body2">
                  <Language sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                  <a href={provider.providerInfo.website} target="_blank" rel="noopener noreferrer">
                    {provider.providerInfo.website}
                  </a>
                </Typography>
              </Grid>
            )}
          </Grid>
        </Box>

        {packageInfo && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <strong>Package:</strong> {packageInfo.name} (${packageInfo.price})
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Name"
                name="name"
                value={message.name}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Your Email"
                name="email"
                type="email"
                value={message.email}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Your Phone Number"
                name="phone"
                value={message.phone}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Subject"
                name="subject"
                value={message.subject}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Message"
                name="message"
                value={message.message}
                onChange={handleChange}
                multiline
                rows={4}
                required
                disabled={loading}
                placeholder="Tell the provider about your requirements, travel dates, group size, etc."
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          startIcon={<Send />}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Message'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactProviderDialog;
