import { useState, useEffect } from 'react';
import { healthApi } from '../services/api';
import { config, getApiUrl, getHealthUrl, logConfig } from '../utils/config';

const ApiTest = () => {
    const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Log configuration in development
        logConfig();

        const checkConnection = async () => {
            try {
                await healthApi.check();
                setStatus('connected');
                setMessage(`Backend API connected successfully! (${config.apiBaseUrl})`);
            } catch {
                setStatus('error');
                setMessage(`Backend API not available. Trying to connect to: ${config.apiBaseUrl}`);
            }
        };

        checkConnection();
    }, []);

    const getStatusColor = () => {
        switch (status) {
            case 'loading': return '#fbbf24';
            case 'connected': return '#10b981';
            case 'error': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div style={{
            padding: '1rem',
            margin: '1rem 0',
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            backgroundColor: '#f9fafb'
        }}>
            <h3 style={{ color: 'black' }}>Backend API Status</h3>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                color: 'black'
            }}>
                <div
                    style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: getStatusColor()
                    }}
                />
                <span>{message}</span>
            </div>

            {config.isDev && (
                <div style={{
                    marginTop: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '0.5rem',
                    borderRadius: '0.25rem'
                }}>
                    <strong>Configuration:</strong><br />
                    API URL: <code>{getApiUrl()}</code><br />
                    Health URL: <code>{getHealthUrl()}</code>
                </div>
            )}

            {status === 'error' && (
                <p style={{
                    marginTop: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#010611ff'
                }}>
                    Start your backend with: <code>cd backend && go run cmd/main.go</code><br />
                    Or update your <code>.env</code> file with the correct API URL.
                </p>
            )}
        </div>
    );
};

export default ApiTest;
