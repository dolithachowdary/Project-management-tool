import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, X, Send, Clock, CheckCircle2, AlertCircle, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import toast from "react-hot-toast";
import Avatar from "./Avatar";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  pushReminder
} from "../api/notifications";
import { getAssignableUsers } from "../api/users";
import { timeAgo } from "../utils/helpers";

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userData, setUserData] = useState({ name: "", role: "", id: "" });
  const [reminderText, setReminderText] = useState("");
  const [mentionList, setMentionList] = useState([]);
  const [showMentions, setShowMentions] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const prevNotificationsRef = useRef([]);

  const isPM = userData.role === "Project Manager" || userData.role === "admin";

  const fetchNotifs = useCallback(async (showToast = false) => {
    try {
      const res = await getNotifications();
      const newNotifs = res.data?.data || [];
      setNotifications(newNotifs);
      const unread = newNotifs.filter(n => !n.is_read).length;
      setUnreadCount(unread);

      // Fresh notification pop-up
      if (showToast && newNotifs.length > prevNotificationsRef.current.length) {
        const latest = newNotifs[0];
        if (!latest.is_read) {
          showFreshNotification(latest);
        }
      }
      prevNotificationsRef.current = newNotifs;
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    }
  }, []);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (storedUser) {
      setUserData({
        name: storedUser.name || "",
        role: storedUser.role || "",
        id: storedUser.id || "",
      });
    }

    fetchNotifs();
    const interval = setInterval(() => fetchNotifs(true), 30000); // Poll every 30s

    if (isPM) {
      getAssignableUsers().then(res => {
        setAllUsers(res.data?.data || []);
      });
    }

    return () => clearInterval(interval);
  }, [fetchNotifs, isPM]);

  const showFreshNotification = (notif) => {
    toast.custom((t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'}`}
        style={{
          background: 'var(--bg-primary)',
          padding: '12px',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          minWidth: '300px',
          border: '1px solid var(--border-color)',
          position: 'fixed',
          bottom: '20px',
          right: '25px',
          zIndex: 9999,
          cursor: 'pointer'
        }}
        onClick={() => {
          setIsDropdownOpen(true);
          toast.dismiss(t.id);
        }}
      >
        <Avatar name={notif.sender_name || "System"} id={notif.sender_id} size={40} />
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>{notif.title}</p>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>{notif.message}</p>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toast.dismiss(t.id);
          }}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>
    ), { duration: 5000, position: 'bottom-right' });
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      fetchNotifs();
    } catch (err) {
      toast.error("Failed to mark as read");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsRead();
      fetchNotifs();
    } catch (err) {
      toast.error("Failed to mark all as read");
    }
  };

  const handlePushReminder = async () => {
    if (!reminderText.trim()) return;

    try {
      // Find @mentions
      const mentions = reminderText.match(/@(\w+)/g) || [];
      const recipientIds = [];

      if (reminderText.includes("@everyone")) {
        recipientIds.push("everyone");
      } else {
        mentions.forEach(m => {
          const name = m.substring(1).toLowerCase();
          const user = allUsers.find(u => u.full_name.toLowerCase().replace(/\s/g, '').includes(name));
          if (user) recipientIds.push(user.id);
        });
      }

      if (recipientIds.length === 0 && !reminderText.includes("@everyone")) {
        toast.error("Please @mention someone or use @everyone");
        return;
      }

      await pushReminder({
        recipient_ids: recipientIds,
        message: reminderText
      });

      toast.success("Reminders sent!");
      setReminderText("");
      setShowMentions(false);
    } catch (err) {
      toast.error("Failed to push reminder");
    }
  };

  const onReminderChange = (e) => {
    const val = e.target.value;
    setReminderText(val);

    const lastAt = val.lastIndexOf("@");
    if (lastAt !== -1) {
      const query = val.substring(lastAt + 1).toLowerCase();
      const filtered = allUsers.filter(u =>
        u.full_name.toLowerCase().includes(query)
      ).slice(0, 5);

      setMentionList(filtered);
      setShowMentions(true);
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user) => {
    const lastAt = reminderText.lastIndexOf("@");
    const base = reminderText.substring(0, lastAt);
    setReminderText(base + "@" + user.full_name + " ");
    setShowMentions(false);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path === "/login") return "";
    const parts = path.split("/").filter(Boolean);
    const main = parts[0];
    return main.charAt(0).toUpperCase() + main.slice(1);
  };

  const handleNotifClick = (notif) => {
    if (!notif.is_read) handleMarkAsRead(notif.id);

    if (notif.data?.task_id) {
      // Navigate to task (assuming there's a way to view details)
      // For now, maybe just navigate to the project or sprint
      toast.info(`Clicked: ${notif.title}`);
    } else if (notif.data?.sprint_id) {
      navigate(`/sprints/${notif.data.sprint_id}`);
    }
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div
          onClick={toggleTheme}
          style={{
            ...styles.bellWrapper,
            backgroundColor: 'var(--input-bg)',
            borderColor: 'var(--border-color)'
          }}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon size={18} color="var(--text-secondary)" /> : <Sun size={18} color="var(--text-primary)" />}
        </div>

        <div ref={dropdownRef} style={styles.bellWrapper}>
          <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bell size={20} style={styles.bellIcon} />
            {unreadCount > 0 && <span style={styles.notificationBadge}></span>}
          </div>

          {isDropdownOpen && (
            <div style={styles.dropdown}>
              <div style={styles.dropdownHeader}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>Reminders</h4>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllRead} style={styles.clearAllBtn}>Mark all as read</button>
                )}
              </div>

              {isPM && (
                <div style={styles.pushWrapper}>
                  <div style={{ position: 'relative' }}>
                    <textarea
                      placeholder="Tag someone with @..."
                      style={styles.pushInput}
                      value={reminderText}
                      onChange={onReminderChange}
                    />
                    {showMentions && mentionList.length > 0 && (
                      <div style={styles.mentionsDropdown}>
                        <div
                          style={styles.mentionItem}
                          onClick={() => {
                            const lastAt = reminderText.lastIndexOf("@");
                            const base = reminderText.substring(0, lastAt);
                            setReminderText(base + "@everyone ");
                            setShowMentions(false);
                          }}
                        >
                          <strong>@everyone</strong>
                        </div>
                        {mentionList.map(u => (
                          <div key={u.id} style={styles.mentionItem} onClick={() => insertMention(u)}>
                            <Avatar name={u.full_name} id={u.id} size={20} />
                            <span>{u.full_name}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <button onClick={handlePushReminder} style={styles.sendBtn}>
                    <Send size={14} />
                  </button>
                </div>
              )}

              <div style={styles.notifList}>
                {notifications.length === 0 ? (
                  <div style={styles.emptyState}>
                    <Clock size={40} color="var(--border-color)" style={{ marginBottom: '12px' }} />
                    <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '14px' }}>No reminders yet</p>
                  </div>
                ) : (
                  notifications.map(n => (
                    <div
                      key={n.id}
                      style={{
                        ...styles.notifItem,
                        opacity: n.is_read ? 0.6 : 1,
                        borderLeft: `4px solid ${n.project_color || (n.type === 'overdue_task' ? 'var(--error-color)' : 'var(--info-color)')}`
                      }}
                      onClick={() => handleNotifClick(n)}
                    >
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <Avatar name={n.sender_name || "System"} id={n.sender_id} size={32} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <p style={styles.notifTitle}>
                              {n.type === 'overdue_task' && <AlertCircle size={12} style={{ marginRight: 4, color: 'var(--error-color)' }} />}
                              {n.type === 'sprint_end' && <Clock size={12} style={{ marginRight: 4, color: 'var(--warning-color)' }} />}
                              {n.type === 'tag' && <CheckCircle2 size={12} style={{ marginRight: 4, color: 'var(--success-color)' }} />}
                              {n.title}
                            </p>
                            <span style={styles.notifTime}>{timeAgo(n.created_at)}</span>
                          </div>
                          <p style={styles.notifMsg}>{n.message}</p>
                          {n.project_name && (
                            <span style={{ ...styles.projectTag, color: n.project_color }}>
                              {n.project_name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={styles.profileContainer}>
          <Avatar name={userData.name} id={userData.id} size={36} />
          <div className="hidden-mobile">
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
    backgroundColor: "var(--header-bg)",
    borderBottom: "1px solid var(--border-color)",
    flexShrink: 0,
    transition: "background-color 0.3s ease, border-color 0.3s ease",
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
    color: "var(--text-primary)",
  },
  searchBox: {
    width: "250px",
    padding: "8px 10px 8px 36px",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    fontSize: "14px",
    background: "var(--input-bg)",
    color: "var(--text-primary)",
    outline: "none",
    transition: "all 0.2s",
  },
  searchWrapper: {
    position: "relative",
  },
  searchIcon: {
    position: "absolute",
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "var(--text-secondary)",
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
    color: "var(--text-primary)",
    margin: 0,
  },
  profileRole: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    margin: 0,
  },
  bellWrapper: {
    position: "relative",
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    backgroundColor: "var(--input-bg)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    border: "1px solid var(--border-color)",
    transition: "all 0.2s ease",
  },
  bellIcon: {
    color: "var(--text-secondary)",
  },
  notificationBadge: {
    position: "absolute",
    top: "2px",
    right: "2px",
    backgroundColor: "var(--error-color)",
    borderRadius: "50%",
    width: "8px",
    height: "8px",
    border: "2px solid var(--card-bg)",
  },
  dropdown: {
    position: "absolute",
    top: "120%",
    right: 0,
    width: "350px",
    background: "var(--card-bg)",
    borderRadius: "12px",
    boxShadow: "var(--shadow-md)",
    border: "1px solid var(--border-color)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    maxHeight: "500px",
  },
  dropdownHeader: {
    padding: "16px",
    borderBottom: "1px solid var(--border-color)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "var(--card-bg)",
  },
  clearAllBtn: {
    background: "none",
    border: "none",
    color: "var(--accent-color)",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  pushWrapper: {
    padding: "12px",
    borderBottom: "1px solid var(--border-color)",
    backgroundColor: "var(--bg-secondary)",
    display: "flex",
    gap: "8px",
  },
  pushInput: {
    flex: 1,
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid var(--border-color)",
    fontSize: "13px",
    outline: "none",
    resize: "none",
    height: "40px",
    minWidth: "250px",
    background: "var(--input-bg)",
    color: "var(--text-primary)",
  },
  sendBtn: {
    width: "40px",
    height: "40px",
    borderRadius: "8px",
    backgroundColor: "var(--accent-color)",
    color: "#fff",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "opacity 0.2s",
  },
  notifList: {
    flex: 1,
    overflowY: "auto",
  },
  notifItem: {
    padding: "12px 16px",
    borderBottom: "1px solid var(--border-color)",
    cursor: "pointer",
    transition: "background 0.2s",
    "&:hover": {
      backgroundColor: "var(--hover-bg)",
    }
  },
  notifTitle: {
    margin: 0,
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
  },
  notifTime: {
    fontSize: "11px",
    color: "var(--text-secondary)",
  },
  notifMsg: {
    margin: "4px 0 0 0",
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.4",
  },
  projectTag: {
    display: "inline-block",
    marginTop: "6px",
    fontSize: "11px",
    fontWeight: "600",
    background: "var(--hover-bg)",
    padding: "1px 6px",
    borderRadius: "4px",
  },
  emptyState: {
    padding: "40px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  mentionsDropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    width: "100%",
    background: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: "8px",
    boxShadow: "var(--shadow-md)",
    zIndex: 1000,
    marginTop: "4px",
  },
  mentionItem: {
    padding: "8px 12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    fontSize: "13px",
    "&:hover": {
      backgroundColor: "#f8fafc",
    }
  }
};

export default Header;
