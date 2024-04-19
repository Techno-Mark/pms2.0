import React from "react";
import styles from "./styles/style.module.css";

const Loading = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <svg
          version="1.1"
          viewBox="0 0 64 64"
          width="1em"
          xmlns="http://www.w3.org/2000/svg"
          id={styles.spinner}
        >
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="url(#sGD)"
            strokeWidth="8"
          />
          <path
            className={styles.pathSolid}
            d="M 32,4 A 28 28,0,0,0,32,60"
            fill="none"
            stroke="#6E6D7A67"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="sGD"
              gradientUnits="userSpaceOnUse"
              x1="32"
              y1="0"
              x2="32"
              y2="64"
            >
              <stop
                stop-color="#6E6D7A67"
                offset="0.1"
                stop-opacity="0"
                className={styles.stop1}
              ></stop>
              <stop
                stop-color="#6E6D7A67"
                offset=".9"
                stop-opacity="1"
                className={styles.stop2}
              ></stop>
            </linearGradient>
          </defs>
          <animateTransform
            values="0,0,0;360,0,0"
            attributeName="transform"
            type="rotate"
            repeatCount="indefinite"
            dur="750ms"
          ></animateTransform>
        </svg>
      </div>
    </div>
  );
};

export default Loading;
