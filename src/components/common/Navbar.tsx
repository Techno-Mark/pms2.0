"use client";
import React, { useEffect, useRef, useState } from "react";
import LogoutIcon from "@/assets/icons/LogoutIcon";
import { Avatar } from "@mui/material";
import Dropdown from "./Dropdown";
import { useRouter } from "next/navigation";
import { handleLogoutUtil } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";

type NavbarPropsType = {
  onUserDetailsFetch?: (arg1: any) => void;
  onHandleModuleNames?: (a: any, b: any, c: any, d: any, e: any) => void;
};

const Navbar = (props: NavbarPropsType) => {
  const routerNavbar = useRouter();
  const [orgDataNavbar, setOrgDataNavbar] = useState([]);
  const [openLogoutNavbar, setOpenLogoutNavbar] = useState(false);
  const [userDataNavbar, setUserDataNavbar] = useState<any>([]);
  const [roleDropdownDataNavbar, setRoleDropdownDataNavbar] = useState([]);
  const selectRefNavbar = useRef<HTMLDivElement>(null);
  const [userNameNavbar, setUserNameNavbar] = useState("");

  let token: any;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("token");
  }

  let options: any[] = [];

  const getDataNavbar = async () => {
    const params = {};
    const url = `${process.env.pms_api_url}/Role/GetDropdown`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
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
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        const username = ResponseData?.FirstName + " " + ResponseData?.LastName;
        setUserNameNavbar(username);
        setUserDataNavbar(ResponseData);
        setOrgDataNavbar(ResponseData.Organizations);

        localStorage.setItem(
          "IsHaveManageAssignee",
          ResponseData.IsHaveManageAssignee
        );

        localStorage.setItem("permission", JSON.stringify(ResponseData.Menu));
        localStorage.setItem("roleId", ResponseData.RoleId);
        localStorage.setItem("IsAdmin", ResponseData.IsAdmin);
        localStorage.setItem("isClient", ResponseData.IsClientUser);
        localStorage.setItem("clientId", ResponseData.ClientId);
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
        getDataNavbar();
        const filteredOrganization = ResponseData.Organizations.filter(
          (org: any) =>
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
            ResponseData.RoleId
          );
        }
      }
    };
    callAPI(url, params, successCallback, "GET");
  };

  const fetchData = async () => {
    await getUserDetails();
    if (props.onUserDetailsFetch) {
      props.onUserDetailsFetch(() => fetchData());
    }
  };

  useEffect(() => {
    fetchData();
    getUserDetails();
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
    <div className="flex items-center justify-between px-[20px] py-[9px] border-b border-lightSilver z-5">
      {userDataNavbar.RoleId === 1 ? (
        orgDataNavbar.length > 0 ? (
          <Dropdown
            options={orgDataNavbar.map(
              ({ Token, OrganizationName, OrganizationId, IsFavourite }) => {
                return {
                  id: OrganizationId,
                  label: OrganizationName,
                  token: Token,
                  isFavourite: IsFavourite,
                };
              }
            )}
            getUserDetails={getUserDetails}
          />
        ) : null
      ) : (
        <div></div>
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
            {roleDropdownDataNavbar.map((i: any) => {
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
                .map((word: any) => word.charAt(0).toUpperCase())
                .join("")}
            </Avatar>
          </span>
          {openLogoutNavbar && (
            <div className="absolute top-[55px] rounded-md -right-2 w-50 h-12 px-5 flex items-center justify-center bg-pureWhite shadow-xl z-50">
              <span
                onClick={handleLogout}
                className="flex items-center justify-center cursor-pointer hover:text-defaultRed"
              >
                <span className="!rotate-0">
                  <LogoutIcon />
                </span>
                &nbsp;Logout
              </span>
            </div>
          )}
        </div>
      </span>
    </div>
  );
};

export default Navbar;
