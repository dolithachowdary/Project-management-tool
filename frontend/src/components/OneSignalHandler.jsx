import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OneSignalHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const runOneSignal = async () => {
            try {
                console.log('[OneSignal] Initializing with App ID:', process.env.REACT_APP_ONESIGNAL_APP_ID);

                await OneSignal.init({
                    appId: process.env.REACT_APP_ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    notifyButton: {
                        enable: false,
                    },
                });

                console.log('[OneSignal] Initialized successfully');

                const savePlayerId = async () => {
                    try {
                        const playerId = await OneSignal.getUserId();
                        console.log('[OneSignal] Current Player ID:', playerId);

                        if (playerId) {
                            console.log('[OneSignal] Saving player ID to backend...');
                            const response = await api.post("/users/save-player-id", { playerId });
                            console.log('[OneSignal] Player ID saved successfully:', response.data);
                        } else {
                            console.log('[OneSignal] No player ID available yet');
                        }
                    } catch (error) {
                        console.error('[OneSignal] Error saving player ID:', error);
                    }
                };

                // Check subscription status
                const isPushSupported = await OneSignal.isPushNotificationsSupported();
                console.log('[OneSignal] Push notifications supported:', isPushSupported);

                if (isPushSupported) {
                    const permission = await OneSignal.getNotificationPermission();
                    console.log('[OneSignal] Current permission:', permission);

                    const isSubscribed = await OneSignal.isPushNotificationsEnabled();
                    console.log('[OneSignal] Is subscribed:', isSubscribed);

                    // If already subscribed, save the player ID
                    if (isSubscribed) {
                        await savePlayerId();
                    }
                }

                // Listen for subscription changes (e.g. user clicks "Allow")
                OneSignal.on('subscriptionChange', async (isSubscribed) => {
                    console.log('[OneSignal] Subscription changed:', isSubscribed);
                    if (isSubscribed) {
                        // Wait a bit for the player ID to be generated
                        setTimeout(async () => {
                            await savePlayerId();
                        }, 1000);
                    }
                });

                // Listen for permission prompt display
                OneSignal.on('permissionPromptDisplay', () => {
                    console.log('[OneSignal] Permission prompt displayed');
                });

                // Listen for notification permission changes
                OneSignal.on('notificationPermissionChange', async (permissionChange) => {
                    console.log('[OneSignal] Permission changed:', permissionChange);
                    if (permissionChange.to === 'granted') {
                        setTimeout(async () => {
                            await savePlayerId();
                        }, 1000);
                    }
                });

                OneSignal.on('notificationClick', (event) => {
                    console.log('[OneSignal] Notification clicked:', event);
                    const data = event.notification.data;
                    if (data?.project_id) {
                        navigate(`/projects/${data.project_id}`);
                    } else if (data?.sprint_id) {
                        navigate(`/sprints/${data.sprint_id}`);
                    } else if (data?.task_id) {
                        navigate(`/tasks`);
                    }
                });

            } catch (e) {
                console.error('[OneSignal] Init Error:', e);
            }
        };

        runOneSignal();
    }, [navigate]);

    return null;
};

export default OneSignalHandler;
