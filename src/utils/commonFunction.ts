/* eslint-disable react-hooks/rules-of-hooks */
import { toast } from "react-toastify";
import { callAPI } from "./API/callAPI";

const hasToken = (router: any) => {
  const token = localStorage.getItem("token");
  if (token) {
    router.push("/settings");
  }
};

const hasNoToken = (router: any) => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.push("/login");
  }
};

const handleLogoutUtil = async () => {
  const params = {};
  const url = `${process.env.api_url}/auth/logout`;
  const successCallback = (
    ResponseData: any,
    error: any,
    ResponseStatus: any
  ) => {
    if (ResponseStatus === "Success" && error === false) {
      localStorage.clear();
    } else {
      toast.error("Something went wrong.");
    }
  };
  callAPI(url, params, successCallback, "GET");
};

const hasPermissionWorklog = (
  tabName: string,
  field: string,
  module: string
) => {
  if (typeof window !== "undefined" && window.localStorage) {
    const role = localStorage.getItem("roleId");
    const roleId = role === null ? 0 : parseInt(role);
    const setting = localStorage.getItem("permission");

    if (setting !== null) {
      const settingArray = JSON.parse(setting);
      const settingPermission = settingArray.filter((set: any) => {
        return set.Name.toLowerCase() === module.toLowerCase();
      });

      if (tabName.trim().length <= 0 && settingPermission.length > 0) {
        const value = settingPermission[0].ActionList.filter(
          (i: any) => i.ActionName.toLowerCase() === field.toLowerCase()
        );
        return value.length > 0 ? value[0].IsChecked : false;
      }

      if (settingPermission.length > 0) {
        const settingTabsPermission = settingPermission[0].Childrens;
        const settingTabsName = settingTabsPermission.map((tab: any) =>
          tab.Name.toLowerCase()
        );

        if (settingTabsName.includes(tabName.toLowerCase())) {
          const value = settingTabsPermission
            .filter(
              (tab: any) => tab.Name.toLowerCase() === tabName.toLowerCase()
            )[0]
            .ActionList.filter(
              (arg1: any) =>
                arg1.ActionName.toLowerCase() === field.toLowerCase()
            );
          return value.length > 0 ? value[0].IsChecked : false;
        }
      }
    }

    if (tabName.toLowerCase() === "organization" && roleId === 1) {
      return true;
    } else {
      return false;
    }
  }
};

const getYears = () => {
  const currentYear = new Date().getFullYear() + 1;
  const Years = [];

  for (let year = 2020; year <= currentYear; year++) {
    Years.push({ label: String(year), value: year });
  }

  return Years;
};

const extractText = (inputString: any) => {
  const regex = /@\[([^\]]+)\]\([^)]+\)|\[([^\]]+)\]|[^@\[\]]+/g;
  const matches = [];
  let match;
  while ((match = regex.exec(inputString)) !== null) {
    matches.push(match[1] || match[2] || match[0]);
  }
  return matches;
};

const isWeekend = (date: any) => {
  const day = date.day();
  // return day === 6 || day === 0;
  return day === 0;
};

const getTimeDifference = (startTime: any, endTime: any) => {
  const [s, e, s_sec] = startTime.split(":").map(Number);
  const [t, r, e_sec] = endTime.split(":").map(Number);
  const minutesDifference = t * 60 + r - s * 60 - e;
  const secondsDifference = e_sec - s_sec;

  return `${String(Math.floor(minutesDifference / 60)).padStart(
    2,
    "0"
  )}:${String(minutesDifference % 60).padStart(2, "0")}:${String(
    secondsDifference
  ).padStart(2, "0")}`;
};

export {
  hasToken,
  hasNoToken,
  handleLogoutUtil,
  hasPermissionWorklog,
  getYears,
  extractText,
  isWeekend,
  getTimeDifference,
};
