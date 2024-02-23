/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import styles from "../../assets/scss/sidebar.module.scss";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DashboardIcon from "../../assets/icons/DashboardIcon";
import Worklogs from "../../assets/icons/WorklogsIcon";
import Approvals from "../../assets/icons/ApprovalsIcon";
import Settings from "../../assets/icons/SettingsIcon";
import Reports from "../../assets/icons/ReportsIcon";
import MenuIcon from "../../assets/icons/MenuIcon";
import Help from "@/assets/icons/Help";
import Pabs from "../../assets/icons/Pabs";
import PabsCollapse from "../../assets/icons/PabsCollaps";
import Link from "next/link";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";

interface SidebarItem {
  name: string;
  href: string;
  icon: JSX.Element;
}

const DashboardItems = ({ pathname, isCollapsed, sidebarItems }: any) => {
  return (
    <>
      {sidebarItems?.length > 0 &&
        sidebarItems.map((item: any) => {
          if (item && item.href) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-[15px] flex items-center pl-[27px] border-l-[4px] hover:bg-[#F6F6F6] hover:border-[#0592C6] ${
                  pathname === `${item.href}`
                    ? "border-[#0592C6] bg-[#F6F6F6]"
                    : "border-pureWhite"
                }`}
              >
                {isCollapsed ? (
                  <span className="py-[19.65px]">{item.icon}</span>
                ) : (
                  <>
                    <span className="py-[10px]">{item.icon}</span>
                    <span className="pl-[10px] py-[17.5px]">{item.name}</span>
                  </>
                )}
              </Link>
            );
          } else {
            return null;
          }
        })}
    </>
  );
};

const Sidebar = ({ setOpen, setSetting, toggleDrawer }: any) => {
  const pathname = usePathname();
  const [isCollapsed, setCollapse] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [windowSize, setWindowSize] = useState(0);
  const [sidebarItems, setSidebarItems] = useState<any>([]);

  useEffect(() => {
    const getUserDetails = async () => {
      const params = {};
      const url = `${process.env.api_url}/auth/getuserdetails`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          localStorage.setItem(
            "IsHaveManageAssignee",
            ResponseData.IsHaveManageAssignee
          );

          localStorage.setItem("permission", JSON.stringify(ResponseData.Menu));
          localStorage.setItem("roleId", ResponseData.RoleId);
          localStorage.setItem("isClient", ResponseData.IsClientUser);
          localStorage.setItem("UserId", ResponseData.UserId);
          if (localStorage.getItem("Org_Token") === null) {
            localStorage.setItem(
              "Org_Token",
              ResponseData.Organizations[0].Token
            );
          }
          if (localStorage.getItem("Org_Id") === null) {
            localStorage.setItem(
              "Org_Id",
              ResponseData.Organizations[0].OrganizationId
            );
          }
          if (localStorage.getItem("Org_Name") === null) {
            localStorage.setItem(
              "Org_Name",
              ResponseData.Organizations[0].OrganizationName
            );
          }
          getSidebarData(ResponseData.IsClientUser);
        }
      };
      callAPI(url, params, successCallback, "GET");
    };

    const getSidebarData = async (isClient: any) => {
      const permission: any = await localStorage.getItem("permission");

      if (permission.length > 0) {
        setSidebarItems([
          hasPermissionWorklog("", "View", "Dashboard") &&
            !isClient && {
              name: "Dashboard",
              href: "/admin-dashboard",
              icon: <DashboardIcon />,
            },
          hasPermissionWorklog("", "View", "WorkLogs") &&
            (hasPermissionWorklog("", "TaskManager", "WorkLogs") ||
              hasPermissionWorklog("", "ManageAssignee", "WorkLogs")) &&
            !isClient && {
              name: "Work Logs",
              href: "/worklogs",
              icon: <Worklogs />,
            },
          hasPermissionWorklog("", "View", "Approvals") &&
            !isClient && {
              name: "Approvals",
              href: "/approvals",
              icon: <Approvals />,
            },
          hasPermissionWorklog("", "View", "Report") &&
            (hasPermissionWorklog("project", "View", "Report") ||
              hasPermissionWorklog("user", "View", "Report") ||
              hasPermissionWorklog("timesheet", "View", "Report") ||
              hasPermissionWorklog("workload", "View", "Report") ||
              hasPermissionWorklog("user log", "View", "Report") ||
              hasPermissionWorklog("audit", "View", "Report") ||
              hasPermissionWorklog("billing", "View", "Report") ||
              hasPermissionWorklog("custom", "View", "Report") ||
              hasPermissionWorklog("rating", "View", "Report") ||
              hasPermissionWorklog("log", "View", "Report")) &&
            !isClient && {
              name: "Reports",
              href: "/reports",
              icon: <Reports />,
            },
          hasPermissionWorklog("", "View", "Settings") &&
            (hasPermissionWorklog("Client", "View", "Settings") ||
              hasPermissionWorklog("Project", "View", "Settings") ||
              hasPermissionWorklog("User", "View", "Settings") ||
              hasPermissionWorklog("Process", "View", "Settings") ||
              hasPermissionWorklog("Group", "View", "Settings") ||
              hasPermissionWorklog("Permission", "View", "Settings") ||
              hasPermissionWorklog("Status", "View", "Settings")) &&
            !isClient && {
              name: "Settings",
              href: "/settings",
              icon: <Settings />,
            },
          !isClient && {
            name: "Help",
            href: "/help",
            icon: <Help />,
          },
          hasPermissionWorklog("", "View", "Dashboard") &&
            isClient && {
              name: "Dashboard",
              href: "/dashboard",
              icon: <DashboardIcon />,
            },
          hasPermissionWorklog("", "View", "WorkLogs") &&
            (hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") ||
              hasPermissionWorklog("Rating", "View", "WorkLogs")) &&
            isClient && {
              name: "Worklogs",
              href: "/worklog",
              icon: <Worklogs />,
            },
          hasPermissionWorklog("", "View", "Report") &&
            (hasPermissionWorklog("Task", "View", "Report") ||
              hasPermissionWorklog("Rating", "View", "Report")) &&
            isClient && {
              name: "Reports",
              href: "/report",
              icon: <Reports />,
            },
        ]);
      }
    };

    getUserDetails();
  }, []);

  const handleResize = () => {
    setWindowSize(window.innerWidth);
  };

  useEffect(() => {
    setIsOpen(toggleDrawer);
  }, [toggleDrawer]);

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
    <>
      <div
        className={`${
          isCollapsed ? "lg:w-[6vw]" : "lg:w-[15vw]"
        } flex flex-col justify-between border-r border-[#E6E6E6] lg:h-screen text-darkCharcoal overflow-y-none overflow-x-hidden`}
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between">
            <span
              className={`py-[15px] ${
                isCollapsed ? "pr-[5vw] pl-[1vw]" : "pr-[15vw] pl-[2.13vw]"
              } text-[#0592C6] font-medium text-[24px] lg:border-b border-[#E6E6E6]`}
            >
              {isCollapsed ? (
                <PabsCollapse width="50" height="36" />
              ) : (
                <Pabs height="36" />
              )}
            </span>
            <span className="lg:hidden">
              <button
                className="flex flex-col h-12 w-12 rounded justify-center items-center group pr-5"
                onClick={() => {
                  setIsOpen(!isOpen);
                  setOpen(!isOpen);
                }}
              >
                <div
                  className={`h-1 w-6 my-1 rounded-full bg-darkCharcoal transition ease transform duration-300 ${
                    isOpen
                      ? "rotate-45 translate-y-3 opacity-50 group-hover:opacity-100"
                      : "opacity-50 group-hover:opacity-100"
                  }`}
                />
                <div
                  className={`h-1 w-6 my-1 rounded-full bg-darkCharcoal transition ease transform duration-300 ${
                    isOpen ? "opacity-0" : "opacity-50 group-hover:opacity-100"
                  }`}
                />
                <div
                  className={`h-1 w-6 my-1 rounded-full bg-darkCharcoal transition ease transform duration-300 ${
                    isOpen
                      ? "-rotate-45 -translate-y-3 opacity-50 group-hover:opacity-100"
                      : "opacity-50 group-hover:opacity-100"
                  }`}
                />
              </button>
            </span>
          </div>
          <div
            className={`${
              windowSize <= 1023
                ? `flex flex-col absolute h-screen z-50 top-[66px] bg-pureWhite w-[15vw] ${
                    isOpen ? styles.abc : styles.aaa
                  }`
                : "h-auto block"
            }`}
          >
            <DashboardItems
              pathname={pathname}
              isCollapsed={isCollapsed}
              sidebarItems={sidebarItems}
            />
          </div>
        </div>
        {windowSize >= 1024 && (
          <span
            className={`py-[20.5px] pl-[29px] ${
              isCollapsed ? "pr-[50px]" : "pr-[174px]"
            } border-t border-[#E6E6E6]`}
            onClick={() => {
              setCollapse(!isCollapsed);
              setSetting(!isCollapsed);
            }}
          >
            <MenuIcon />
          </span>
        )}
      </div>
    </>
  );
};

export default Sidebar;
