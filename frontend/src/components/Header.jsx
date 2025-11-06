import React from "react";
import { FaBell } from "react-icons/fa";
 
const Header = ({ role }) => {
  return (
<header style={styles.header}>
<div style={styles.left}>
<h2 style={styles.title}>Dashboard</h2>
<input type="text" placeholder="Search..." style={styles.searchBox} />
</div>
<div style={styles.right}>
<FaBell style={{ fontSize: "18px", color: "#c62828", cursor: "pointer" }} />
<div style={styles.profileContainer}>
<img
            src="https://via.placeholder.com/35"
            alt="profile"
            style={styles.profileImg}
          />
<div>
<p style={styles.profileName}>Niharika Koti</p>
<p style={styles.profileRole}>{role}</p>
</div>
</div>
</div>
</header>
  );
};
 
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 25px",
    backgroundColor: "white",
    borderBottom: "1px solid #ddd",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  searchBox: {
    padding: "6px 10px",
    border: "1px solid #ccc",
    borderRadius: "4px",
    fontSize: "14px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  profileImg: {
    borderRadius: "50%",
  },
  profileName: {
    fontSize: "13px",
    fontWeight: "bold",
  },
  profileRole: {
    fontSize: "12px",
    color: "#555",
  },
};
 
export default Header;