import React from "react";
import { FaSignOutAlt, FaStickyNote } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ import both

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Sprints", path: "/sprints" },
    { name: "Tasks", path: "/tasks" },
    { name: "Timesheets", path: "/timesheets" },
    { name: "Meetings", path: "/meetings" },
  ];

  const handleSignOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <aside style={styles.sidebar}>
      <div>
        <div style={styles.logoContainer}>
          <img src="/light-redsage.png" alt="Logo" style={styles.logo} />
        </div>

        <nav>
          {menuItems.map((item) => (
            <button
              key={item.name}
              style={{
                ...styles.menuButton,
                ...(location.pathname === item.path
                  ? styles.activeButton
                  : {}),
              }}
              onClick={() => navigate(item.path)} // ✅ navigation works now
            >
              {item.name}
            </button>
          ))}
        </nav>
      </div>

      <div style={styles.bottomSection}>
        <button style={styles.bottomButton}>
          <FaStickyNote /> Notes
        </button>

        <button style={styles.bottomButton} onClick={handleSignOut}>
          <FaSignOutAlt /> Sign Out
        </button>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "230px",
    backgroundColor: "#fff",
    color: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
    borderRight: "1px solid #e0e0e0",
  },
  logoContainer: {
    textAlign: "center",
    padding: "20px 0",
    borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
  },
  logo: {
    width: "190px",
  },
  menuButton: {
    display: "block",
    width: "100%",
    padding: "10px 20px",
    border: "none",
    background: "none",
    color: "black",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "18px",
    fontFamily: "Poppins, sans-serif",
    transition: "0.3s ease",
  },
  activeButton: {
    backgroundColor: "#f5f5f5",
    borderLeft: "4px solid #c71b1b",
    fontWeight: "600",
  },
  bottomSection: {
    padding: "10px 20px",
  },
  bottomButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "none",
    border: "none",
    color: "black",
    cursor: "pointer",
    fontSize: "17px",
    marginTop: "10px",
    fontFamily: "Poppins, sans-serif",
  },
};

export default Sidebar;
