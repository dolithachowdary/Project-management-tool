import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DashboardContent from "../components/DashboardContent";

function Dashboard() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("userData"));
    if (userData?.role) {
      setRole(userData.role);
    } else {
      // If no user data found, redirect back to login
      window.location.href = "/login";
    }
  }, []);

  if (!role) {
    return <p style={{ textAlign: "center", marginTop: "50px" }}>Loading...</p>;
  }

  return (
    <div style={styles.container}>
      <Sidebar role={role} />
      <div style={styles.main}>
        <Header role={role} />
        {/*  Pass role to shared DashboardContent */}
        <DashboardContent role={role} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: "white",
    color: "black",
  },
  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
};

export default Dashboard;
