import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { getModules } from "../api/modules";
import { getProjectMembers } from "../api/projects";
import { getSprints } from "../api/sprints";

const RED = "#C62828";

export default function TaskForm({ onSave, onCancel, projects = [], initialData, currentUserId }) {
  const [modules, setModules] = useState([]);
  const [members, setMembers] = useState([]);
  const [sprints, setSprints] = useState([]);
  const [isEdit, setIsEdit] = useState(false);

  const [formData, setFormData] = useState({
    taskName: "",
    module_id: "",
    project_id: "",
    sprint_id: "",
    assignee_id: "",
    status: "To Do",
    startDate: "",
    endDate: "",
    priority: "Medium",
    collaborators: []
  });

  React.useEffect(() => {
    if (initialData) {
      setIsEdit(true);
      setFormData({
        taskName: initialData.taskName,
        module_id: initialData.module_id || initialData.module?._id || "",
        project_id: initialData.project_id || initialData.project?._id || "",
        sprint_id: initialData.sprint_id || initialData.sprint?._id || "",
        assignee_id: initialData.assignee_id || initialData.assignedTo?._id || initialData.assignedTo || "",
        status: initialData.status,
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : "",
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : "",
        priority: initialData.priority,
        collaborators: initialData.collaborators || []
      });
      const pid = initialData.project_id || initialData.project?._id;
      if (pid) {
        fetchProjectDetails(pid);
      }
    }
  }, [initialData]);

  const fetchProjectDetails = async (pid) => {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.taskName.trim()) {
      alert("Please enter task name");
      return;
    }
    onSave(formData);
  };

  const onProjectChange = async (e) => {
    const pid = e.target.value;
    setFormData(prev => ({
      ...prev,
      project_id: pid,
      module_id: "",
      sprint_id: "",
      assignee_id: ""
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
    setFormData(prev => ({ ...prev, [name]: value }));
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
        React.createElement("div", { style: { ...styles.formGroup, ...styles.fullWidth } },
          React.createElement("label", { style: styles.label },
            "Task Name",
            React.createElement("span", { style: styles.required }, " *")
          ),
          React.createElement("input", {
            type: "text",
            name: "taskName",
            value: formData.taskName,
            onChange: handleChange,
            placeholder: "Enter task name",
            style: styles.input,
            required: true,
            autoFocus: true
          })
        ),

        // Project
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
        ),

        // Sprint
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Sprint", React.createElement("span", { style: styles.required }, " *")),
          React.createElement("select", {
            name: "sprint_id",
            value: formData.sprint_id,
            onChange: handleChange,
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

        // Assigned To
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Assigned To"),
          React.createElement("select", {
            name: "assignee_id",
            value: formData.assignee_id,
            onChange: handleChange,
            style: styles.select,
            disabled: !formData.project_id
          },
            React.createElement("option", { value: "" }, "Select Member"),
            members.map(person => (
              React.createElement("option", { key: person.id || person._id, value: person.id || person._id },
                person.full_name || person.name || person.email
              )
            ))
          )
        ),

        // Collaborators (Multi-select) - EDIT MODE ONLY
        isEdit && React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Collaborators"),
          React.createElement("select", {
            name: "collaborators",
            multiple: true,
            value: formData.collaborators,
            onChange: handleCollaboratorChange,
            style: { ...styles.select, height: "100px" }
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

        // Status
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Status"),
          React.createElement("select", {
            name: "status",
            value: formData.status,
            onChange: handleChange,
            style: styles.select
          },
            ["To Do", "In Progress", "Review", "Done", "Blocked"].map(status =>
              React.createElement("option", { key: status, value: status }, status)
            )
          )
        ),

        // Priority
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Priority"),
          React.createElement("select", {
            name: "priority",
            value: formData.priority,
            onChange: handleChange,
            style: styles.select
          },
            ["High", "Medium", "Low"].map(priority =>
              React.createElement("option", { key: priority, value: priority }, priority)
            )
          )
        ),

        // Dates
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Start Date"),
          React.createElement("input", {
            type: "date",
            name: "startDate",
            value: formData.startDate,
            onChange: handleChange,
            style: styles.input
          })
        ),
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "End Date"),
          React.createElement("input", {
            type: "date",
            name: "endDate",
            value: formData.endDate,
            onChange: handleChange,
            style: styles.input
          })
        ),

        React.createElement("div", { style: styles.buttonGroup },
          React.createElement("button", { type: "submit", style: styles.saveButton }, "Save Task"),
          React.createElement("button", { type: "button", style: styles.cancelButton, onClick: onCancel }, "Cancel")
        )
      )
    )
  );
}
