import React from "react";

const Card = ({ children }) => {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "16px",
        width: "100%",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        boxSizing: "border-box",
      }}
    >
      {children}
    </div>
  );
};

export default Card;
