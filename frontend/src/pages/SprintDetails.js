import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { getSprintHierarchy } from "../api/sprints";
import { createTask, updateTask } from "../api/tasks";
import { getModules } from "../api/modules";
import { getProjectMembers, getProjects } from "../api/projects";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Loader from "../components/Loader";
import SprintOverview from "../components/SprintOverview";
import TaskForm from "../components/TaskForm";
import Avatar from "../components/Avatar";
import PriorityBadge from "../components/PriorityBadge";
import StatusBadge from "../components/StatusBadge";
import {
  Box,
  CheckCircle2,
  Calendar,
  ClipboardList,
  LayoutDashboard,
  List,
  Kanban,
  ChevronLeft,
  Plus,
  ChevronDown,
  ChevronRight,
  Workflow,
  Pencil
} from "lucide-react";
import EditSprintModal from "../components/EditSprintModal";
import FlowGraph from "../components/FlowGraph";
import { AnimatePresence } from "framer-motion";

const SprintDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData.role || "Project Manager";
  const [activeTab, setActiveTab] = useState("overview");
  const [collapsedSections, setCollapsedSections] = useState({});
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [inlineAddingTo, setInlineAddingTo] = useState(null); // sectionKey
  const [allModules, setAllModules] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [selectedModule, setSelectedModule] = useState("");
  const [selectedAssignee, setSelectedAssignee] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("Medium");
  const [selectedGoalIndex, setSelectedGoalIndex] = useState("");
  const [selectedPotential, setSelectedPotential] = useState("");
  const [goalFilter, setGoalFilter] = useState("all");
  const [showFlowGraph, setShowFlowGraph] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditTaskModalOpen, setIsEditTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const { sprint, modules } = data || { sprint: {}, modules: [] };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsEditTaskModalOpen(true);
  };

  const handleTaskUpdate = async (taskData) => {
    try {
      await updateTask(editingTask.id, taskData);
      setIsEditTaskModalOpen(false);
      setEditingTask(null);
      loadHierarchy();
    } catch (err) {
      console.error("Failed to update task:", err);
      alert("Failed to update task.");
    }
  };

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
        priority: selectedPriority || 'Medium',
        goal_index: selectedGoalIndex !== "" ? parseInt(selectedGoalIndex) : null,
        potential: selectedPotential || null,
      };

      await createTask(payload);
      setNewTaskTitle("");
      setSelectedModule("");
      setSelectedAssignee("");
      setSelectedPriority("Medium");
      setSelectedGoalIndex("");
      setSelectedPotential("");
      setInlineAddingTo(null);
      loadHierarchy(); // Refresh the list
    } catch (err) {
      console.error("Failed to add task:", err);
      alert("Failed to add task. Please try again.");
    }
  };

  const fetchProjectData = useCallback(async (projectId) => {
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
  }, []);

  const loadHierarchy = useCallback(async () => {
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
  }, [id, fetchProjectData]);

  useEffect(() => {
    loadHierarchy();
  }, [id, loadHierarchy]);

  useEffect(() => {
    getProjects().then(res => {
      setAllProjects(res.data?.data || res.data || []);
    }).catch(console.error);
  }, []);

  const handleDragEnd = useCallback(async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    try {
      const newStatus = destination.droppableId === 'planned' ? 'todo' : destination.droppableId;

      // Optimistic update
      const updatedModules = modules.map(mod => ({
        ...mod,
        tasks: (mod.tasks || []).map(t => t.id === draggableId ? { ...t, status: newStatus } : t)
      }));
      setData({ ...data, modules: updatedModules });

      await updateTask(draggableId, { status: newStatus });
      loadHierarchy(); // Refresh to get correct ordering/metadata
    } catch (err) {
      console.error("Failed to update task status:", err);
      alert("Failed to move task. Please try again.");
      loadHierarchy(); // Revert on failure
    }
  }, [data, modules, loadHierarchy]);

  const sprintGoals = React.useMemo(() => {
    if (!sprint.goal) return [];
    try {
      const parsed = JSON.parse(sprint.goal);
      return Array.isArray(parsed) ? parsed.map((g, i) => (typeof g === 'string' ? { text: g, progress: 0, index: i } : { ...g, index: i })) : [];
    } catch (e) {
      return sprint.goal.split("\n").filter(g => g.trim()).map((g, i) => ({ text: g, progress: 0, index: i }));
    }
  }, [sprint.goal]);

  const recalculatedGoals = React.useMemo(() => {
    return sprintGoals.map(goal => {
      const goalTasks = (modules || []).flatMap(m => (m.tasks || [])).filter(t => t.goal_index === goal.index);
      const completed = goalTasks.filter(t => t.status?.toLowerCase() === 'done').length;
      const total = goalTasks.length;
      const calcProgress = total > 0 ? Math.round((completed / total) * 100) : 0;
      return { ...goal, progress: calcProgress, taskCount: total, completedCount: completed };
    });
  }, [sprintGoals, modules]);

  const filteredModules = React.useMemo(() => {
    if (goalFilter === "all") return modules;
    return modules.map(mod => ({
      ...mod,
      tasks: (mod.tasks || []).filter(t => t.goal_index === parseInt(goalFilter))
    })).filter(mod => mod.tasks.length > 0);
  }, [modules, goalFilter]);


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

  // Calculate total tasks and completed tasks based on filter
  const activeTasks = (goalFilter === "all")
    ? modules.flatMap(m => m.tasks || [])
    : modules.flatMap(m => m.tasks || []).filter(t => t.goal_index === parseInt(goalFilter));

  const totalTasks = activeTasks.length;
  const completedTasks = activeTasks.filter(t => t.status?.toLowerCase() === 'done').length;
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
          <style>
            {`
              .task-row { transition: background 0.2s; }
              .task-row:hover { background-color: #f8fafc !important; }
              .board-card { transition: transform 0.2s ease, box-shadow 0.2s ease !important; }
              .board-card:hover { 
                transform: translateY(-4px); 
                box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1) !important; 
                border-color: #e2e8f0 !important;
              }
              .hide-scrollbar::-webkit-scrollbar { display: none; }
              .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}
          </style>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <h1 style={styles.sprintTitle}>{sprint.project_name} - {sprint.name}</h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    style={styles.editHeaderBtn}
                    title="Edit Sprint"
                  >
                    <Pencil size={18} color="#94a3b8" />
                  </button>
                  <button
                    onClick={() => setShowFlowGraph(true)}
                    style={styles.editHeaderBtn}
                    title="Show Sprint Flow"
                  >
                    <Workflow size={18} color="#4F7DFF" strokeWidth={2.5} />
                  </button>
                </div>
              </div>
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

            <div style={styles.headerCenter}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <h3 style={styles.sectionTitle}>Goals</h3>
                {goalFilter !== 'all' && (
                  <button
                    onClick={() => setGoalFilter('all')}
                    style={styles.clearFilterBtn}
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div style={styles.goalsProgressContainer}>
                {recalculatedGoals.map((g, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.goalProgressItem,
                      opacity: goalFilter !== 'all' && goalFilter !== index.toString() ? 0.5 : 1,
                      border: goalFilter === index.toString() ? `1px solid ${sprint.project_color || "#3b82f6"}` : '1px solid transparent',
                      padding: '4px 8px',
                      borderRadius: '8px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setGoalFilter(goalFilter === index.toString() ? 'all' : index.toString())}
                  >
                    <div style={styles.goalInfo}>
                      <div style={{ ...styles.goalNumberSmall, backgroundColor: sprint.project_color || "#3b82f6" }}>
                        {index + 1}
                      </div>
                      <span style={styles.goalTextSmall}>{g.text}</span>
                    </div>
                    <div style={styles.goalProgressBarWrapper}>
                      <div style={styles.goalProgressBarBg}>
                        <div style={{
                          ...styles.goalProgressBarFill,
                          width: `${g.progress}%`,
                          backgroundColor: sprint.project_color || "#3b82f6"
                        }} />
                      </div>
                      <span style={styles.goalProgressText}>{g.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={styles.headerRight}>
              <div style={styles.overallWrapper}>
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
                      stroke={sprint.project_color || "#3b82f6"}
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
                  <div style={{ ...styles.progressValue, color: sprint.project_color || "#3b82f6" }}>
                    {progressPercent}<span style={{ fontSize: '10px' }}>%</span>
                  </div>
                </div>
                <h3 style={styles.sectionTitle}>
                  {goalFilter === 'all' ? 'Overall' : `Goal ${parseInt(goalFilter) + 1}`}
                </h3>
                {goalFilter !== 'all' && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                    {recalculatedGoals[parseInt(goalFilter)]?.text}
                  </div>
                )}
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
              <SprintOverview
                data={{ ...data, modules: filteredModules }}
                styles={styles}
              />
            )}

            {activeTab === "list" && (
              <div style={styles.listViewContainer}>
                {/* ACTION BAR */}
                <div style={styles.actionBar}>
                  <div style={styles.leftActions}>
                    <button
                      style={styles.addTaskBtn}
                      onClick={() => {
                        setInlineAddingTo('planned');
                        setNewTaskTitle("");
                      }}
                    >
                      <Plus size={16} />
                      Add task
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
                    const groupTasks = filteredModules.flatMap(m =>
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
                                <th style={{ ...styles.th, width: '25%' }}>Task name</th>
                                <th style={{ ...styles.th, width: '12%' }}>Module</th>
                                {goalFilter === 'all' && <th style={{ ...styles.th, width: '15%' }}>Goal</th>}
                                <th style={{ ...styles.th, width: '16%' }}>Assignee</th>
                                <th style={{ ...styles.th, width: '11%' }}>Priority</th>
                                <th style={{ ...styles.th, width: '11%' }}>Dates</th>
                                <th style={{ ...styles.th, width: '10%' }}>Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {groupTasks.map(task => (
                                <tr
                                  key={task.id}
                                  style={{ ...styles.tr, cursor: 'pointer' }}
                                  className="task-row"
                                  onClick={() => handleEditTask(task)}
                                >
                                  <td style={styles.td}>
                                    <div style={{ ...styles.taskNameCell, overflow: 'hidden' }}>
                                      <div style={{
                                        ...styles.checkCircle,
                                        borderColor: group.color,
                                        backgroundColor: task.status === 'done' ? group.color : 'transparent',
                                        flexShrink: 0
                                      }}>
                                        {task.status === 'done' && <CheckCircle2 size={12} color="#fff" />}
                                      </div>
                                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{task.title}</span>
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    <span style={styles.moduleBadge}>{task.module_name}</span>
                                  </td>
                                  {goalFilter === 'all' && (
                                    <td style={styles.td}>
                                      {task.goal_index !== null && task.goal_index !== undefined ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                          <div style={{ ...styles.goalNumberSmall, backgroundColor: sprint.project_color || "#3b82f6", width: '14px', height: '14px', fontSize: '9px' }}>
                                            {(task.goal_index + 1)}
                                          </div>
                                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                                            {recalculatedGoals[task.goal_index]?.text || `Goal ${task.goal_index + 1}`}
                                          </span>
                                        </div>
                                      ) : '-'}
                                    </td>
                                  )}
                                  <td style={styles.td}>
                                    <div style={styles.assigneeCell}>
                                      <Avatar name={task.assignee_name} id={task.assignee_id} size={24} />
                                      <span>{task.assignee_name || "Unassigned"}</span>
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    <PriorityBadge priority={task.priority} />
                                  </td>
                                  <td style={styles.td}>
                                    <div style={styles.dateCell}>
                                      {task.start_date ? new Date(task.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '-'}
                                      {task.end_date && ` - ${new Date(task.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
                                    </div>
                                  </td>
                                  <td style={styles.td}>
                                    <StatusBadge status={group.label} />
                                  </td>
                                </tr>
                              ))}
                              {groupTasks.length === 0 && (
                                <tr>
                                  <td colSpan="6" style={styles.emptyRow}>No tasks in this section</td>
                                </tr>
                              )}
                              {group.key === 'planned' && (
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
                                              <option key={m.id} value={m.id}>{m.full_name}</option>
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
                                        <div style={{ flex: 1.5, marginRight: '10px' }}>
                                          <select
                                            style={styles.inlineSelect}
                                            value={selectedGoalIndex}
                                            onChange={(e) => setSelectedGoalIndex(e.target.value)}
                                          >
                                            <option value="">Goal</option>
                                            {recalculatedGoals.map((g, idx) => (
                                              <option key={idx} value={idx}>{g.text}</option>
                                            ))}
                                          </select>
                                        </div>
                                        <div style={{ flex: 1.5, marginRight: '10px' }}>
                                          <select
                                            style={styles.inlineSelect}
                                            value={selectedPotential}
                                            onChange={(e) => setSelectedPotential(e.target.value)}
                                          >
                                            <option value="">Potential</option>
                                            {["Very Small", "Small", "Medium", "Large", "Very Large"].map(p => (
                                              <option key={p} value={p}>{p}</option>
                                            ))}
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
                              )}
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
                <div style={styles.boardContainer} className="hide-scrollbar">
                  {[
                    { key: 'planned', label: 'To Do', color: '#64748b' },
                    { key: 'in_progress', label: 'In Progress', color: '#3b82f6' },
                    { key: 'done', label: 'Completed', color: '#10b981' }
                  ].map(group => {
                    const groupTasks = filteredModules.flatMap(m =>
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
                                      className="board-card"
                                      style={{
                                        ...styles.taskCard,
                                        ...provided.draggableProps.style,
                                        cursor: 'pointer'
                                      }}
                                      onClick={() => handleEditTask(task)}
                                    >
                                      <div style={styles.cardHeader}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                          <div style={{ ...styles.moduleBadge, marginBottom: '8px', display: 'inline-block' }}>
                                            {task.module_name}
                                          </div>
                                          {task.goal_index !== null && task.goal_index !== undefined && goalFilter === 'all' && (
                                            <div style={{ ...styles.goalNumberSmall, backgroundColor: sprint.project_color || "#3b82f6", width: '16px', height: '16px', fontSize: '10px' }}>
                                              {task.goal_index + 1}
                                            </div>
                                          )}
                                        </div>
                                        <h4 style={styles.cardTitle}>{task.title}</h4>
                                        {task.goal_index !== null && task.goal_index !== undefined && goalFilter === 'all' && (
                                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                                            {recalculatedGoals[task.goal_index]?.text}
                                          </div>
                                        )}
                                      </div>

                                      <div style={styles.cardFooter}>
                                        <div style={styles.cardMeta}>
                                          <PriorityBadge priority={task.priority} style={{ fontSize: '10px' }} />
                                          {task.end_date && (
                                            <span style={styles.cardDate}>
                                              <Calendar size={10} />
                                              {new Date(task.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </span>
                                          )}
                                        </div>
                                        <Avatar name={task.assignee_name} id={task.assignee_id} size={24} />
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
                                  <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                    <select
                                      style={{ ...styles.inlineSelect, fontSize: '11px', padding: '4px' }}
                                      value={selectedModule}
                                      onChange={(e) => setSelectedModule(e.target.value)}
                                    >
                                      <option value="">Module</option>
                                      {allModules.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                      ))}
                                    </select>
                                    <select
                                      style={{ ...styles.inlineSelect, fontSize: '11px', padding: '4px' }}
                                      value={selectedGoalIndex}
                                      onChange={(e) => setSelectedGoalIndex(e.target.value)}
                                    >
                                      <option value="">Goal</option>
                                      {recalculatedGoals.map((g, idx) => (
                                        <option key={idx} value={idx}>{g.text}</option>
                                      ))}
                                    </select>
                                  </div>
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
      <AnimatePresence>
        {showFlowGraph && (
          <FlowGraph
            type="sprint"
            data={{
              sprint,
              modules: filteredModules,
              tasks: filteredModules.flatMap(m => m.tasks || [])
            }}
            onClose={() => setShowFlowGraph(false)}
          />
        )}
      </AnimatePresence>

      <EditSprintModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        sprint={sprint}
        onSprintUpdated={loadHierarchy}
        onSprintDeleted={() => navigate("/sprints")}
      />

      {isEditTaskModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent} className="hide-scrollbar">
            <TaskForm
              onSave={handleTaskUpdate}
              onCancel={() => {
                setIsEditTaskModalOpen(false);
                setEditingTask(null);
              }}
              projects={allProjects}
              currentUserId={userData?.id}
              initialData={editingTask}
              initialProjectId={sprint.project_id}
            />
          </div>
        </div>
      )}
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
    padding: "10px",
    maxWidth: "1400px",
    margin: "0",
  },
  topBar: {
    marginBottom: "8px",
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
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: "24px",
    padding: "16px 30px",
    marginBottom: "10px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
    gap: "32px",
  },
  headerLeft: {
    flex: "0 0 auto",
    minWidth: "260px",
    maxWidth: "420px",
  },
  headerCenter: {
    flex: "0 1 500px",
    padding: "0 32px",
    borderLeft: "1px solid #f1f5f9",
    borderRight: "1px solid #f1f5f9",
    maxHeight: "130px",
    overflowY: "auto",
    msOverflowStyle: 'none',
    scrollbarWidth: 'none',
    '&::-webkit-scrollbar': { display: 'none' }
  },
  headerRight: {
    flex: "0 0 120px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  overallWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  sectionTitle: {
    fontSize: "12px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: "12px",
    marginTop: 0,
    textAlign: "center",
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
    borderBottom: "2.5px solid #C62828",
    color: "#C62828",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  tabsDivider: {
    width: "100%",
    height: "1px",
    backgroundColor: "#e2e8f0",
    marginBottom: "15px",
    marginTop: "-1px", // Overlap with tab border for clean look
  },
  sprintTitle: {
    fontSize: "20px",
    fontWeight: "500",
    color: "#0f172a",
    margin: "0 0 8px 0",
  },
  editHeaderBtn: {
    background: '#f1f5f9',
    border: 'none',
    padding: '6px',
    borderRadius: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
    'hover': { background: '#e2e8f0' }
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
  goalsProgressContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  goalProgressItem: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  goalInfo: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  goalNumberSmall: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: "#3b82f6",
    color: "#fff",
    fontSize: "10px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  goalTextSmall: {
    fontSize: "14px",
    color: "#1e293b",
    fontWeight: "600",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  goalProgressBarWrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingLeft: "28px",
  },
  goalProgressBarBg: {
    flex: 1,
    height: "6px",
    backgroundColor: "#f1f5f9",
    borderRadius: "3px",
    overflow: "hidden",
  },
  goalProgressBarFill: {
    height: "100%",
    borderRadius: "3px",
    transition: "width 0.4s ease",
  },
  goalProgressText: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#64748b",
    minWidth: "30px",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    gap: "32px",
    marginTop: "0",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: "500",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingRight: "20px",
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
    tableLayout: "fixed",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    borderBottom: "1px solid #f1f5f9",
    backgroundColor: "#fcfdfe",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
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
    fontSize: "11px",
    padding: "3px 8px",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
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
  },
  priorityBadge: {
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "999px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  statusBadge: {
    fontSize: "11px",
    padding: "3px 10px",
    borderRadius: "999px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
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
    padding: "6px 4px",
    fontSize: "12px",
    outline: "none",
    background: "#fff",
    color: "#475569",
    minWidth: "85px",
  },
  inlineActions: {
    display: "flex",
    gap: "8px",
    marginLeft: "auto",
  },
  saveBtn: {
    backgroundColor: "#C62828",
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
    minWidth: "320px",
    display: "flex",
    flexDirection: "column",
    background: "#f8fafc",
    borderRadius: "20px",
    padding: "20px",
    border: "1px solid #f1f5f9",
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
    fontSize: "13px",
    fontWeight: "700",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  columnCount: {
    fontSize: "11px",
    color: "#94a3b8",
    background: "#f1f5f9",
    padding: "2px 10px",
    borderRadius: "20px",
    marginLeft: "8px",
    fontWeight: "700",
    border: "1px solid #e2e8f0",
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
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
    border: "1px solid #f1f5f9",
    cursor: "grab",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
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
    overflow: "hidden",
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
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.4)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    width: "100%",
    maxWidth: "800px",
    maxHeight: "90vh",
    overflowY: "auto",
    padding: "20px",
  },
  clearFilterBtn: {
    padding: "4px 10px",
    background: "#fee2e2",
    color: "#ef4444",
    border: "none",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  goalNumberSmall: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
    flexShrink: 0,
  }
};

export default SprintDetails;
