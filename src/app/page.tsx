"use client";

import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import { User } from "@/utils/Types/types";
import { handleLogoutUtil, hasPermissionWorklog } from "@/utils/commonFunction";
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

  const handlePermissions = (response: boolean) => {
    if (response) {
      handlePermissionsForClientUser();
    } else {
      handlePermissionsForNonClientUser();
    }
  };

  const setLocalStorageItems = (response: User) => {
    localStorage.setItem(
      "IsHaveManageAssignee",
      String(response.IsHaveManageAssignee)
    );

    localStorage.setItem("permission", JSON.stringify(response.Menu));
    localStorage.setItem("roleId", String(response.RoleId));
    localStorage.setItem("isClient", String(response.IsClientUser));
    localStorage.setItem("clientId", String(response.ClientId));
    localStorage.setItem("workTypeId", String(response.WorkTypeId));

    if (localStorage.getItem("Org_Token") === null) {
      localStorage.setItem("Org_Token", response.Organizations[0].Token);
    }
    if (localStorage.getItem("Org_Id") === null) {
      localStorage.setItem(
        "Org_Id",
        String(response.Organizations[0].OrganizationId)
      );
    }
    if (localStorage.getItem("Org_Name") === null) {
      localStorage.setItem(
        "Org_Name",
        response.Organizations[0].OrganizationName
      );
    }
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
        setLocalStorageItems(ResponseData);

        if (ResponseData.Menu.length > 0) {
          handlePermissions(ResponseData.IsClientUser);
        } else {
          router.push("/login");
          toast.warning("You don't have required permissions.");
          localStorage.clear();
        }
      }
    };
    callAPI(url, params, successCallback, "GET");
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
