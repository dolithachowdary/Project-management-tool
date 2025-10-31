import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
  e.preventDefault();
  if (!email || !password) {
    alert("Please enter your credentials");
    return;
  }

  try {
    setLoading(true);
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Login failed");

    // Save both tokens
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    navigate("/dashboard");
  } catch (err) {
    alert(err.message);
  } finally {
    setLoading(false);
  }
};


  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
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
            gap: "0.5rem",
          }}
        >
          <img src="/redsage.png" alt="Logo" style={{ height: "5rem" }} />
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626" }}>
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
              disabled={loading}
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
