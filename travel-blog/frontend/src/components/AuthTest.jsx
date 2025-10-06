import React, { useState } from 'react';
import { Button, Box, Typography, Alert, Paper } from '@mui/material';
import * as authAPI from '../api/auth';

export default function AuthTest() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...');
    
    try {
      const testUser = {
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'testpass123'
      };
      
      console.log('Testing registration with:', testUser);
      const response = await authAPI.register(testUser);
      console.log('Registration response:', response);
      
      setResult(`✅ Registration successful! Token: ${response.token?.substring(0, 20)}...`);
    } catch (error) {
      console.error('Registration test failed:', error);
      setResult(`❌ Registration failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testLogin = async () => {
    setLoading(true);
    setResult('Testing login...');
    
    try {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      console.log('Testing login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('Login response:', response);
      
      setResult(`✅ Login successful! Token: ${response.token?.substring(0, 20)}...`);
    } catch (error) {
      console.error('Login test failed:', error);
      setResult(`❌ Login failed: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');
    
    try {
      const response = await fetch('http://localhost:5001/api/auth/profile');
      const text = await response.text();
      
      setResult(`✅ Connection successful! Status: ${response.status}, Response: ${text}`);
    } catch (error) {
      console.error('Connection test failed:', error);
      setResult(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPackages = async () => {
    setLoading(true);
    setResult('Testing packages API...');
    
    try {
      const response = await fetch('http://localhost:5001/api/packages');
      const data = await response.json();
      
      if (response.ok) {
        setResult(`✅ Packages API working! Found ${data.packages?.length || 0} packages`);
      } else {
        setResult(`❌ Packages API error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Packages test failed:', error);
      setResult(`❌ Packages API failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCart = async () => {
    setLoading(true);
    setResult('Testing cart API...');
    
    try {
      const response = await fetch('http://localhost:5001/api/cart');
      
      if (response.status === 401) {
        setResult(`✅ Cart API working! (Auth required - this is expected)`);
      } else if (response.ok) {
        const data = await response.json();
        setResult(`✅ Cart API working! Response: ${JSON.stringify(data)}`);
      } else {
        const data = await response.json();
        setResult(`❌ Cart API error: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Cart test failed:', error);
      setResult(`❌ Cart API failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 4, m: 2 }}>
      <Typography variant="h5" gutterBottom>
        Authentication API Test
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Button 
          variant="contained" 
          onClick={testConnection}
          disabled={loading}
        >
          Test Connection
        </Button>
        <Button 
          variant="contained" 
          onClick={testPackages}
          disabled={loading}
          color="secondary"
        >
          Test Packages
        </Button>
        <Button 
          variant="contained" 
          onClick={testCart}
          disabled={loading}
          color="info"
        >
          Test Cart
        </Button>
        <Button 
          variant="contained" 
          onClick={testRegistration}
          disabled={loading}
        >
          Test Registration
        </Button>
        <Button 
          variant="contained" 
          onClick={testLogin}
          disabled={loading}
        >
          Test Login
        </Button>
      </Box>

      {result && (
        <Alert 
          severity={result.includes('✅') ? 'success' : 'error'}
          sx={{ mt: 2 }}
        >
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
            {result}
          </pre>
        </Alert>
      )}
    </Paper>
  );
}