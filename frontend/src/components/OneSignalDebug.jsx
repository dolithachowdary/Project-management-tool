import React, { useState, useEffect } from 'react';
import OneSignal from 'react-onesignal';
import api from '../api/axios';

const OneSignalDebug = () => {
    const [status, setStatus] = useState({});
    const [logs, setLogs] = useState([]);

    const addLog = (message, data = null) => {
        const timestamp = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp, message, data }]);
        console.log(`[${timestamp}] ${message}`, data || '');
    };

    const checkStatus = async () => {
        try {
            addLog('Checking OneSignal status...');

            const isPushSupported = await OneSignal.isPushNotificationsSupported();
            const permission = await OneSignal.getNotificationPermission();
            const isSubscribed = await OneSignal.isPushNotificationsEnabled();
            const playerId = await OneSignal.getUserId();

            const statusData = {
                isPushSupported,
                permission,
                isSubscribed,
                playerId,
                appId: process.env.REACT_APP_ONESIGNAL_APP_ID
            };

            setStatus(statusData);
            addLog('Status retrieved', statusData);
        } catch (error) {
            addLog('Error checking status', error);
        }
    };

    const requestPermission = async () => {
        try {
            addLog('Requesting notification permission...');
            await OneSignal.showNativePrompt();
            setTimeout(checkStatus, 2000);
        } catch (error) {
            addLog('Error requesting permission', error);
        }
    };

    const testSavePlayerId = async () => {
        try {
            const playerId = await OneSignal.getUserId();
            addLog('Attempting to save player ID', { playerId });

            if (!playerId) {
                addLog('No player ID available');
                return;
            }

            const response = await api.post('/users/save-player-id', { playerId });
            addLog('Save response', response.data);
        } catch (error) {
            addLog('Error saving player ID', error.response?.data || error.message);
        }
    };

    const clearLogs = () => {
        setLogs([]);
    };

    useEffect(() => {
        checkStatus();
    }, []);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>OneSignal Debug Panel</h1>

            <div style={{ marginBottom: '20px' }}>
                <h2>Current Status</h2>
                <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '5px' }}>
                    <div><strong>App ID:</strong> {status.appId || 'Not set'}</div>
                    <div><strong>Push Supported:</strong> {status.isPushSupported ? 'Yes' : 'No'}</div>
                    <div><strong>Permission:</strong> {status.permission || 'Unknown'}</div>
                    <div><strong>Is Subscribed:</strong> {status.isSubscribed ? 'Yes' : 'No'}</div>
                    <div><strong>Player ID:</strong> {status.playerId || 'Not available'}</div>
                </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <h2>Actions</h2>
                <button onClick={checkStatus} style={{ marginRight: '10px', padding: '10px' }}>
                    Refresh Status
                </button>
                <button onClick={requestPermission} style={{ marginRight: '10px', padding: '10px' }}>
                    Request Permission
                </button>
                <button onClick={testSavePlayerId} style={{ marginRight: '10px', padding: '10px' }}>
                    Test Save Player ID
                </button>
                <button onClick={clearLogs} style={{ padding: '10px' }}>
                    Clear Logs
                </button>
            </div>

            <div>
                <h2>Logs</h2>
                <div style={{
                    background: '#000',
                    color: '#0f0',
                    padding: '10px',
                    borderRadius: '5px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    fontSize: '12px'
                }}>
                    {logs.length === 0 ? (
                        <div>No logs yet...</div>
                    ) : (
                        logs.map((log, index) => (
                            <div key={index} style={{ marginBottom: '5px' }}>
                                <span style={{ color: '#888' }}>[{log.timestamp}]</span>{' '}
                                <span>{log.message}</span>
                                {log.data && (
                                    <pre style={{ margin: '5px 0', color: '#ff0' }}>
                                        {JSON.stringify(log.data, null, 2)}
                                    </pre>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default OneSignalDebug;
