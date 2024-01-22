"use client";

import ReportLoader from "@/components/common/ReportLoader";
import { handleLogoutUtil, hasPermissionWorklog } from "@/utils/commonFunction";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";

const Home = () => {
  const router = useRouter();

  const handlePermissionsForClientUser = () => {
    if (hasPermissionWorklog("", "View", "Dashboard")) {
      router.push("/dashboard");
    } else if (
      hasPermissionWorklog("", "View", "WorkLogs") &&
      (hasPermissionWorklog("Task/SubTask", "View", "WorkLogs") ||
        hasPermissionWorklog("Rating", "View", "WorkLogs"))
    ) {
      router.push("/worklog");
    } else if (
      hasPermissionWorklog("", "View", "Report") &&
      (hasPermissionWorklog("Task", "View", "Report") ||
        hasPermissionWorklog("Rating", "View", "Report"))
    ) {
      router.push("/report");
    } else {
      setTimeout(
        () => toast.warning("You don't have required permissions"),
        8000
      );
      setTimeout(() => router.push("/login"), 13000);
      localStorage.clear();
    }
  };

  const handlePermissionsForNonClientUser = () => {
    if (hasPermissionWorklog("", "View", "Dashboard")) {
      router.push("/admin-dashboard");
    } else if (hasPermissionWorklog("", "View", "Settings")) {
      router.push("/settings");
    } else if (
      hasPermissionWorklog("", "View", "WorkLogs") &&
      (hasPermissionWorklog("", "TaskManager", "WorkLogs") ||
        hasPermissionWorklog("", "ManageAssignee", "WorkLogs"))
    ) {
      router.push("/worklogs");
    } else if (hasPermissionWorklog("", "View", "Approvals")) {
      router.push("/approvals");
    } else if (hasPermissionWorklog("", "View", "Report")) {
      router.push("/reports");
    } else {
      setTimeout(
        () => toast.warning("You don't have required permissions"),
        8000
      );
      setTimeout(() => router.push("/login"), 13000);
      handleLogoutUtil();
    }
  };

  const handlePermissions = (response: any) => {
    if (response.data.ResponseData.IsClientUser) {
      handlePermissionsForClientUser();
    } else {
      handlePermissionsForNonClientUser();
    }
  };

  const setLocalStorageItems = (response: any) => {
    localStorage.setItem(
      "IsHaveManageAssignee",
      response.data.ResponseData.IsHaveManageAssignee
    );

    localStorage.setItem(
      "permission",
      JSON.stringify(response.data.ResponseData.Menu)
    );
    localStorage.setItem("roleId", response.data.ResponseData.RoleId);
    localStorage.setItem("isClient", response.data.ResponseData.IsClientUser);
    localStorage.setItem("clientId", response.data.ResponseData.ClientId);

    if (localStorage.getItem("Org_Token") === null) {
      localStorage.setItem(
        "Org_Token",
        response.data.ResponseData.Organizations[0].Token
      );
    }
    if (localStorage.getItem("Org_Id") === null) {
      localStorage.setItem(
        "Org_Id",
        response.data.ResponseData.Organizations[0].OrganizationId
      );
    }
    if (localStorage.getItem("Org_Name") === null) {
      localStorage.setItem(
        "Org_Name",
        response.data.ResponseData.Organizations[0].OrganizationName
      );
    }
  };

  const getUserDetails = async () => {
    try {
      const token = await localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: token,
      };

      const response = await axios.get(
        `${process.env.api_url}/auth/getuserdetails`,
        { headers: headers }
      );

      if (response.status === 200) {
        setLocalStorageItems(response);

        const local: any = await localStorage.getItem("permission");

        if (local.length > 2) {
          handlePermissions(response);
        } else {
          router.push("/login");
          localStorage.clear();
        }
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        router.push("/login");
        localStorage.clear();
      }
    }
  };

  useEffect(() => {
    getUserDetails();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <ReportLoader />
    </div>
  );
};

export default Home;
