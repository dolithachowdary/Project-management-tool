import React, { useState, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";
import { getModules } from "../api/modules";
import { getProjectMembers } from "../api/projects";
import { getSprints } from "../api/sprints";
import { formatStatus, toApiStatus } from "../utils/helpers";
import DatePicker from "./DatePicker";

const RED = "#C62828";

export default function TaskForm({ onSave, onCancel, projects = [], initialData, currentUserId, initialProjectId }) {
  const [modules, setModules] = useState([]);
  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData.role || "Developer";
  const isDev = role.toLowerCase() === "developer";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    module_id: "",
    project_id: initialProjectId || "",
    sprint_id: "",
    assignee_id: isDev ? (currentUserId || userData.id) : "",
    status: "To Do",
    start_date: "",
    end_date: "",
    priority: "Medium",
    est_hours: "",
    created_by: currentUserId || userData.id || "",
    collaborators: [],
    goal_index: "",
    potential: ""
  });

  const fetchProjectDetails = useCallback(async (pid) => {
    try {
      const [mods, mems, sprnts] = await Promise.all([
        getModules(pid),
        getProjectMembers(pid),
        getSprints(pid)
      ]);
      setModules(mods.data?.data || mods.data || []);
      setMembers(mems.data?.data || mems.data || []);
      setSprints(sprnts.data?.data || sprnts.data || []);
    } catch (err) {
      console.error("Failed to load project details", err);
    }
  }, []);

  React.useEffect(() => {
    if (initialData) {
      setIsEdit(true);
      setFormData({
        title: initialData.title || initialData.taskName || "",
        description: initialData.description || "",
        module_id: initialData.module_id || initialData.module?._id || "",
        project_id: initialData.project_id || initialData.project?._id || initialData.project?.[0]?.id || "",
        sprint_id: initialData.sprint_id || initialData.sprint?._id || "",
        assignee_id: isDev ? (currentUserId || userData.id) : (initialData.assignee_id || initialData.assignedTo?._id || initialData.assignedTo || ""),
        status: formatStatus(initialData.status) || "To Do",
        start_date: initialData.start_date ? initialData.start_date.split('T')[0] : (initialData.startDate ? initialData.startDate.split('T')[0] : ""),
        end_date: initialData.end_date ? initialData.end_date.split('T')[0] : (initialData.endDate ? initialData.endDate.split('T')[0] : ""),
        priority: initialData.priority || "Medium",
        est_hours: initialData.est_hours || "",
        created_by: initialData.created_by || currentUserId || userData.id || "",
        collaborators: initialData.collaborators || [],
        goal_index: initialData.goal_index !== undefined && initialData.goal_index !== null ? initialData.goal_index.toString() : "",
        potential: initialData.potential || ""
      });
      const pid = initialData.project_id || initialData.project?._id;
      if (pid) {
        fetchProjectDetails(pid);
      }
    } else if (initialProjectId) {
      fetchProjectDetails(initialProjectId);
    }
  }, [initialData, currentUserId, fetchProjectDetails, isDev, initialProjectId, userData.id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Please enter title");
      return;
    }
    // Sanitize payload: convert empty strings to null for optional/date fields
    const payload = {
      ...formData,
      status: toApiStatus(formData.status),
      est_hours: formData.est_hours ? parseFloat(formData.est_hours) : null,
      start_date: formData.start_date || null,
      end_date: formData.end_date || null,
      created_by: formData.created_by || null,
      goal_index: formData.goal_index !== "" ? parseInt(formData.goal_index) : null
    };
    onSave(payload);
  };

  const onProjectChange = async (e) => {
    const pid = e.target.value;
    setFormData(prev => ({
      ...prev,
      project_id: pid,
      module_id: "",
      sprint_id: "",
      assignee_id: isDev ? (currentUserId || userData.id) : "",
      goal_index: ""
    }));

    if (!pid) {
      setModules([]);
      setMembers([]);
      setSprints([]);
      return;
    }
    fetchProjectDetails(pid);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "potential") {
      const potMap = {
        'Very Small': 2,
        'Small': 4,
        'Medium': 6,
        'Large': 10,
        'Very Large': 18
      };
      setFormData(prev => ({
        ...prev,
        potential: value,
        est_hours: potMap[value] || prev.est_hours
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCollaboratorChange = (e) => {
    const selectedOptions = [...e.target.selectedOptions].map(o => o.value);
    setFormData(prev => ({ ...prev, collaborators: selectedOptions }));
  };

  const styles = {
    formContainer: {
      backgroundColor: "#fff",
      borderRadius: 12,
      padding: "24px",
      marginBottom: "20px",
      boxShadow: "0 4px 20px rgba(15,23,42,0.08)",
      border: "1px solid #E6E9EE"
    },
    formHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
      paddingBottom: "16px",
      borderBottom: "1px solid #E6E9EE"
    },
    formTitle: {
      fontSize: "18px",
      fontWeight: "600",
      color: RED,
      margin: 0
    },
    closeButton: {
      background: "transparent",
      border: "none",
      color: "#666",
      cursor: "pointer",
      fontSize: "18px",
      padding: "8px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.2s"
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(2, 1fr)",
      gap: "20px"
    },
    fullWidth: {
      gridColumn: "span 2"
    },
    formGroup: {
      marginBottom: "0"
    },
    label: {
      display: "block",
      marginBottom: "8px",
      fontWeight: "500",
      color: "#374151",
      fontSize: "14px"
    },
    required: {
      color: RED
    },
    input: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #E6E9EE",
      fontSize: "14px",
      outline: "none",
      backgroundColor: "#fff",
      boxSizing: "border-box"
    },
    textarea: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #E6E9EE",
      fontSize: "14px",
      outline: "none",
      backgroundColor: "#fff",
      boxSizing: "border-box",
      minHeight: "80px",
      resize: "vertical"
    },
    select: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #E6E9EE",
      fontSize: "14px",
      outline: "none",
      backgroundColor: "#fff",
      boxSizing: "border-box"
    },
    staticText: {
      padding: "12px 14px",
      fontSize: "14px",
      color: "#1e293b",
      background: "#f8fafc",
      borderRadius: "8px",
      border: "1px solid #e2e8f0",
      fontWeight: "600"
    },
    buttonGroup: {
      display: "flex",
      gap: "12px",
      marginTop: "24px",
      gridColumn: "span 2"
    },
    saveButton: {
      background: RED,
      color: "#fff",
      border: "none",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      flex: 1
    },
    cancelButton: {
      background: "#fff",
      color: "#374151",
      border: "1px solid #E6E9EE",
      padding: "12px 24px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "14px",
      flex: 1
    }
  };

  const statusOptions = [
    { label: "To Do", value: "To Do" },
    { label: "In Progress", value: "In Progress" },
    { label: "Review", value: "Review" },
    { label: "Done", value: "Done" },
    { label: "Blocked", value: "Blocked" }
  ];

  return React.createElement("div", { style: styles.formContainer },
    React.createElement("div", { style: styles.formHeader },
      React.createElement("h3", { style: styles.formTitle }, isEdit ? "Edit Task" : "Add New Task"),
      React.createElement("button", {
        style: styles.closeButton,
        onClick: onCancel,
        type: "button"
      },
        React.createElement(FaTimes, null)
      )
    ),

    React.createElement("form", { onSubmit: handleSubmit },
      React.createElement("div", { style: styles.formGrid },
        // Project
        !initialProjectId ? (
          React.createElement("div", { style: styles.formGroup },
            React.createElement("label", { style: styles.label }, "Project", React.createElement("span", { style: styles.required }, " *")),
            React.createElement("select", {
              name: "project_id",
              value: formData.project_id,
              onChange: onProjectChange,
              style: styles.select,
              required: true
            },
              React.createElement("option", { value: "" }, "Select Project"),
              projects.map(project =>
                React.createElement("option", { key: project._id || project.id, value: project._id || project.id }, project.name)
              )
            )
          )
        ) : (
          React.createElement("div", { style: styles.formGroup },
            React.createElement("label", { style: styles.label }, "Project"),
            React.createElement("div", { style: styles.staticText },
              projects.find(p => (p.id || p._id) === initialProjectId)?.name || "Current Project"
            )
          )
        ),

        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Sprint", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("select", {
            name: "sprint_id",
            value: formData.sprint_id,
            onChange: (e) => {
              handleChange(e);
              setFormData(prev => ({ ...prev, goal_index: "" }));
            },
            style: styles.select,
            disabled: !formData.project_id,
            required: true
          },
            React.createElement("option", { value: "" }, "Select Sprint"),
            sprints.map(s =>
              React.createElement("option", { key: s.id || s._id, value: s.id || s._id }, s.name)
            )
          )
        ),

        // Sprint Goal
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Sprint Goal", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("select", {
            name: "goal_index",
            value: formData.goal_index,
            onChange: handleChange,
            style: styles.select,
            disabled: !formData.sprint_id,
            required: true
          },
            React.createElement("option", { value: "" }, "Select Goal"),
            (() => {
              const selectedSprint = sprints.find(s => (s.id || s._id) === formData.sprint_id);
              if (!selectedSprint || !selectedSprint.goal) return [];
              try {
                const parsed = JSON.parse(selectedSprint.goal);
                return (Array.isArray(parsed) ? parsed : []).map((g, i) =>
                  React.createElement("option", { key: i, value: i.toString() }, typeof g === 'string' ? g : g.text)
                );
              } catch (e) {
                return selectedSprint.goal.split("\n").filter(g => g.trim()).map((g, i) =>
                  React.createElement("option", { key: i, value: i.toString() }, g)
                );
              }
            })()
          )
        ),

        // Module
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Module", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("select", {
            name: "module_id",
            value: formData.module_id,
            onChange: handleChange,
            style: styles.select,
            disabled: !formData.project_id,
            required: true
          },
            React.createElement("option", { value: "" }, "Select Module"),
            modules.map(module =>
              React.createElement("option", { key: module.id || module._id, value: module.id || module._id }, module.name)
            )
          )
        ),

        React.createElement("div", { style: { ...styles.formGroup, ...styles.fullWidth } },
          React.createElement("label", { style: styles.label },
            "Title",
            React.createElement("span", { style: styles.required }, " *")
          ),
          React.createElement("input", {
            type: "text",
            name: "title",
            value: formData.title,
            onChange: handleChange,
            placeholder: "Enter task title",
            style: styles.input,
            required: true,
            autoFocus: true
          })
        ),

        React.createElement("div", { style: { ...styles.formGroup, ...styles.fullWidth } },
          React.createElement("label", { style: styles.label }, "Description", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("textarea", {
            name: "description",
            value: formData.description,
            onChange: handleChange,
            placeholder: "Enter task description",
            style: styles.textarea,
            required: true
          })
        ),

        // Assigned To
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Assigned To", React.createElement("span", { style: styles.required }, " *")),
          isDev ? (
            React.createElement("div", { style: styles.staticText },
              members.find(m => (m.id || m._id) === formData.assignee_id)?.full_name || userData.name || "You"
            )
          ) : (
            React.createElement("select", {
              name: "assignee_id",
              value: formData.assignee_id,
              onChange: handleChange,
              style: styles.select,
              disabled: !formData.project_id,
              required: true
            },
              React.createElement("option", { value: "" }, "Select Member"),
              members.map(person => (
                React.createElement("option", { key: person.id || person._id, value: person.id || person._id },
                  person.full_name || person.name || person.email
                )
              ))
            )
          )
        ),

        // Status
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Status", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("select", {
            name: "status",
            value: formData.status,
            onChange: handleChange,
            style: styles.select,
            required: true
          },
            statusOptions.map(opt =>
              React.createElement("option", { key: opt.value, value: opt.value }, opt.label)
            )
          )
        ),

        // Priority
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Priority", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("select", {
            name: "priority",
            value: formData.priority,
            onChange: handleChange,
            style: styles.select,
            required: true
          },
            ["High", "Medium", "Low"].map(priority =>
              React.createElement("option", { key: priority, value: priority }, priority)
            )
          )
        ),

        // Potential
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Potential (Size)", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("select", {
            name: "potential",
            value: formData.potential,
            onChange: handleChange,
            style: styles.select,
            required: true
          },
            React.createElement("option", { value: "" }, "Select Size"),
            ["Very Small", "Small", "Medium", "Large", "Very Large"].map(p =>
              React.createElement("option", { key: p, value: p }, p)
            )
          )
        ),

        // Estimated Hours
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Est. Hours", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("input", {
            type: "number",
            step: "0.25",
            name: "est_hours",
            value: formData.est_hours,
            onChange: handleChange,
            placeholder: "0.00",
            style: styles.input,
            required: true
          })
        ),

        // Dates
        React.createElement(DatePicker, {
          label: "Start Date",
          name: "start_date",
          value: formData.start_date,
          onChange: handleChange,
        }),
        React.createElement(DatePicker, {
          label: "End Date",
          name: "end_date",
          value: formData.end_date,
          onChange: handleChange,
        }),

        // Collaborators (Multi-select) - EDIT MODE ONLY
        isEdit && React.createElement("div", { style: { ...styles.formGroup, ...styles.fullWidth } },
          React.createElement("label", { style: styles.label }, "Collaborators"),
          React.createElement("select", {
            name: "collaborators",
            multiple: true,
            value: formData.collaborators,
            onChange: handleCollaboratorChange,
            style: { ...styles.select, height: "80px" }
          },
            members
              .filter(u => (u.id || u._id) !== formData.assignee_id)
              .map(u => (
                React.createElement("option", { key: u.id || u._id, value: u.id || u._id },
                  u.full_name || u.name
                )
              ))
          )
        ),

        React.createElement("div", { style: styles.buttonGroup },
          React.createElement("button", { type: "submit", style: styles.saveButton }, "Save Task"),
          React.createElement("button", { type: "button", style: styles.cancelButton, onClick: onCancel }, "Cancel")
        )
      )
    )
  );
}
