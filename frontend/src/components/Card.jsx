import React from "react";
 
const Card = ({ children, width }) => {
  return (
<div
      style={{
        background: "white",
        border: "1px solid #ddd",
        borderRadius: "8px",
        padding: "15px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        width: width || "100%",
      }}
>
      {children}
</div>
  );
};
 
export default Card;