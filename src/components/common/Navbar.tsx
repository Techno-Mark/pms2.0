"use client";
import React, { useEffect, useRef, useState } from "react";
import LogoutIcon from "@/assets/icons/LogoutIcon";
import { Avatar } from "@mui/material";
import Dropdown from "./Dropdown";
import { useRouter } from "next/navigation";
import { handleLogoutUtil } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { LabelValueType, Organization, User } from "@/utils/Types/types";
import Notification from "@/assets/icons/Notification";

type NavbarPropsType = {
  onUserDetailsFetch?: (arg1: any) => void;
  onHandleModuleNames?: (
    a: string,
    b: string,
    c: string,
    d: string,
    e: string
  ) => void;
  setEmailNotificationOpen: any;
};

const Navbar = (props: NavbarPropsType) => {
  const routerNavbar = useRouter();
  const [orgDataNavbar, setOrgDataNavbar] = useState<Organization[] | []>([]);
  const [openLogoutNavbar, setOpenLogoutNavbar] = useState(false);
  const [userDataNavbar, setUserDataNavbar] = useState<User | null>(null);
  const [roleDropdownDataNavbar, setRoleDropdownDataNavbar] = useState<
    LabelValueType[] | []
  >([]);
  const selectRefNavbar = useRef<HTMLDivElement>(null);
  const [userNameNavbar, setUserNameNavbar] = useState("");

  let token: null | string | undefined;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  interface Options {
    id: number | string | null;
    label: number | string | null;
    token: number | string | null;
  }

  let options: Options[] = [];

  const getDataNavbar = async () => {
    const params = {};
    const url = `${process.env.pms_api_url}/Role/GetDropdown`;
    const successCallback = (
      ResponseData: LabelValueType[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData.length > 0 &&
        error === false
      ) {
        setRoleDropdownDataNavbar(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const getUserDetails = async () => {
    const params = {};
    const url = `${process.env.api_url}/auth/getuserdetails`;
    const successCallback = (
      ResponseData: User,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const username = ResponseData?.FirstName + " " + ResponseData?.LastName;
        setUserNameNavbar(username);
        setUserDataNavbar(ResponseData);
        setOrgDataNavbar(ResponseData.Organizations);

        localStorage.setItem(
          "IsHaveManageAssignee",
          String(ResponseData.IsHaveManageAssignee)
        );
        localStorage.setItem("permission", JSON.stringify(ResponseData.Menu));
        localStorage.setItem("roleId", String(ResponseData.RoleId));
        localStorage.setItem("isAdmin", String(ResponseData.IsAdmin));
        localStorage.setItem("isClient", String(ResponseData.IsClientUser));
        localStorage.setItem("clientId", String(ResponseData.ClientId));
        localStorage.setItem("workTypeId", String(ResponseData.WorkTypeId));
        localStorage.setItem("departmentId", String(ResponseData.DepartmentId));
        localStorage.setItem(
          "reviewerId",
          String(ResponseData.ReportingManagerId)
        );
        localStorage.setItem("managerId", String(ResponseData.ManagerId));
        if (localStorage.getItem("Org_Token") === null) {
          localStorage.setItem(
            "Org_Token",
            ResponseData.Organizations[0].Token
          );
        }
        if (localStorage.getItem("Org_Id") === null) {
          localStorage.setItem(
            "Org_Id",
            String(ResponseData.Organizations[0].OrganizationId)
          );
        }
        if (localStorage.getItem("Org_Name") === null) {
          localStorage.setItem(
            "Org_Name",
            ResponseData.Organizations[0].OrganizationName
          );
        }
        getDataNavbar();
        const filteredOrganization = ResponseData.Organizations.filter(
          (org: Organization) =>
            org.OrganizationName === localStorage.getItem("Org_Name")
        );
        const {
          ClientModuleName,
          ProjectModuleName,
          ProcessModuleName,
          SubProcessModuleName,
        } = filteredOrganization[0];
        if (props.onHandleModuleNames) {
          props.onHandleModuleNames(
            ClientModuleName,
            ProjectModuleName,
            ProcessModuleName,
            SubProcessModuleName,
            ResponseData.RoleId.toString()
          );
        }
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const fetchDataUser = async () => {
    await getUserDetails();
    if (props.onUserDetailsFetch) {
      props.onUserDetailsFetch(() => fetchDataUser());
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchDataUser();
      await getUserDetails();
    };
    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [token]);

  orgDataNavbar.map(({ Token, OrganizationName, OrganizationId }) => {
    return options.push({
      id: OrganizationId,
      label: OrganizationName,
      token: Token,
    });
  });

  const handleLogout = () => {
    setOpenLogoutNavbar(false);
    if (typeof window !== "undefined") {
      handleLogoutUtil();
    }
    routerNavbar.push("/login");
  };

  useEffect(() => {
    const handleOutsideClick = (event: any) => {
      if (
        selectRefNavbar.current &&
        !selectRefNavbar.current.contains(event.target)
      ) {
        setOpenLogoutNavbar(false);
      }
    };

    window.addEventListener("click", handleOutsideClick);

    return () => {
      window.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  return (
    <>
      {userDataNavbar && (
        <div className="flex items-center justify-between px-[20px] py-[9px] border-b border-lightSilver z-5">
          {userDataNavbar.RoleId === 1 ? (
            orgDataNavbar.length > 0 ? (
              <Dropdown
                options={orgDataNavbar.map(
                  ({
                    Token,
                    OrganizationName,
                    OrganizationId,
                    IsFavourite,
                  }) => {
                    return {
                      id: OrganizationId,
                      label: OrganizationName,
                      token: Token,
                      isFavourite: IsFavourite,
                    };
                  }
                )}
              />
            ) : null
          ) : (
            <div></div>
            // <div className="text-sm w-[78%] text-[#C40F0F]">
            //   If you already have PMS 2.0 exe file installed on your system,
            //   please log in. If not, contact ICT to have it installed before the
            //   end of this week.
            // </div>
          )}

          <span className="flex items-center gap-[15px]">
            {/* <span className="flex items-center gap-[20px] mr-[20px]">
              <span className="cursor-pointer">
                <NotificationIcon />
              </span>
              {userDataNavbar.RoleId !== 1 ? (
                <span className="cursor-pointer">
                  <Btn_Help />
                </span>
              ) : null}
            </span> */}
            <div className="flex flex-col">
              <span className="inline-block text-base font-semibold text-darkCharcoal">
                {userDataNavbar?.FirstName} {userDataNavbar?.LastName}
              </span>
              <span className="inline-block text-base font-semibold text-darkCharcoal">
                {roleDropdownDataNavbar.map((i: LabelValueType) => {
                  return i.value === userDataNavbar.RoleId && i.label;
                })}
              </span>
            </div>
            <div
              ref={selectRefNavbar}
              className="flex items-center justify-center flex-col relative"
            >
              <span
                onClick={() => setOpenLogoutNavbar(!openLogoutNavbar)}
                className="cursor-pointer"
              >
                <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}>
                  {userNameNavbar
                    .split(" ")
                    .map((word: string) => word.charAt(0).toUpperCase())
                    .join("")}
                </Avatar>
              </span>
              {openLogoutNavbar && (
                <div
                  className={`absolute top-[55px] rounded-md -right-2 w-50 px-5 flex flex-col whitespace-nowrap gap-2 items-start justify-center bg-pureWhite shadow-xl z-50 ${
                    !!userDataNavbar && userDataNavbar.IsClientUser == false
                      ? "h-20"
                      : "h-10"
                  }`}
                >
                  <span
                    onClick={handleLogout}
                    className="flex items-center justify-start cursor-pointer hover:text-defaultRed"
                  >
                    <span className="!rotate-0">
                      <LogoutIcon />
                    </span>
                    &nbsp;Logout
                  </span>
                  <div>
                    {!!userDataNavbar &&
                      userDataNavbar.IsClientUser == false && (
                        <span
                          onClick={() => {
                            props.setEmailNotificationOpen(true);
                            setOpenLogoutNavbar(false);
                          }}
                          className="flex items-center justify-start cursor-pointer hover:text-defaultRed"
                        >
                          <span className="!rotate-0">
                            <Notification />
                          </span>
                          &nbsp;Email Notification
                        </span>
                      )}
                  </div>
                </div>
              )}
            </div>
          </span>
        </div>
      )}
    </>
  );
};

export default Navbar;
