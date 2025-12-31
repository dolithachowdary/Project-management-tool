import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import Avatar from "./Avatar";


const Header = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({ name: "", role: "", id: "" });
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (storedUser) {
      setUserData({
        name: storedUser.name || "",
        role: storedUser.role || "",
        id: storedUser.id || "",
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
      </div>

      <div style={styles.right}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.searchIcon} />
          <input
            type="search"
            placeholder="Search..."
            style={styles.searchBox}
          />
        </div>

        <div ref={dropdownRef} style={styles.bellWrapper}>
          <Bell
            size={20}
            style={styles.bellIcon}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          />
          <span style={styles.notificationBadge}>2</span>

          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <p style={styles.dropdownText}>No reminders</p>
            </div>
          )}
        </div>

        <div style={styles.profileContainer}>
          <Avatar name={userData.name} id={userData.id} size={36} />
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
    borderBottom: "1px solid #f1f5f9",
    flexShrink: 0,
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
    color: "#1e293b",
  },
  searchBox: {
    width: "250px",
    padding: "8px 10px 8px 36px",
    border: "1px solid #f1f5f9",
    borderRadius: "8px",
    fontSize: "14px",
    background: "#f8fafc",
    outline: "none",
  },
  searchWrapper: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#94a3b8",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  profileContainer: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  profileName: {
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  profileRole: {
    fontSize: "12px",
    color: "#64748b",
    margin: 0,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    right: 0,
    marginTop: "8px",
    background: "#fff",
    borderRadius: "8px",
    padding: "12px 16px",
    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
    border: "1px solid #f1f5f9",
    minWidth: "160px",
  },
  dropdownText: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
  },
  bellWrapper: {
    position: "relative",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "1px solid #f1f5f9",
  },
  bellIcon: {
    color: "#64748b",
  },
  notificationBadge: {
    position: "absolute",
    top: "-4px",
    right: "-4px",
    backgroundColor: "#ef4444",
    color: "#fff",
    borderRadius: "50%",
    width: "16px",
    height: "16px",
    fontSize: "10px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "2px solid #fff",
  },
};

export default Header;
