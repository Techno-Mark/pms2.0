"use client";

import React, { ReactNode, useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import DrawerOverlay from "../settings/drawer/DrawerOverlay";
import Navbar from "./Navbar";
import NotificationDrawer from "./NotificationDrawer";

interface WrapperProps {
  children: ReactNode;
  className?: string;
}

const WrapperNavbar = ({
  children,
  className = "",
}: WrapperProps): JSX.Element => {
  const [Collapsed, setCollapsed] = useState<boolean>(false);
  const [drawer, setDrawer] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState(0);
  const [emailNotificationOpen, setEmailNotificationOpen] = useState(false);

  let dynamicClassName;

  if (windowSize <= 1023) {
    dynamicClassName = "w-[100vw]";
  } else {
    dynamicClassName = Collapsed
      ? `w-[94vw] ${className}`
      : `w-[85vw] ${className}`;
  }

  const isOpen = (arg: boolean) => {
    setDrawer(arg);
  };
  const isCollapsed = (arg: boolean) => {
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
        <Navbar setEmailNotificationOpen={setEmailNotificationOpen} />
        {children}
        <NotificationDrawer
          emailNotificationOpen={emailNotificationOpen}
          setEmailNotificationOpen={setEmailNotificationOpen}
        />
        <DrawerOverlay isOpen={emailNotificationOpen} onClose={() => {}} />
      </main>
    </div>
  );
};

export default WrapperNavbar;
