import { useEffect } from 'react';
import OneSignal from 'react-onesignal';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const OneSignalHandler = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const runOneSignal = async () => {
            try {
                await OneSignal.init({
                    appId: process.env.REACT_APP_ONESIGNAL_APP_ID,
                    allowLocalhostAsSecureOrigin: true
                });

                const savePlayerId = async () => {
                    const playerId = await OneSignal.getUserId();
                    if (playerId) {
                        await api.post("/users/save-player-id", { playerId });
                    }
                };

                // Check immediately
                await savePlayerId();

                // Listen for changes (e.g. user clicks "Allow")
                OneSignal.on('subscriptionChange', async (isSubscribed) => {
                    if (isSubscribed) {
                        await savePlayerId();
                    }
                });

                OneSignal.on('notificationClick', (event) => {
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
                console.error("OneSignal Init Error", e);
            }
        };

        runOneSignal();
    }, [navigate]);

    return null;
};

export default OneSignalHandler;
