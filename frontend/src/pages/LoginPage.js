import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useTheme } from "../context/ThemeContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter your credentials");
      return;
    }

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

      const payload = res.data?.data || res.data || {};
      const { user, accessToken, refreshToken } = payload;

      if (!user || !accessToken) {
        throw new Error("Invalid response from server");
      }

      const userData = {
        id: user.id,
        name: user.full_name,
        email: user.email,
        role: user.role,
        accessToken,
        refreshToken,
      };

      localStorage.setItem("userData", JSON.stringify(userData));

      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Login failed");
    }
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-secondary)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: "24rem",
          backgroundColor: "var(--card-bg)",
          borderRadius: "1rem",
          boxShadow: "var(--shadow-md)",
          padding: "1.5rem",
          border: "1px solid var(--border-color)",
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
          <img
            src={theme === 'dark' ? "/dark-redsage1.png" : "/light-redsage.png"}
            alt="Logo"
            style={{ height: "4.5rem", marginBottom: "1rem" }}
            onError={(e) => { e.target.src = "/redsage.png"; }}
          />
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "var(--accent-color)",
            }}
          >
            Welcome Back
          </h1>
          <p style={{ color: "var(--text-secondary)", textAlign: "center", marginBottom: "1.5rem" }}>
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
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid var(--border-color)",
                background: "var(--input-bg)",
                color: "var(--text-primary)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                width: "100%",
                backgroundColor: "var(--accent-color)",
                color: "white",
                fontWeight: "600",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
                marginTop: "0.5rem",
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

