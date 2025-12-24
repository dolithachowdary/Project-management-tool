import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";

const RED = "#C62828";

export default function TaskForm({ onSave, onCancel, projectList, peopleList, statusList, moduleList, userData }) {
  const [formData, setFormData] = useState({
    taskName: "",
    moduleName: moduleList[0] || "",
    projectName: projectList[0] || "",
    assignedTo: peopleList[0] || "",
    status: "To Do",
    startDate: "",
    endDate: "",
    priority: "Medium"
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.taskName.trim()) {
      alert("Please enter task name");
      return;
    }
    onSave(formData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      transition: "background-color 0.2s",
      ":hover": {
        backgroundColor: "#F3F4F6"
      }
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
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      ":focus": {
        borderColor: RED,
        boxShadow: `0 0 0 3px rgba(198, 40, 40, 0.1)`
      }
    },
    select: {
      width: "100%",
      padding: "12px 14px",
      borderRadius: "8px",
      border: "1px solid #E6E9EE",
      fontSize: "14px",
      outline: "none",
      backgroundColor: "#fff",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
      ":focus": {
        borderColor: RED,
        boxShadow: `0 0 0 3px rgba(198, 40, 40, 0.1)`
      }
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
      flex: 1,
      transition: "background-color 0.2s, transform 0.1s",
      ":hover": {
        backgroundColor: "#B71C1C",
        transform: "translateY(-1px)"
      },
      ":active": {
        transform: "translateY(0)"
      }
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
      flex: 1,
      transition: "background-color 0.2s, border-color 0.2s",
      ":hover": {
        backgroundColor: "#F9FAFB",
        borderColor: "#D1D5DB"
      }
    }
  };

  return React.createElement("div", { style: styles.formContainer },
    React.createElement("div", { style: styles.formHeader },
      React.createElement("h3", { style: styles.formTitle }, "Add New Task"),
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
        // Task Name (Full width)
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

        // Module Name (Dropdown)
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Module"),
          React.createElement("select", {
            name: "moduleName",
            value: formData.moduleName,
            onChange: handleChange,
            style: styles.select
          },
            moduleList.map(module => 
              React.createElement("option", { key: module, value: module }, module)
            )
          )
        ),

        // Project
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Project"),
          React.createElement("select", {
            name: "projectName",
            value: formData.projectName,
            onChange: handleChange,
            style: styles.select
          },
            projectList.map(project => 
              React.createElement("option", { key: project, value: project }, project)
            )
          )
        ),

        // Assigned To
        React.createElement("div", { style: styles.formGroup },
          React.createElement("label", { style: styles.label }, "Assigned To"),
          React.createElement("select", {
            name: "assignedTo",
            value: formData.assignedTo,
            onChange: handleChange,
            style: styles.select
          },
            peopleList.map(person => {
              const user = userData[person] || { name: person, role: "User" };
              return React.createElement("option", { key: person, value: person }, 
                `${person} - ${user.name} (${user.role})`
              );
            })
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
            statusList.map(status => 
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

        // Start Date
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

        // End Date
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

        // Buttons
        React.createElement("div", { style: styles.buttonGroup },
          React.createElement("button", {
            type: "submit",
            style: styles.saveButton
          }, "Save Task"),
          React.createElement("button", {
            type: "button",
            style: styles.cancelButton,
            onClick: onCancel
          }, "Cancel")
        )
      )
    )
  );
}