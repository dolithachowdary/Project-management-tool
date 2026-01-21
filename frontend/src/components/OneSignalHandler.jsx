import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import api from '../api/axios';
import { useNavigate, useLocation } from 'react-router-dom';

const OneSignalHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const initOneSignal = async () => {
            if (window.OneSignalInitialized) return;
            try {
                console.log('[OneSignal] Initializing...');
                await OneSignal.init({
                    appId: process.env.REACT_APP_ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true,
                    notifyButton: { enable: false }
                });

                const supported = await OneSignal.isPushNotificationsSupported();
                console.log('[OneSignal] Push supported:', supported);
                if (!supported) return;

                window.OneSignalInitialized = true;

                // Handle notification click
                OneSignal.on("notificationClick", async (event) => {
                    console.log('[OneSignal] Notification clicked:', event);
                    window.dispatchEvent(new CustomEvent("notifications:refresh"));
                    const data = event.notification.data;
                    if (data?.project_id) navigate(`/projects/${data.project_id}`);
                    else if (data?.sprint_id) navigate(`/sprints/${data.sprint_id}`);
                    else if (data?.task_id) navigate(`/tasks`);
                });

                console.log('[OneSignal] Initialization complete');
            } catch (e) {
                console.error('[OneSignal] Error during init:', e);
            }
        };

        const trySavingPlayerId = async () => {
            try {
                const userData = JSON.parse(localStorage.getItem("userData") || "{}");
                if (!userData.accessToken) {
                    console.log('[OneSignal] No access token, skipping save');
                    return;
                }

                const isSubscribed = await OneSignal.isPushNotificationsEnabled();
                console.log('[OneSignal] Is subscribed:', isSubscribed);

                if (isSubscribed) {
                    const playerId = await OneSignal.getUserId();
                    if (playerId) {
                        console.log('[OneSignal] Saving Player ID:', playerId);
                        const res = await api.post("/users/save-player-id", { playerId });
                        console.log('[OneSignal] Save response:', res.data);
                    }
                }
            } catch (err) {
                console.error('[OneSignal] Save Error:', err);
            }
        };

        const setup = async () => {
            await initOneSignal();
            await trySavingPlayerId();
        };

        setup();

        // Listen for subscription changes
        const onSubChange = async (isSubscribed) => {
            console.log('[OneSignal] Subscription change:', isSubscribed);
            if (isSubscribed) {
                await trySavingPlayerId();
            }
        };
        OneSignal.on("subscriptionChange", onSubChange);

        return () => {
            OneSignal.off("subscriptionChange", onSubChange);
        };
    }, [navigate, location.pathname]);


    return null;
};

export default OneSignalHandler;
