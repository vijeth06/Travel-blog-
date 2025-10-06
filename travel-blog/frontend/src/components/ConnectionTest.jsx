import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Alert, CircularProgress } from '@mui/material';

const ConnectionTest = () => {
  const [status, setStatus] = useState('testing');
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setStatus('testing');
    setError(null);
    const testResults = {};

    try {
      // Test 1: Backend Health Check
      console.log('Testing backend health...');
      const healthResponse = await fetch('http://localhost:5000/api/health');
      testResults.health = {
        status: healthResponse.status,
        ok: healthResponse.ok,
        data: await healthResponse.json()
      };
      console.log('Health check result:', testResults.health);

      // Test 2: Blogs API
      console.log('Testing blogs API...');
      const blogsResponse = await fetch('http://localhost:5000/api/blogs');
      testResults.blogs = {
        status: blogsResponse.status,
        ok: blogsResponse.ok,
        data: await blogsResponse.json()
      };
      console.log('Blogs API result:', testResults.blogs);

      // Test 3: Auth API (should return 401)
      console.log('Testing auth API...');
      const authResponse = await fetch('http://localhost:5000/api/auth/profile');
      testResults.auth = {
        status: authResponse.status,
        ok: authResponse.ok,
        message: authResponse.status === 401 ? 'Expected 401 - Auth working' : 'Unexpected response'
      };
      console.log('Auth API result:', testResults.auth);

      // Test 4: Registration Test
      console.log('Testing registration...');
      const testUser = {
        name: 'Test User ' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'password123'
      };
      
      const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testUser)
      });
      
      testResults.register = {
        status: registerResponse.status,
        ok: registerResponse.ok,
        data: registerResponse.ok ? await registerResponse.json() : await registerResponse.text()
      };
      console.log('Registration result:', testResults.register);

      setResults(testResults);
      setStatus('completed');
    } catch (err) {
      console.error('Connection test failed:', err);
      setError(err.message);
      setStatus('failed');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusColor = (test) => {
    if (!results[test]) return 'info';
    return results[test].ok || results[test].status === 401 ? 'success' : 'error';
  };

  return (
    <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom>
        🔍 Connection Diagnostic Tool
      </Typography>
      
      {status === 'testing' && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <CircularProgress size={20} />
          <Typography>Testing connections...</Typography>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Connection Error: {error}
        </Alert>
      )}

      {Object.keys(results).length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>Test Results:</Typography>
          
          {/* Health Check */}
          <Alert severity={getStatusColor('health')} sx={{ mb: 1 }}>
            <strong>Backend Health:</strong> {results.health?.ok ? '✅ Working' : '❌ Failed'} 
            (Status: {results.health?.status})
          </Alert>

          {/* Blogs API */}
          <Alert severity={getStatusColor('blogs')} sx={{ mb: 1 }}>
            <strong>Blogs API:</strong> {results.blogs?.ok ? '✅ Working' : '❌ Failed'} 
            (Status: {results.blogs?.status})
            {results.blogs?.data?.blogs && ` - Found ${results.blogs.data.blogs.length} blogs`}
          </Alert>

          {/* Auth API */}
          <Alert severity={getStatusColor('auth')} sx={{ mb: 1 }}>
            <strong>Auth API:</strong> {results.auth?.status === 401 ? '✅ Working' : '❌ Unexpected'} 
            (Status: {results.auth?.status})
          </Alert>

          {/* Registration */}
          <Alert severity={getStatusColor('register')} sx={{ mb: 1 }}>
            <strong>Registration:</strong> {results.register?.ok ? '✅ Working' : '❌ Failed'} 
            (Status: {results.register?.status})
            {results.register?.data?.user && ` - Created user: ${results.register.data.user.name}`}
          </Alert>
        </Box>
      )}

      <Box sx={{ mt: 3 }}>
        <Button variant="contained" onClick={testConnection} disabled={status === 'testing'}>
          Run Test Again
        </Button>
      </Box>

      {status === 'completed' && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <strong>Next Steps:</strong>
          <br />• If all tests show ✅, the backend is working correctly
          <br />• Try clearing browser cache and hard refresh (Ctrl+Shift+R)
          <br />• Check browser console for any JavaScript errors
          <br />• Make sure you're accessing http://localhost:3000
        </Alert>
      )}
    </Box>
  );
};

export default ConnectionTest;