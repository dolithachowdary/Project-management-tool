import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter your credentials");
      return;
    }

    // 🔹 Dummy users
    const dummyUsers = [
      {
        email: "pm@redsage.com",
        password: "pm123",
        name: "Project Manager",
        role: "Project Manager",
      },
      {
        email: "dev@redsage.com",
        password: "dev123",
        name: "Developer User",
        role: "Developer",
      },
    ];

    // 🔍 Validate credentials
    const foundUser = dummyUsers.find(
      (user) => user.email === email && user.password === password
    );

    if (foundUser) {
      const userData = {
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        token: "dummy-token",
      };
      localStorage.setItem("userData", JSON.stringify(userData));
      navigate("/dashboard");
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffffff",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "24rem",
          backgroundColor: "white",
          borderRadius: "1rem",
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          padding: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "0rem",
          }}
        >
          <img src="/redsage.png" alt="Logo" style={{ height: "5rem" }} />
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "#dc2626",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "#6b7280", textAlign: "center" }}>
            Sign in to manage your tasks
          </p>

          <form
            onSubmit={handleLogin}
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #fca5a5",
                outline: "none",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #fca5a5",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: "#ca2a2aff",
                color: "white",
                fontWeight: "600",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Sign In
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
