import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import api from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const OneSignalHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        let isMounted = true;

        const runSetup = async () => {
            const trySavingPlayerId = async () => {
                if (!isMounted) return;
                try {
                    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
                    if (!userData.accessToken) {
                        console.log('[OneSignal] No session, skipping save');
                        return;
                    }

                    const isSubscribed = await OneSignal.isPushNotificationsEnabled();
                    if (isSubscribed) {
                        const playerId = await OneSignal.getUserId();
                        if (playerId) {
                            console.log('[OneSignal] Syncing Player ID:', playerId);
                            await api.post("/users/save-player-id", { playerId });
                        }
                    }
                } catch (err) {
                    console.error('[OneSignal] Sync Error:', err);
                }
            };

            try {
                if (!window.OneSignalInitialized) {
                    console.log('[OneSignal] Initializing...');
                    await OneSignal.init({
                        appId: process.env.REACT_APP_ONESIGNAL_APP_ID,
                        allowLocalhostAsSecureOrigin: true,
                        notifyButton: { enable: false }
                    });

                    const supported = await OneSignal.isPushNotificationsSupported();
                    if (!supported) return;

                    window.OneSignalInitialized = true;

                    OneSignal.on("notificationClick", (event) => {
                        console.log('[OneSignal] Notification clicked');
                        window.dispatchEvent(new CustomEvent("notifications:refresh"));
                        const data = event.notification.data;
                        if (data?.project_id) navigate(`/projects/${data.project_id}`);
                        else if (data?.sprint_id) navigate(`/sprints/${data.sprint_id}`);
                        else if (data?.task_id) navigate(`/tasks`);
                    });

                    OneSignal.on("subscriptionChange", async (isSubscribed) => {
                        console.log('[OneSignal] Sub change:', isSubscribed);
                        if (isSubscribed) {
                            await trySavingPlayerId();
                        }
                    });
                }

                await trySavingPlayerId();

            } catch (error) {
                console.error('[OneSignal] Error:', error);
            }
        };

        runSetup();

        return () => {
            isMounted = false;
        };
    }, [navigate, location.pathname]);

    return null;
};

export default OneSignalHandler;
