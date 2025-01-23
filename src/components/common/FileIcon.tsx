import React from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

const fileIcons: any = {
  doc: { icon: "fa-file-word", color: "#1E4DD8" },
  docx: { icon: "fa-file-word", color: "#1E4DD8" },
  pdf: { icon: "fa-file-pdf", color: "#D82E2F" },
  txt: { icon: "fa-file-alt", color: "#606060" },
  rtf: { icon: "fa-file-alt", color: "#606060" },

  xls: { icon: "fa-file-excel", color: "#2E7D32" },
  xlsx: { icon: "fa-file-excel", color: "#2E7D32" },
  csv: { icon: "fa-file-csv", color: "#2E7D32" },

  ppt: { icon: "fa-file-powerpoint", color: "#D86018" },
  pptx: { icon: "fa-file-powerpoint", color: "#D86018" },

  jpg: { icon: "fa-file-image", color: "#D9901F" },
  jpeg: { icon: "fa-file-image", color: "#D9901F" },
  png: { icon: "fa-file-image", color: "#D9901F" },
  gif: { icon: "fa-file-image", color: "#D9901F" },
  svg: { icon: "fa-file-image", color: "#D9901F" },

  mp3: { icon: "fa-file-audio", color: "#007BFF" },
  wav: { icon: "fa-file-audio", color: "#007BFF" },

  mp4: { icon: "fa-file-video", color: "#FF5722" },
  mov: { icon: "fa-file-video", color: "#FF5722" },

  zip: { icon: "fa-file-archive", color: "#8E44AD" },
  rar: { icon: "fa-file-archive", color: "#8E44AD" },
  "7z": { icon: "fa-file-archive", color: "#8E44AD" },

  default: { icon: "fa-file", color: "#B0B0B0" },
};

const FileIcon = ({ fileName }: any) => {
  const extension = fileName.split(".").pop().toLowerCase();
  const { icon, color } = fileIcons[extension] || fileIcons["default"];

  return (
    <i
      className={`fas ${icon}`}
      style={{
        color: color,
        fontSize: "1.5rem",
        marginRight: "0.5rem",
      }}
    ></i>
  );
};

export default FileIcon;
