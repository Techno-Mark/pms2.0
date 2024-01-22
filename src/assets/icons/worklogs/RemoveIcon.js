import React from "react";

const RemoveIcon = () => {
  const maskStyle = {
    maskType: "alpha",
  };

  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <mask
        id="mask0_5035_5695"
        style={maskStyle}
        maskUnits="userSpaceOnUse"
        x="6"
        y="6"
        width="24"
        height="24"
      >
        <rect x="6" y="6" width="24" height="24" fill="#D9D9D9" />
      </mask>
      <g mask="url(#mask0_5035_5695)">
        <path
          d="M13.7143 17C13.5119 17 13.3423 17.0958 13.2054 17.2875C13.0685 17.4792 13 17.7167 13 18C13 18.2833 13.0685 18.5208 13.2054 18.7125C13.3423 18.9042 13.5119 19 13.7143 19H22.2857C22.4881 19 22.6577 18.9042 22.7946 18.7125C22.9315 18.5208 23 18.2833 23 18C23 17.7167 22.9315 17.4792 22.7946 17.2875C22.6577 17.0958 22.4881 17 22.2857 17H13.7143Z"
          fill="#6E6D7A"
        />
      </g>
    </svg>
  );
};

export default RemoveIcon;
