import React from "react";
import { FaSignOutAlt, FaStickyNote } from "react-icons/fa";
 
const Sidebar = () => {
  const menuItems = ["Dashboard", "Projects", "Sprints", "Tasks", "Timesheets", "Meetings"];
 
  return (
<aside style={styles.sidebar}>
<div>
<div style={styles.logoContainer}>
<img src="/redsage.png" alt="Logo" style={styles.logo} />
</div>
<nav>
          {menuItems.map((item) => (
<button key={item} style={styles.menuButton}>
              {item}
</button>
          ))}
</nav>
</div>
 
      <div style={styles.bottomSection}>
<button style={styles.bottomButton}>
<FaStickyNote /> Notes
</button>
<button style={styles.bottomButton}>
<FaSignOutAlt /> Sign Out
</button>
</div>
</aside>
  );
};
 
const styles = {
  sidebar: {
    width: "230px",
    backgroundColor: "#c62828",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    height: "100vh",
  },
  logoContainer: {
    textAlign: "center",
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.2)",
  },
  logo: {
    width: "70px",
  },
  menuButton: {
    display: "block",
    width: "100%",
    padding: "10px 20px",
    border: "none",
    background: "none",
    color: "white",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
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
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    marginTop: "10px",
  },
};
 
export default Sidebar;