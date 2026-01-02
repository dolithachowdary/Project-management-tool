import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getSprintHierarchy } from "../api/sprints";
import { createTask, updateTask } from "../api/tasks";
import { getModules } from "../api/modules";
import { getProjectMembers } from "../api/projects";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Loader from "../components/Loader";
import SprintOverview from "../components/SprintOverview";
import {
  Box,
  CheckCircle2,
  Clock,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  List,
  Kanban,
  ChevronLeft,
  Circle,
  Plus,
  ChevronDown,
  ChevronRight,
  Filter,
  ArrowUpDown,
} from "lucide-react";

const SprintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem("role") || "Project Manager";
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsedSections, setCollapsedSections] = useState({});
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [inlineAddingTo, setInlineAddingTo] = useState(null); // sectionKey
  const [allModules, setAllModules] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("Medium");

  const toggleSection = (key) => {
    setCollapsedSections(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleAddTask = async (sectionKey) => {
    if (!newTaskTitle.trim()) {
      setInlineAddingTo(null);
      return;
    }

    try {
      const moduleId = selectedModule || allModules[0]?.id;
      if (!moduleId) {
        alert("Please ensure there are modules in this project.");
        return;
      }

      const payload = {
        title: newTaskTitle,
        project_id: sprint.project_id,
        sprint_id: sprint.id,
        module_id: moduleId,
        assignee_id: selectedAssignee || null,
        status: sectionKey === 'planned' ? 'todo' : sectionKey,
        priority: selectedPriority || 'Medium'
      };

      await createTask(payload);
      setNewTaskTitle("");
      setSelectedModule("");
      setSelectedAssignee("");
      setSelectedPriority("Medium");
      setInlineAddingTo(null);
      loadHierarchy(); // Refresh the list
    } catch (err) {
      console.error("Failed to add task:", err);
      alert("Failed to add task. Please try again.");
    }
  };

  useEffect(() => {
    loadHierarchy();
  }, [id]);

  const loadHierarchy = async () => {
    try {
      setLoading(true);
      const res = await getSprintHierarchy(id);
      const sprintData = res.data?.data || res.data;
      setData(sprintData);

      if (sprintData?.sprint?.project_id) {
        fetchProjectData(sprintData.sprint.project_id);
      }
    } catch (err) {
      console.error("Failed to load sprint hierarchy:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      const newStatus = destination.droppableId === 'planned' ? 'todo' : destination.droppableId;

      // Optimistic update
      const updatedModules = modules.map(mod => ({
        ...mod,
        tasks: mod.tasks.map(t => t.id === draggableId ? { ...t, status: newStatus } : t)
      }));
      setData({ ...data, modules: updatedModules });

      await updateTask(draggableId, { status: newStatus });
      loadHierarchy(); // Refresh to get correct ordering/metadata
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Failed to move task. Please try again.");
      loadHierarchy(); // Revert on failure
    }
  };

  const fetchProjectData = async (projectId) => {
    try {
      const [modulesRes, membersRes] = await Promise.all([
        getModules(projectId),
        getProjectMembers(projectId)
      ]);
      setAllModules(modulesRes.data?.data || modulesRes.data || []);
      setProjectMembers(membersRes.data?.data || membersRes.data || []);
    } catch (err) {
      console.error("Failed to fetch project data:", err);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return <CheckCircle2 size={16} color="#10b981" />;
      case "in_progress":
        return <Clock size={16} color="#3b82f6" />;
      default:
        return <Circle size={16} color="#94a3b8" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "done":
        return "#f0fdf4";
      case "in_progress":
        return "#eff6ff";
      default:
        return "#f8fafc";
    }
  };

  if (loading) {
    return (
      <div style={styles.pageContainer}>
        <Sidebar />
        <div style={styles.mainContent}>
          <Header role={role} />
          <Loader />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { sprint, modules } = data;

  // Calculate total tasks and completed tasks across all modules
  const totalTasks = modules.reduce((acc, mod) => acc + (mod.tasks?.length || 0), 0);
  const completedTasks = modules.reduce((acc, mod) => {
    return acc + (mod.tasks?.filter(t => t.status?.toLowerCase() === 'done').length || 0);
  }, 0);
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // SVG Circle constants
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div style={styles.pageContainer}>
      <Sidebar />

      <div style={styles.mainContent}>
        <Header role={role} />

        <div style={styles.pageInner}>
          {/* TOP BAR / NAVIGATION */}
          <div style={styles.topBar}>
            <button onClick={() => navigate("/sprints")} style={styles.backBtn}>
              <ChevronLeft size={18} />
              <span>Back to Sprints</span>
            </button>
          </div>

          {/* SPRINT HEADER */}
          <div style={styles.sprintHeader}>
            <div style={styles.headerLeft}>
              <h1 style={styles.sprintTitle}>{sprint.project_name} - {sprint.name}</h1>
              {sprint.goal && (
                <div style={styles.goalText}>
                  <span style={styles.goalLabel}>Goal:</span> {sprint.goal}
                </div>
              )}
              <div style={styles.metaRow}>
                <div style={styles.metaItem}>
                  <Calendar size={14} />
                  <span>{new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}</span>
                </div>
                <div style={styles.metaItem}>
                  <Box size={14} />
                  <span>
                    {modules.filter(m =>
                      m.tasks?.some(t => t.sprint_id === sprint.id)
                    ).length} Modules
                  </span>
                </div>
                <div style={styles.metaItem}>
                  <ClipboardList size={14} />
                  <span>{totalTasks} Tasks</span>
                </div>
              </div>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.progressContainer}>
                <svg width="80" height="80" style={styles.progressSvg}>
                  {/* Background Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke="#e2e8f0"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  {/* Progress Circle */}
                  <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    stroke={sprint.project_color || "#0d9488"}
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={circumference}
                    style={{
                      strokeDashoffset: offset,
                      transition: "stroke-dashoffset 0.5s ease",
                      strokeLinecap: "round"
                    }}
                    transform="rotate(-90 40 40)"
                  />
                </svg>
                <div style={{ ...styles.progressValue, color: sprint.project_color || "#0d9488" }}>
                  {progressPercent}<span style={{ fontSize: '10px' }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABS NAVIGATION */}
          <div style={styles.tabsContainer}>
            <button
              style={activeTab === "overview" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("overview")}
            >
              <LayoutDashboard size={16} />
              Overview
            </button>
            <button
              style={activeTab === "list" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("list")}
            >
              <List size={16} />
              List
            </button>
            <button
              style={activeTab === "board" ? styles.tabActive : styles.tab}
              onClick={() => setActiveTab("board")}
            >
              <Kanban size={16} />
              Board
            </button>
          </div>
          <div style={styles.tabsDivider}></div>

          {/* TAB CONTENT */}
          <div style={styles.tabContent}>
            {activeTab === "overview" && (
              <SprintOverview data={data} styles={styles} />
            )}

            {activeTab === "list" && (
              <div style={styles.listViewContainer}>
                {/* ACTION BAR */}
                <div style={styles.actionBar}>
                  <div style={styles.leftActions}>
                    <button style={styles.addTaskBtn}>
                      <Plus size={16} />
                      Add task
                    </button>

                    <button style={styles.actionLink}>
                      <Filter size={16} />
                      Filter
                    </button>

                    <button style={styles.actionLink}>
                      <ArrowUpDown size={16} />
                      Sort
                    </button>
                  </div>
                </div>

                {/* TASK LIST GROUPED BY STATUS */}
                <div style={styles.taskGroups}>
                  {[
                    { key: 'planned', label: 'To Do', color: '#64748b' },
                    { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                    { key: 'done', label: 'Completed', color: '#10b981' }
                  ].map(group => {
                    const groupTasks = modules.flatMap(m =>
                      (m.tasks || []).filter(t => {
                        const status = t.status?.toLowerCase() || 'planned';
                        if (group.key === 'planned') return status === 'planned' || status === 'todo';
                        return status === group.key;
                      }).map(t => ({ ...t, module_name: m.name }))
                    );

                    return (
                      <div key={group.key} style={styles.groupSection}>
                        <div
                          style={styles.groupHeader}
                          onClick={() => toggleSection(group.key)}
                        >
                          {collapsedSections[group.key] ? (
                            <ChevronRight size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                          <span style={styles.groupLabel}>{group.label}</span>
                          <span style={styles.groupCount}>{groupTasks.length}</span>
                        </div>

                        {!collapsedSections[group.key] && (
                          <table style={styles.taskTable}>
                            <thead>
                              <tr>
                                <th style={{ ...styles.th, width: '40%' }}>Task name</th>
                                <th style={styles.th}>Module</th>
                                <th style={styles.th}>Assignee</th>
                                <th style={styles.th}>Priority</th>
                                <th style={styles.th}>Dates</th>
                                <th style={styles.th}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupTasks.map(task => (
                                <tr key={task.id} style={styles.tr}>
                                  <td style={styles.td}>
                                    <div style={styles.taskNameCell}>
                                      <div style={{
                                        ...styles.checkCircle,
                                        borderColor: group.color,
                                        backgroundColor: task.status === 'done' ? group.color : 'transparent'
                                      }}>
                                        {task.status === 'done' && <CheckCircle2 size={12} color="#fff" />}
                                      </div>
                                      <span>{task.title}</span>
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    <span style={styles.moduleBadge}>{task.module_name}</span>
                                  </td>
                                  <td style={styles.td}>
                                    <div style={styles.assigneeCell}>
                                      <div style={styles.avatar}>
                                        {(task.assignee_name || "U")[0]}
                                      </div>
                                      <span>{task.assignee_name || "Unassigned"}</span>
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    <span style={{
                                      ...styles.priorityBadge,
                                      backgroundColor: task.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                                      color: task.priority === 'High' ? '#ef4444' : '#64748b'
                                    }}>
                                      {task.priority || 'Medium'}
                                    </span>
                                  </td>
                                  <td style={styles.td}>
                                    <div style={styles.dateCell}>
                                      {task.start_date ? new Date(task.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                      {task.end_date && ` - ${new Date(task.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    <span style={{
                                      ...styles.statusBadge,
                                      backgroundColor: group.color + '10',
                                      color: group.color
                                    }}>
                                      {group.label}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                              {groupTasks.length === 0 && (
                                <tr>
                                  <td colSpan="6" style={styles.emptyRow}>No tasks in this section</td>
                                </tr>
                              )}
                              <tr
                                style={styles.addTableRow}
                                onClick={() => {
                                  if (inlineAddingTo !== group.key) {
                                    setInlineAddingTo(group.key);
                                    setNewTaskTitle("");
                                    setSelectedModule(allModules[0]?.id || "");
                                    setSelectedAssignee("");
                                    setSelectedPriority("Medium");
                                  }
                                }}
                              >
                                <td colSpan="6" style={styles.addTableCell}>
                                  {inlineAddingTo === group.key ? (
                                    <div style={styles.inlineForm}>
                                      <div style={{ flex: 4, marginRight: '10px' }}>
                                        <input
                                          autoFocus
                                          style={styles.inlineInput}
                                          placeholder="Task name"
                                          value={newTaskTitle}
                                          onChange={(e) => setNewTaskTitle(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAddTask(group.key);
                                            if (e.key === 'Escape') setInlineAddingTo(null);
                                          }}
                                        />
                                      </div>
                                      <div style={{ flex: 1.5, marginRight: '10px' }}>
                                        <select
                                          style={styles.inlineSelect}
                                          value={selectedModule}
                                          onChange={(e) => setSelectedModule(e.target.value)}
                                        >
                                          <option value="">Module</option>
                                          {allModules.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div style={{ flex: 1.5, marginRight: '10px' }}>
                                        <select
                                          style={styles.inlineSelect}
                                          value={selectedAssignee}
                                          onChange={(e) => setSelectedAssignee(e.target.value)}
                                        >
                                          <option value="">Assignee</option>
                                          {projectMembers.map(m => (
                                            <option key={m.user_id} value={m.user_id}>{m.full_name}</option>
                                          ))}
                                        </select>
                                      </div>
                                      <div style={{ flex: 1, marginRight: '10px' }}>
                                        <select
                                          style={styles.inlineSelect}
                                          value={selectedPriority}
                                          onChange={(e) => setSelectedPriority(e.target.value)}
                                        >
                                          <option value="Low">Low</option>
                                          <option value="Medium">Medium</option>
                                          <option value="High">High</option>
                                        </select>
                                      </div>
                                      <div style={styles.inlineActions}>
                                        <button
                                          style={styles.saveBtn}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddTask(group.key);
                                          }}
                                        >Save</button>
                                        <button
                                          style={styles.cancelBtn}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setInlineAddingTo(null);
                                          }}
                                        >Cancel</button>
                                      </div>
                                    </div>
                                  ) : (
                                    <span style={styles.addTaskText}>+ Add task...</span>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === "board" && (
              <DragDropContext onDragEnd={handleDragEnd}>
                <div style={styles.boardContainer}>
                  {[
                    { key: 'planned', label: 'To Do', color: '#64748b' },
                    { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                    { key: 'done', label: 'Completed', color: '#10b981' }
                  ].map(group => {
                    const groupTasks = modules.flatMap(m =>
                      (m.tasks || []).filter(t => {
                        const status = t.status?.toLowerCase() || 'planned';
                        return status === group.key || (group.key === 'planned' && status === 'todo');
                      }).map(t => ({ ...t, module_name: m.name }))
                    );

                    return (
                      <div key={group.key} style={styles.boardColumn}>
                        <div style={styles.columnHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ ...styles.columnIndicator, backgroundColor: group.color }} />
                            <span style={styles.columnTitle}>{group.label}</span>
                            <span style={styles.columnCount}>{groupTasks.length}</span>
                          </div>
                          {group.key === 'planned' && (
                            <button
                              style={styles.colHeaderAddBtn}
                              onClick={() => setInlineAddingTo(group.key)}
                            >
                              <Plus size={16} />
                            </button>
                          )}
                        </div>

                        <Droppable droppableId={group.key}>
                          {(provided, snapshot) => (
                            <div
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                              style={{
                                ...styles.columnContent,
                                backgroundColor: snapshot.isDraggingOver ? '#f1f5f9' : 'transparent'
                              }}
                            >
                              {groupTasks.map((task, index) => (
                                <Draggable key={task.id} draggableId={task.id} index={index}>
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      style={{
                                        ...styles.taskCard,
                                        ...provided.draggableProps.style
                                      }}
                                    >
                                      <div style={styles.cardHeader}>
                                        <div style={{ ...styles.moduleBadge, marginBottom: '8px', display: 'inline-block' }}>
                                          {task.module_name}
                                        </div>
                                        <h4 style={styles.cardTitle}>{task.title}</h4>
                                      </div>

                                      <div style={styles.cardFooter}>
                                        <div style={styles.cardMeta}>
                                          <span style={{
                                            ...styles.priorityBadge,
                                            fontSize: '10px',
                                            backgroundColor: task.priority === 'High' ? '#fee2e2' : '#f1f5f9',
                                            color: task.priority === 'High' ? '#ef4444' : '#64748b'
                                          }}>
                                            {task.priority || 'Medium'}
                                          </span>
                                          {task.end_date && (
                                            <span style={styles.cardDate}>
                                              <Calendar size={10} />
                                              {new Date(task.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                          )}
                                        </div>
                                        <div style={styles.cardAvatar}>
                                          {(task.assignee_name || "U")[0]}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}

                              {inlineAddingTo === group.key && (
                                <div style={styles.boardInlineForm}>
                                  <input
                                    autoFocus
                                    style={styles.boardInlineInput}
                                    placeholder="Task name"
                                    value={newTaskTitle}
                                    onChange={(e) => setNewTaskTitle(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleAddTask(group.key);
                                      if (e.key === 'Escape') setInlineAddingTo(null);
                                    }}
                                  />
                                  <div style={styles.boardInlineActions}>
                                    <button style={styles.boardSaveBtn} onClick={() => handleAddTask(group.key)}>Add</button>
                                    <button style={styles.boardCancelBtn} onClick={() => setInlineAddingTo(null)}>Cancel</button>
                                  </div>
                                </div>
                              )}

                            </div>
                          )}
                        </Droppable>
                      </div>
                    );
                  })}
                </div>
              </DragDropContext>
            )}
          </div>

          {/* HIERARCHICAL GRAPH VIEW - HIDDEN FOR NOW */}
          {/* 
                    <div style={styles.graphContainer}>
                        ... (Graph content hidden)
                    </div> 
                    */}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageContainer: {
    display: "flex",
    height: "100vh",
    background: "#f8fafc",
  },
  mainContent: {
    flex: 1,
    overflowY: "auto",
    height: "100vh",
  },
  pageInner: {
    padding: "20px",
    maxWidth: "1400px",
    margin: "0",
  },
  topBar: {
    marginBottom: "15px",
  },
  backBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "0",
    transition: "color 0.2s ease",
    ":hover": {
      color: "#1e293b",
    }
  },
  sprintHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "20px",
    marginBottom: "10px", // Reduced bottom margin to bring tabs closer
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
  },
  tabsContainer: {
    display: "flex",
    gap: "42px",
    padding: "0 20px",
    marginBottom: "0",
  },
  tab: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 0",
    background: "none",
    border: "none",
    borderBottom: "2px solid transparent",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  tabActive: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "12px 0",
    background: "none",
    border: "none",
    borderBottom: "2px solid #0f172a",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  tabsDivider: {
    width: "100%",
    height: "1px",
    backgroundColor: "#e2e8f0",
    marginBottom: "24px",
    marginTop: "-1px", // Overlap with tab border for clean look
  },
  sprintTitle: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  goalText: {
    fontSize: "18px",
    color: "#475569",
    marginBottom: "16px",
    maxWidth: "600px",
    lineHeight: "1.5",
  },
  goalLabel: {
    fontWeight: "600",
    color: "#0f172a",
    marginRight: "4px",
  },
  metaRow: {
    display: "flex",
    gap: "24px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#64748b",
    fontSize: "14px",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: "40px",
  },
  progressContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
  },
  progressSvg: {
    // transform: "rotate(-90deg)", // Handled in SVG attribute
  },
  progressValue: {
    position: "absolute",
    fontSize: "18px",
    fontWeight: "700",
    display: "flex",
    alignItems: "baseline",
  },
  graphContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px 0",
  },
  rootNode: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    width: "100%",
  },
  node: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "16px 24px",
    borderRadius: "16px",
    backgroundColor: "#fff",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e2e8f0",
    minWidth: "200px",
    zIndex: 2,
  },
  nodeContent: {
    display: "flex",
    flexDirection: "column",
  },
  nodeTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "inherit",
  },
  nodeSubtitle: {
    fontSize: "12px",
    color: "#94a3b8",
  },
  verticalLine: {
    width: "2px",
    height: "60px",
    backgroundColor: "#cbd5e1",
  },
  modulesGrid: {
    display: "flex",
    justifyContent: "center",
    gap: "32px",
    width: "100%",
    flexWrap: "wrap",
    position: "relative",
    paddingTop: "2px",
    ":before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: "50px",
      right: "50px",
      height: "2px",
      backgroundColor: "#cbd5e1",
    }
  },
  moduleBranch: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "280px",
  },
  moduleConnector: {
    width: "2px",
    height: "30px",
    backgroundColor: "#cbd5e1",
  },
  moduleNode: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  tasksContainer: {
    marginTop: "24px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    paddingLeft: "20px",
  },
  taskItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
  },
  taskConnector: {
    width: "12px",
    height: "2px",
    backgroundColor: "#cbd5e1",
  },
  taskNode: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.05)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ":hover": {
      transform: "translateX(4px)",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    }
  },
  taskInfo: {
    display: "flex",
    flexDirection: "column",
  },
  taskTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#1e293b",
    lineHeight: "1.2",
  },
  taskAssignee: {
    fontSize: "11px",
    color: "#64748b",
  },
  emptyTasks: {
    fontSize: "12px",
    color: "#94a3b8",
    fontStyle: "italic",
    textAlign: "center",
    padding: "8px",
  },
  tabContent: {
    padding: "0 10px",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
    fontSize: "14px",
    backgroundColor: "#fff",
    borderRadius: "16px",
    border: "1px solid #f1f5f9",
  },
  listViewContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "30px",
    padding: "10px 0",
  },
  taskGroups: {
    display: "flex",
    flexDirection: "column",
    gap: "40px",
  },
  groupSection: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  groupHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#1e293b",
    cursor: "pointer",
    padding: "0 4px",
  },
  groupLabel: {
    fontSize: "16px",
    fontWeight: "600",
  },
  groupCount: {
    fontSize: "14px",
    color: "#94a3b8",
    marginLeft: "4px",
  },
  taskTable: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fff",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #f1f5f9",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fcfdfe",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background 0.2s",
    ":hover": {
      backgroundColor: "#f8fafc",
    }
  },
  td: {
    padding: "12px 16px",
    fontSize: "14px",
    color: "#334155",
    verticalAlign: "middle",
  },
  taskNameCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  checkCircle: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    border: "1.5px solid",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  moduleBadge: {
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    whiteSpace: "nowrap",
  },
  assigneeCell: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  avatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    border: "1px solid #e2e8f0",
  },
  priorityBadge: {
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "6px",
    fontWeight: "500",
  },
  statusBadge: {
    fontSize: "12px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontWeight: "600",
    textTransform: "capitalize",
  },
  dateCell: {
    fontSize: "13px",
    color: "#64748b",
    whiteSpace: "nowrap",
  },
  emptyRow: {
    padding: "20px",
    textAlign: "center",
    color: "#94a3b8",
    fontSize: "13px",
    fontStyle: "italic",
  },
  addTableRow: {
    cursor: "pointer",
    ":hover": {
      backgroundColor: "#f8fafc",
    }
  },
  addTableCell: {
    padding: "12px 16px",
  },
  addTaskText: {
    fontSize: "13px",
    color: "#94a3b8",
    display: "block",
    width: "100%",
  },
  inlineForm: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    gap: "4px",
  },
  inlineInput: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    padding: "6px 8px",
    fontSize: "13px",
    outline: "none",
    background: "#fff",
  },
  inlineSelect: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    padding: "5px 4px",
    fontSize: "12px",
    outline: "none",
    background: "#fff",
    color: "#475569",
  },
  inlineActions: {
    display: "flex",
    gap: "8px",
    marginLeft: "auto",
  },
  saveBtn: {
    backgroundColor: "#0d9488",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  cancelBtn: {
    backgroundColor: "transparent",
    color: "#64748b",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    padding: "6px 12px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
  },
  actionBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  leftActions: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  addTaskBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#1e293b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      backgroundColor: "#f1f5f9",
      borderColor: "#cbd5e1",
    }
  },
  actionLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "color 0.2s",
    ":hover": {
      color: "#1e293b",
    }
  },
  boardContainer: {
    display: "flex",
    gap: "24px",
    height: "calc(100vh - 250px)",
    overflowX: "auto",
    paddingBottom: "20px",
  },
  boardColumn: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    background: "#f1f5f9",
    borderRadius: "16px",
    padding: "16px",
  },
  columnHeader: {
    marginBottom: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  columnIndicator: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
  },
  columnTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#1e293b",
  },
  columnCount: {
    fontSize: "12px",
    color: "#64748b",
    background: "#e2e8f0",
    padding: "2px 8px",
    borderRadius: "12px",
    marginLeft: "4px",
  },
  columnContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    minHeight: "100px",
    borderRadius: "8px",
    transition: "background-color 0.2s ease",
  },
  taskCard: {
    background: "#fff",
    borderRadius: "12px",
    padding: "16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    cursor: "grab",
  },
  cardHeader: {
    marginBottom: "12px",
  },
  cardTitle: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#334155",
    margin: "0",
    lineHeight: "1.4",
  },
  cardFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "16px",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  cardDate: {
    fontSize: "11px",
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  cardAvatar: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    backgroundColor: "#0d9488",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "600",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  boardAddTaskBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    padding: "8px",
    background: "none",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    marginTop: "4px",
  },
  boardInlineForm: {
    background: "#fff",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  boardInlineInput: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "6px",
    padding: "8px",
    fontSize: "14px",
    outline: "none",
  },
  boardInlineActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
  },
  boardSaveBtn: {
    padding: "6px 12px",
    background: "#0d9488",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  boardCancelBtn: {
    padding: "6px 12px",
    background: "#f1f5f9",
    color: "#64748b",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  colHeaderAddBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "24px",
    height: "24px",
    borderRadius: "6px",
    background: "none",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": {
      background: "#fff",
      color: "#0d9488",
      borderColor: "#0d9488",
    }
  }
};

export default SprintDetails;
