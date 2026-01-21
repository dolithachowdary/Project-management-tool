import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OneSignalHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const initOneSignal = async () => {
            if (window.OneSignalInitialized) return;
            try {
                await OneSignal.init({
                    appId: process.env.REACT_APP_ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    notifyButton: { enable: false }
                });

                const supported = await OneSignal.isPushNotificationsSupported();
                if (!supported) return;

                window.OneSignalInitialized = true;

                // Handle subscription change
                OneSignal.on("subscriptionChange", async (isSubscribed) => {
                    if (isSubscribed) {
                        const playerId = await OneSignal.getUserId();
                        if (playerId) {
                            await api.post("/users/save-player-id", { playerId });
                        }
                    }
                });

                // Handle notification click
                OneSignal.on("notificationClick", async (event) => {
                    console.log('[OneSignal] Notification clicked:', event);

                    // Trigger refresh in Header
                    window.dispatchEvent(new CustomEvent("notifications:refresh"));

                    const data = event.notification.data;
                    if (data?.project_id) {
                        navigate(`/projects/${data.project_id}`);
                    } else if (data?.sprint_id) {
                        navigate(`/sprints/${data.sprint_id}`);
                    } else if (data?.task_id) {
                        navigate(`/tasks`);
                    }
                });

                // Prompt for permission if not already granted
                const permission = await OneSignal.getNotificationPermission();
                if (permission !== "granted") {
                    await OneSignal.showNativePrompt();
                } else {
                    // If already granted, ensure player ID is saved
                    const playerId = await OneSignal.getUserId();
                    if (playerId) {
                        await api.post("/users/save-player-id", { playerId });
                    }
                }

            } catch (e) {
                console.error('[OneSignal] Error:', e);
            }
        };

        initOneSignal();
    }, [navigate]);


    return null;
};

export default OneSignalHandler;
