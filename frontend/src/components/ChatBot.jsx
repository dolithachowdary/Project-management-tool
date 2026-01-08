import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles } from 'lucide-react';
import { askBot } from '../api/bot';
import { AnimatePresence, motion } from 'framer-motion';

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'system', content: 'Hi! I’m ProjectBot. Ask me about project status, tasks, sprints, or team utilization.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await askBot(input);
            const botMsg = { role: 'system', content: res.data?.answer || "I couldn't get an answer." };
            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'system', content: "Sorry, I'm having trouble connecting right now." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Trigger Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                style={styles.triggerBtn}
            >
                <MessageSquare size={24} color="#fff" />
                <div style={styles.badge}>Beta</div>
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        style={styles.container}
                    >
                        {/* Header */}
                        <div style={styles.header}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={styles.botAvatar}>
                                    <Sparkles size={16} color="#fff" />
                                </div>
                                <div>
                                    <h3 style={styles.title}>Project Assistant</h3>
                                    <span style={styles.status}>In Development</span>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={styles.closeBtn}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div style={styles.messagesArea}>
                            {messages.map((msg, i) => (
                                <div
                                    key={i}
                                    style={{
                                        ...styles.messageRow,
                                        justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                                    }}
                                >
                                    <div style={{
                                        ...styles.bubble,
                                        background: msg.role === 'user' ? '#3b82f6' : '#f1f5f9',
                                        color: msg.role === 'user' ? '#fff' : '#1e293b',
                                        borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                                        borderBottomLeftRadius: msg.role === 'system' ? 4 : 16
                                    }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div style={styles.messageRow}>
                                    <div style={{ ...styles.bubble, background: '#f1f5f9', color: '#94a3b8' }}>
                                        Thinking...
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSubmit} style={styles.inputArea}>
                            <input
                                placeholder="Ask about projects..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                style={styles.input}
                            />
                            <button type="submit" style={styles.sendBtn} disabled={loading}>
                                <Send size={18} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

const styles = {
    triggerBtn: {
        position: 'fixed',
        bottom: 100,
        right: 30,
        width: 60,
        height: 60,
        borderRadius: '50%',
        backgroundColor: '#3b82f6',
        border: 'none',
        boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 9999
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        background: '#ef4444',
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        padding: '2px 6px',
        borderRadius: 10,
        border: '2px solid #fff'
    },
    container: {
        position: 'fixed',
        bottom: 170,
        right: 30,
        width: 380,
        height: 500,
        backgroundColor: '#fff',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
    },
    header: {
        padding: 16,
        background: '#fff',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    botAvatar: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        margin: 0,
        fontSize: 15,
        fontWeight: 700,
        color: '#0f172a'
    },
    status: {
        fontSize: 11,
        color: '#64748b',
        background: '#f1f5f9',
        padding: '2px 6px',
        borderRadius: 4,
        marginTop: 2,
        display: 'inline-block'
    },
    closeBtn: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#64748b',
        padding: 4
    },
    messagesArea: {
        flex: 1,
        padding: 20,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: '#fcfdfe'
    },
    messageRow: {
        display: 'flex',
        width: '100%'
    },
    bubble: {
        maxWidth: '80%',
        padding: '10px 14px',
        fontSize: 14,
        lineHeight: 1.5,
        borderRadius: 16
    },
    inputArea: {
        padding: 16,
        borderTop: '1px solid #f1f5f9',
        display: 'flex',
        gap: 10,
        background: '#fff'
    },
    input: {
        flex: 1,
        padding: '10px 16px',
        borderRadius: 20,
        border: '1px solid #e2e8f0',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s',
    },
    sendBtn: {
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: '#3b82f6',
        color: '#fff',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }
};

export default ChatBot;
