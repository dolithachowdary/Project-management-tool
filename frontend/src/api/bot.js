import api from './axios';

export const askBot = (query) => {
    return api.post('/bot/ask', { query });
};
