import React, { useState, useRef, useEffect } from "react";
import { FaBell } from "react-icons/fa";
import { useLocation } from "react-router-dom"; // ✅ Import hook to get current route
import avatar from "../assets/icons/avatar.png";

const Header = ({ role }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation(); // ✅ Get current route path

  // === Automatically generate page title from URL ===
  const getPageTitle = () => {
    const path = location.pathname; // e.g. "/projects/123"

    if (path === "/" || path === "") return "Dashboard";
    if (path === "/login") return ""; // login page → no title

    // Split and capitalize first path segment
    const segments = path.split("/").filter(Boolean);
    const main = segments[0] || "Dashboard";
    return main.charAt(0).toUpperCase() + main.slice(1);
  };

  const currentTitle = getPageTitle();

  // === Close dropdown when clicking outside ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // === Hide header entirely on login page ===
  if (location.pathname === "/login") {
    return null;
  }

  return (
    <header style={styles.header}>
      {/* === Left Section === */}
      <div style={styles.left}>
        <h2 style={styles.title}>{currentTitle}</h2>
        <input type="text" placeholder="Search..." style={styles.searchBox} />
      </div>

      {/* === Right Section === */}
      <div style={styles.right}>
        {/* Notification Bell */}
        <div style={{ position: "relative" }} ref={dropdownRef}>
          <FaBell
            style={{
              fontSize: "18px",
              color: "#c62828",
              cursor: "pointer",
            }}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
          />

          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <p style={styles.dropdownText}>No reminders</p>
            </div>
          )}
        </div>

        {/* Profile */}
        <div style={styles.profileContainer}>
          <img src={avatar} alt="Profile" style={styles.profileImg} />
          <div>
            <p style={styles.profileName}>Niharika Koti</p>
            <p style={styles.profileRole}>{role}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

// === Styles ===
const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "white",
    borderBottom: "1px solid #ddd",
    position: "relative",
    zIndex: 100,
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  title: {
    fontSize: "20px",
    fontWeight: "bold",
    textTransform: "capitalize",
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
    gap: "20px",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  profileImg: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1.5px solid #eee",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
  },
  profileName: {
    fontSize: "13px",
    fontWeight: "bold",
    margin: 0,
  },
  profileRole: {
    fontSize: "12px",
    color: "#555",
    margin: 0,
  },
  dropdown: {
    position: "absolute",
    top: "25px",
    right: 0,
    backgroundColor: "#fff",
    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
    borderRadius: "8px",
    padding: "10px 15px",
    width: "180px",
    textAlign: "center",
  },
  dropdownText: {
    margin: 0,
    color: "#555",
    fontSize: "14px",
  },
};

export default Header;
