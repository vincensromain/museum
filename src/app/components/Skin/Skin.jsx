"use client";
import React, { useState } from "react";
import "./Skin.scss";

export default function Skin() {
  const [activeIndex, setActiveIndex] = useState(0);
  const skins = ["Skin", "Skin", "Skin"];

  return (
    <div className="skin">
      <div className="skin_container">
        {skins.map((label, index) => (
          <span
            key={index}
            className={`skin_btn ${activeIndex === index ? "active" : ""}`}
            onClick={() => setActiveIndex(index)}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}
