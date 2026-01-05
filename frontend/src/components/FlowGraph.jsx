import React, { useMemo, useRef, useState, useEffect } from 'react';
import { X, Box, ClipboardList, User, Zap, Layers, GitGraph, Workflow, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Avatar from './Avatar';

/* -------------------- Layout constants -------------------- */
const NODE_WIDTH = 210;
const NODE_HEIGHT = 64;
const COL_WIDTH = 280;
const ROW_GAP = 30;

/* -------------------- Pastel palette -------------------- */
const flowBg = {
    project: 'rgba(79,125,255,0.08)',
    module: 'rgba(139,92,246,0.08)',
    sprint: 'rgba(236,72,153,0.08)',
    goal: 'rgba(16,185,129,0.08)',
    task: 'rgba(249,115,22,0.08)',
    person: 'rgba(168, 85, 247, 0.1)',
};

const flowBorder = {
    project: '#4F7DFF',
    module: '#8b5cf6',
    sprint: '#ec4899',
    goal: '#10b981',
    task: '#f97316',
    person: '#a855f7',
};

/* -------------------- Data Helper -------------------- */
const extractGoals = (sprintOrSprints) => {
    const goalsList = [];
    const items = Array.isArray(sprintOrSprints) ? sprintOrSprints : [sprintOrSprints];

    items.forEach(s => {
        if (!s || !s.goal) return;
        let parsed = [];
        try {
            const raw = typeof s.goal === 'string' ? JSON.parse(s.goal) : s.goal;
            parsed = Array.isArray(raw) ? raw : [raw];
        } catch (e) {
            parsed = s.goal.split("\n").filter(g => g.trim());
        }

        parsed.forEach((g, i) => {
            const text = typeof g === 'string' ? g : (g.text || '');
            if (text) {
                goalsList.push({
                    id: `goal_${s.id}_${i}`,
                    sprint_id: s.id,
                    goal_index: i,
                    name: text,
                    type: 'goal'
                });
            }
        });
    });
    return goalsList;
};

/* ========================================================= */

const FlowGraph = ({ type = 'project', data, onClose }) => {
    const { project = {}, sprint = {}, modules = [], sprints = [], tasks = [] } = data || {};

    /* -------------------- Zoom & pan state -------------------- */
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const isPanning = useRef(false);
    const panStart = useRef({ x: 0, y: 0 });
    const viewportRef = useRef(null);

    // Block background scroll
    useEffect(() => {
        const originalStyle = window.getComputedStyle(document.body).overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = originalStyle;
        };
    }, []);

    // Zoom handler with passive: false to prevent background scroll
    useEffect(() => {
        const vp = viewportRef.current;
        if (!vp) return;

        const handleWheel = (e) => {
            e.preventDefault();
            const delta = -e.deltaY * 0.001;
            setScale((s) => Math.min(2, Math.max(0.4, s + delta)));
        };

        vp.addEventListener('wheel', handleWheel, { passive: false });
        return () => vp.removeEventListener('wheel', handleWheel);
    }, []);


    const onMouseDown = (e) => {
        isPanning.current = true;
        panStart.current = {
            x: e.clientX - offset.x,
            y: e.clientY - offset.y,
        };
    };

    const onMouseMove = (e) => {
        if (!isPanning.current) return;
        setOffset({
            x: e.clientX - panStart.current.x,
            y: e.clientY - panStart.current.y,
        });
    };

    const onMouseUp = () => {
        isPanning.current = false;
    };

    /* -------------------- Nodes -------------------- */
    const nodes = useMemo(() => {
        if (!data) return [];
        const cols = [];
        const list = [];

        if (type === 'project') {
            // Project Details Flow: project -> modules -> sprints -> goals -> tasks
            cols[0] = [{ id: project.id, name: project.name, type: 'project' }];
            cols[1] = modules.map(m => ({ id: m.id, name: m.name, type: 'module' }));
            cols[2] = sprints.map(s => ({ id: s.id, name: `Sprint ${s.sprint_number}`, type: 'sprint' }));
            cols[3] = extractGoals(sprints);
            cols[4] = tasks.slice(0, 30).map(t => ({ id: t.id, name: t.title, type: 'task' }));
        } else {
            // Sprint Details Flow: sprint -> goals -> modules -> tasks -> persons
            cols[0] = [{ id: sprint.id, name: sprint.name, type: 'sprint' }];

            const sprintGoals = extractGoals(sprint);
            cols[1] = sprintGoals;

            const mods = modules.map(m => ({ id: m.id, name: m.name, type: 'module' }));
            if (tasks.some(t => !t.module_id)) {
                mods.push({ id: 'orphans', name: 'General Tasks', type: 'module' });
            }
            cols[2] = mods;
            cols[3] = tasks.slice(0, 20).map(t => ({ id: t.id, name: t.title, type: 'task' }));

            const people = [];
            const seen = new Set();
            tasks.forEach(t => {
                if (t.assignee_id && !seen.has(t.assignee_id)) {
                    seen.add(t.assignee_id);
                    people.push({ id: t.assignee_id, name: t.assignee_name, type: 'person' });
                }
            });
            cols[4] = people;
        }

        cols.forEach((col, c) => {
            if (!col) return;
            const totalHeight = col.length * (NODE_HEIGHT + ROW_GAP);
            const startY = Math.max(50, (800 - totalHeight) / 2);
            col.forEach((n, r) => {
                n.x = c * COL_WIDTH + 60;
                n.y = startY + r * (NODE_HEIGHT + ROW_GAP);
                list.push(n);
            });
        });

        return list;
    }, [type, data, project, modules, sprints, tasks, sprint]);

    useEffect(() => {
        if (nodes.length > 0 && viewportRef.current) {
            const rect = viewportRef.current.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const minX = Math.min(...nodes.map(n => n.x));
            const maxX = Math.max(...nodes.map(n => n.x)) + NODE_WIDTH;
            const minY = Math.min(...nodes.map(n => n.y));
            const maxY = Math.max(...nodes.map(n => n.y)) + NODE_HEIGHT;

            const contentWidth = maxX - minX;
            const contentHeight = maxY - minY;

            const scaleX = (rect.width * 0.82) / contentWidth;
            const scaleY = (rect.height * 0.82) / contentHeight;
            const fittedScale = Math.min(1.2, scaleX, scaleY);

            setScale(fittedScale);
            setOffset({
                x: (rect.width - contentWidth * fittedScale) / 2 - minX * fittedScale,
                y: (rect.height - contentHeight * fittedScale) / 2 - minY * fittedScale
            });
        }
    }, [nodes]);

    /* -------------------- Paths -------------------- */
    const paths = useMemo(() => {
        const getNodeById = (id) => nodes.find(n => n.id === id);
        const p = [];

        if (type === 'project') {
            const projNode = getNodeById(project.id);

            // Project -> Modules
            modules.forEach(m => {
                const mNode = getNodeById(m.id);
                if (projNode && mNode) p.push({ from: projNode, to: mNode });
            });

            // Modules -> Sprints (if module has task in that sprint)
            modules.forEach(m => {
                const mNode = getNodeById(m.id);
                const sprintIds = new Set(tasks.filter(t => t.module_id === m.id).map(t => t.sprint_id));
                sprintIds.forEach(sid => {
                    const sNode = getNodeById(sid);
                    if (mNode && sNode) p.push({ from: mNode, to: sNode });
                });
            });

            // Sprints -> Goals
            const projectGoals = nodes.filter(n => n.type === 'goal');
            projectGoals.forEach(g => {
                const sNode = getNodeById(g.sprint_id);
                if (sNode) p.push({ from: sNode, to: g });
            });

            // Goals -> Tasks
            tasks.slice(0, 30).forEach(t => {
                if (t.goal_index !== null && t.goal_index !== undefined) {
                    const gNode = getNodeById(`goal_${t.sprint_id}_${t.goal_index}`);
                    const tNode = getNodeById(t.id);
                    if (gNode && tNode) p.push({ from: gNode, to: tNode });
                } else {
                    const sNode = getNodeById(t.sprint_id);
                    const tNode = getNodeById(t.id);
                    if (sNode && tNode) p.push({ from: sNode, to: tNode });
                }
            });
        } else {
            const sNode = getNodeById(sprint.id);

            // Sprint -> Goals
            const sprintGoals = nodes.filter(n => n.type === 'goal');
            sprintGoals.forEach(g => {
                if (sNode) p.push({ from: sNode, to: g });
            });

            // Goals -> Modules (linked via tasks)
            sprintGoals.forEach(g => {
                const moduleIds = new Set(tasks.filter(t => t.goal_index === g.goal_index).map(t => t.module_id || 'orphans'));
                moduleIds.forEach(mid => {
                    const mNode = getNodeById(mid);
                    if (mNode) p.push({ from: g, to: mNode });
                });
            });

            // Modules -> Tasks
            tasks.slice(0, 20).forEach(t => {
                const mNode = t.module_id ? getNodeById(t.module_id) : getNodeById('orphans');
                const tNode = getNodeById(t.id);
                if (mNode && tNode) p.push({ from: mNode, to: tNode });
            });

            // Tasks -> Persons
            tasks.forEach(t => {
                if (t.assignee_id) {
                    const tNode = getNodeById(t.id);
                    const pNode = getNodeById(t.assignee_id);
                    if (tNode && pNode) p.push({ from: tNode, to: pNode });
                }
            });
        }

        return p;
    }, [nodes, modules, tasks, type, project.id, sprint.id]);

    const icon = (type) => {
        const size = 16;
        return {
            project: <Zap size={size} color="#fff" />,
            module: <Box size={size} color="#fff" />,
            sprint: <Layers size={size} color="#fff" />,
            goal: <Target size={size} color="#fff" />,
            task: <ClipboardList size={size} color="#fff" />,
            person: <User size={size} color="#fff" />,
        }[type];
    };

    if (!data) return null;

    return (
        <motion.div style={styles.overlay}>
            <motion.div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerTitle}>
                        {type === 'project' ? <GitGraph size={20} /> : <Workflow size={20} />}
                        <span>{type === 'project' ? 'Project' : 'Sprint'} Automation Flow</span>
                    </div>
                    <button onClick={onClose} style={styles.close}><X /></button>
                </div>

                {/* Canvas */}
                <div style={styles.graphBody}>
                    <div
                        ref={viewportRef}
                        style={styles.canvas}
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUp}
                        onMouseLeave={onMouseUp}
                    >
                        <div
                            style={{
                                transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                                transformOrigin: '0 0'
                            }}
                        >
                            <svg width="1400" height="900">
                                {paths.map((p, i) => {
                                    const fromIsPerson = p.from.type === 'person';
                                    const toIsPerson = p.to.type === 'person';
                                    const P_SIZE = 60; // Person circle size

                                    const x1 = fromIsPerson ? p.from.x + (NODE_WIDTH + P_SIZE) / 2 : p.from.x + NODE_WIDTH;
                                    const y1 = fromIsPerson ? p.from.y + P_SIZE / 2 : p.from.y + NODE_HEIGHT / 2;

                                    const x2 = toIsPerson ? p.to.x + (NODE_WIDTH - P_SIZE) / 2 : p.to.x;
                                    const y2 = toIsPerson ? p.to.y + P_SIZE / 2 : p.to.y + NODE_HEIGHT / 2;

                                    const mx = (x1 + x2) / 2;

                                    return (
                                        <path
                                            key={i}
                                            d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
                                            stroke={flowBorder[p.to.type]}
                                            strokeWidth="2.5"
                                            strokeOpacity={toIsPerson ? "0.4" : "0.2"}
                                            fill="none"
                                        />
                                    );
                                })}

                                {nodes.map((n) => (
                                    <foreignObject
                                        key={n.id}
                                        x={n.x}
                                        y={n.y}
                                        width={NODE_WIDTH}
                                        height={n.type === 'person' ? 160 : NODE_HEIGHT}
                                        style={{ overflow: 'visible' }}
                                    >
                                        <div
                                            style={{
                                                ...styles.node,
                                                background: n.type === 'person' ? 'rgba(250, 245, 255, 0.95)' : flowBg[n.type],
                                                backdropFilter: n.type === 'person' ? 'blur(4px)' : 'none',
                                                border: `2px solid ${flowBorder[n.type]}55`,
                                                ...(n.type === 'person' ? {
                                                    width: 60,
                                                    height: 60,
                                                    borderRadius: '50%',
                                                    padding: 0,
                                                    justifyContent: 'center',
                                                    position: 'relative',
                                                    margin: '0 auto',
                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                                } : {})
                                            }}
                                        >
                                            {/* Top connector diamond for person nodes */}
                                            {n.type === 'person' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: -4,
                                                    left: '50%',
                                                    transform: 'translateX(-50%) rotate(45deg)',
                                                    width: 8,
                                                    height: 8,
                                                    background: flowBorder[n.type],
                                                    border: '1.5px solid #fff',
                                                    zIndex: 10
                                                }} />
                                            )}

                                            <div style={{
                                                position: 'relative',
                                                display: 'flex',
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                ...(n.type === 'person' ? { width: 44, height: 44 } : { ...styles.icon, background: `${flowBorder[n.type]}33` })
                                            }}>
                                                {n.type === 'person' ? (
                                                    <Avatar name={n.name} id={n.id} size={44} />
                                                ) : icon(n.type)}
                                            </div>

                                            {n.type === 'person' ? (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '115%',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    textAlign: 'center',
                                                    width: 220,
                                                    pointerEvents: 'none'
                                                }}>
                                                    <div style={{ ...styles.nodeName, fontSize: 15, fontWeight: 800, color: '#000', marginBottom: 2 }}>{n.name}</div>
                                                    <div style={{ ...styles.nodeType, fontSize: 10, color: flowBorder[n.type], fontWeight: 900, letterSpacing: '0.1em' }}>DEVELOPER</div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div style={styles.nodeType}>{n.type.toUpperCase()}</div>
                                                    <div style={styles.nodeName}>{n.name}</div>
                                                </div>
                                            )}
                                        </div>
                                    </foreignObject>
                                ))}
                            </svg>
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

/* -------------------- Styles -------------------- */
const styles = {
    overlay: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(15,23,42,0.4)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    },
    modal: {
        background: '#fff',
        width: '90vw',
        height: '85vh',
        borderRadius: 32,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        overflow: 'hidden'
    },
    header: {
        height: 72,
        padding: '0 32px',
        borderBottom: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    headerTitle: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        fontSize: 18,
        fontWeight: 700,
        color: '#0f172a'
    },
    close: {
        background: '#f1f5f9',
        border: 'none',
        padding: 8,
        borderRadius: 10,
        cursor: 'pointer'
    },
    graphBody: {
        flex: 1,
        overflow: 'hidden',
        background: 'radial-gradient(#e2e8f0 1px, transparent 1px)',
        backgroundSize: '28px 28px'
    },
    canvas: {
        width: '100%',
        height: '100%',
        cursor: 'grab',
        userSelect: 'none'
    },
    node: {
        width: '100%',
        height: '100%',
        borderRadius: 16,
        padding: '0 16px',
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden',
        boxSizing: 'border-box'
    },
    icon: {
        width: 32,
        height: 32,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    nodeType: {
        fontSize: 9,
        fontWeight: 800,
        color: '#64748b',
        opacity: 0.7,
        letterSpacing: '0.08em',
        marginBottom: 2
    },
    nodeName: {
        fontSize: 13,
        fontWeight: 600,
        color: '#0f172a',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    }
};

export default FlowGraph;
