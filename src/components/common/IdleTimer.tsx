import { useEffect } from "react";

const IdleTimer = ({ timeout = 600000, onIdle }: any) => {
  useEffect(() => {
    let timer: any;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        onIdle && onIdle();
      }, timeout);
    };

    const handleMouseMove = () => {
      resetTimer();
    };

    resetTimer();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("keydown", handleMouseMove);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("keydown", handleMouseMove);
    };
  }, [timeout, onIdle]);
  return <></>;
};

export default IdleTimer;
