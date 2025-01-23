import React from "react";

function AddPlusIcon({ color = "white" }: { color?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3.75"
        y="3.75"
        width="16.5"
        height="16.5"
        rx="1.25"
        stroke={color}
        strokeWidth="1.5"
      />
      <rect
        x="7"
        y="11.375"
        width="10"
        height="1.25"
        rx="0.625"
        fill={color}
        stroke={color}
        strokeWidth="0.3"
      />
      <rect
        x="11.375"
        y="17"
        width="10"
        height="1.25"
        rx="0.625"
        transform="rotate(-90 11.375 17)"
        fill={color}
        stroke={color}
        strokeWidth="0.3"
      />
    </svg>
  );
}

export default AddPlusIcon;
