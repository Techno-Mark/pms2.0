import { toast } from "react-toastify";

export const getColor = (color: string | number, isUser: boolean) => {
  if (typeof color === "string" || typeof color === "number") {
    switch (typeof color === "string" ? parseInt(color) : color) {
      case 1:
        return "#198754";
      case 2:
        return "#FDB663";
      case 3:
        return isUser ? "#0281B9" : "#FFC107";
      case 4:
        return "#800080";
      case 5:
        return "#dc3545";
    }
  } else {
    toast.error("Please provide the valid color code!");
  }
};
