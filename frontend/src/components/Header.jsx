import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import avatar from "../assets/icons/avatar.png";
import { Search, Bell } from "lucide-react";


const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", role: "" });
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (storedUser) {
      setUserData({
        name: storedUser.name || "",
        role: storedUser.role || "",
      });
    }
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "") return "Dashboard";
    if (path === "/login") return "";
    const main = path.split("/").filter(Boolean)[0];
    return main.charAt(0).toUpperCase() + main.slice(1);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (location.pathname === "/login") return null;

  return (
    <header style={styles.header}>
      <div style={styles.left}>
        <h2 style={styles.title}>{getPageTitle()}</h2>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            style={styles.searchBox}
          />
        </div>

      </div>

      <div style={styles.right}>
        <div ref={dropdownRef} style={styles.bellWrapper}>
          <Bell
            size={24}
            style={styles.bellIcon}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />

          {/* Notification count */}
          <span style={styles.notificationBadge}>2</span>

          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <p style={styles.dropdownText}>No reminders</p>
            </div>
          )}
        </div>


        <div style={styles.profileContainer}>
          <img src={avatar} alt="Profile" style={styles.profileImg} />
          <div>
            <p style={styles.profileName}>{userData.name || "User"}</p>
            <p style={styles.profileRole}>{userData.role || "Role"}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

const styles = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    backgroundColor: "#fff",
    borderBottom: "1px solid #ddd",
    flexShrink: 0,          // 🔒 NEVER SCROLL
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
    width: "250px",
    padding: "6px 10px 6px 32px", // space for icon
    border: "1px solid #ccc",
    borderRadius: "6px",
    fontSize: "14px",
  },

  searchWrapper: {
    position: "relative",
    marginLeft: "610px",   // ⬅ moves search slightly right
    
  },

  searchIcon: {
    position: "absolute",
    left: "10px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#888",
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
    border: "1.5px solid #eee",
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
    top: "28px",
    right: 0,
    background: "#fff",
    borderRadius: "8px",
    padding: "10px 15px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
  },

  dropdownText: {
    margin: 0,
    fontSize: "14px",
    color: "#555",
  },
  bellWrapper: {
    position: "relative",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    backgroundColor: "#f5f6fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },

  bellIcon: {
    color: "#888",
  },

  notificationBadge: {
    position: "absolute",
    top: "2px",
    right: "2px",
    backgroundColor: "#C62828",
    color: "#fff",
    borderRadius: "50%",
    width: "15px",
    height: "15px",
    fontSize: "11px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

};

export default Header;
