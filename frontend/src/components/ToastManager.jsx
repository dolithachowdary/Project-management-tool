import React from 'react';
import { Toaster } from 'react-hot-toast';

const ToastManager = () => {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '12px 16px',
                },
                success: {
                    style: {
                        background: '#E8F5E9',
                        color: '#2E7D32',
                        border: '1px solid #C8E6C9'
                    },
                    iconTheme: {
                        primary: '#2E7D32',
                        secondary: '#E8F5E9',
                    },
                },
                error: {
                    style: {
                        background: '#FCE4EC',
                        color: '#C62828',
                        border: '1px solid #F8BBD0'
                    },
                    iconTheme: {
                        primary: '#C62828',
                        secondary: '#FCE4EC',
                    },
                },
            }}
        />
    );
};

export default ToastManager;
