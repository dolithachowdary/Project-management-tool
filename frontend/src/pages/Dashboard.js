import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import DashboardContent from "../components/DashboardContent";
 
function Dashboard({ role = "Project Manager" }) {
  return (
<div style={styles.container}>
<Sidebar />
<div style={styles.main}>
<Header role={role} />
<DashboardContent />
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

 