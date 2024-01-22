"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DrawerOverlay from "../settings/drawer/DrawerOverlay";

interface WrapperProps {
  children: ReactNode;
  className?: any;
}

const Wrapper = ({ children, className = "" }: WrapperProps): JSX.Element => {
  const [Collapsed, setCollapsed] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState(0);

  let dynamicClassName;

  if (windowSize <= 1023) {
    dynamicClassName = "w-[100vw]";
  } else {
    dynamicClassName = Collapsed
      ? `w-[94vw] ${className}`
      : `w-[85vw] ${className}`;
  }

  const isOpen = (arg: any) => {
    setDrawer(arg);
  };
  const isCollapsed = (arg: any) => {
    setCollapsed(arg);
  };

  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };

  useEffect(() => {
    setWindowSize(window.innerWidth);
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return (
    <div className="lg:flex !h-[200px]">
      <Sidebar
        setOpen={isOpen}
        setSetting={isCollapsed}
        toggleDrawer={drawer}
      />
      <main className={dynamicClassName}>
        <DrawerOverlay
          className="!top-[70px]"
          isOpen={drawer}
          onClose={() => {
            setDrawer(!drawer);
          }}
        />
        {children}
      </main>
    </div>
  );
};

export default Wrapper;
