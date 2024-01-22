/* eslint-disable react-hooks/rules-of-hooks */
import axios from "axios";
import { toast } from "react-toastify";

export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const months = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
  { label: "13", value: 13 },
  { label: "14", value: 14 },
  { label: "15", value: 15 },
  { label: "16", value: 16 },
  { label: "17", value: 17 },
  { label: "18", value: 18 },
  { label: "19", value: 19 },
  { label: "20", value: 20 },
  { label: "21", value: 21 },
  { label: "22", value: 22 },
  { label: "23", value: 23 },
  { label: "24", value: 24 },
  { label: "25", value: 25 },
  { label: "26", value: 26 },
  { label: "27", value: 27 },
  { label: "28", value: 28 },
  { label: "29", value: 29 },
  { label: "Last Day of Month", value: -1 },
];

export const hours = [
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "4", value: 4 },
  { label: "5", value: 5 },
  { label: "6", value: 6 },
  { label: "7", value: 7 },
  { label: "8", value: 8 },
  { label: "9", value: 9 },
  { label: "10", value: 10 },
  { label: "11", value: 11 },
  { label: "12", value: 12 },
  { label: "13", value: 13 },
  { label: "14", value: 14 },
  { label: "15", value: 15 },
  { label: "16", value: 16 },
  { label: "17", value: 17 },
  { label: "18", value: 18 },
  { label: "19", value: 19 },
  { label: "20", value: 20 },
  { label: "21", value: 21 },
  { label: "22", value: 22 },
  { label: "23", value: 23 },
  { label: "24", value: 24 },
];

const getApiFunction = async (api: any) => {
  const token = await localStorage.getItem("token");
  const Org_Token = await localStorage.getItem("Org_Token");
  try {
    const response = await axios.get(api, {
      headers: {
        Authorization: `bearer ${token}`,
        org_token: `${Org_Token}`,
      },
    });

    if (response.status === 200) {
      if (response.data.ResponseStatus === "Success") {
        return response.data.ResponseData;
      } else {
        toast.error("Please try again later.");
      }
    } else {
      toast.error("Please try again.");
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
      localStorage.clear();
    }
  }
};

const postApiFunction = async (api: any, params: any) => {
  const token = await localStorage.getItem("token");
  const Org_Token = await localStorage.getItem("Org_Token");
  try {
    const response = await axios.post(api, params, {
      headers: {
        Authorization: `bearer ${token}`,
        org_token: `${Org_Token}`,
      },
    });

    if (response.status === 200) {
      if (response.data.ResponseStatus === "Success") {
        return response.data.ResponseData;
      } else {
        toast.error("Please try again later.");
      }
    } else {
      toast.error("Please try again.");
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
      localStorage.clear();
    }
  }
};

export const getClientDropdownData = async () => {
  return await getApiFunction(
    `${process.env.pms_api_url}/client/getdropdownforgroup`
  );
};

export const getAllProcessDropdownData = async () => {
  return await getApiFunction(
    `${process.env.pms_api_url}/process/getdropdownforgroup`
  );
};

export const getTypeOfWorkDropdownData = async (clientId: any) => {
  return await postApiFunction(
    `${process.env.pms_api_url}/WorkType/GetDropdown`,
    {
      clientId: clientId,
    }
  );
};

export const getProjectDropdownData = async (clientId: any) => {
  const token = await localStorage.getItem("token");
  const Org_Token = await localStorage.getItem("Org_Token");
  try {
    const response = await axios.post(
      `${process.env.pms_api_url}/project/getdropdown`,
      {
        clientId: clientId,
      },
      {
        headers: {
          Authorization: `bearer ${token}`,
          org_token: `${Org_Token}`,
        },
      }
    );

    if (response.status === 200) {
      if (response.data.ResponseStatus === "Success") {
        return response.data.ResponseData.List;
      } else {
        toast.error("Please try again later.");
      }
    } else {
      toast.error("Please try again.");
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
    }
  }
};

export const getProcessDropdownData = async (clientId: any) => {
  return await postApiFunction(
    `${process.env.pms_api_url}/Process/GetDropdownByClient`,
    {
      clientId: clientId,
    }
  );
};

export const getStatusDropdownData = async () => {
  return await getApiFunction(`${process.env.pms_api_url}/status/GetDropdown`);
};

export const getSubProcessDropdownData = async (
  clientId: any,
  processId: any
) => {
  return await postApiFunction(
    `${process.env.pms_api_url}/Process/GetDropdownByClient`,
    {
      clientId: clientId,
      processId: processId,
    }
  );
};

export const getAssigneeDropdownData = async (
  clientId: any,
  workTypeId: any
) => {
  return await postApiFunction(
    `${process.env.api_url}/user/GetAssigneeUserDropdown`,
    {
      ClientIds: clientId,
      WorktypeId: workTypeId,
      IsAll: clientId.length > 1 ? true : false,
    }
  );
};

export const getReviewerDropdownData = async (
  clientId: any,
  workTypeId: any
) => {
  return await postApiFunction(
    `${process.env.api_url}/user/GetReviewerDropdown`,
    {
      ClientIds: clientId,
      WorktypeId: workTypeId,
      IsAll: clientId.length > 1 ? true : false,
    }
  );
};

export const getManagerDropdownData = async () => {
  return await getApiFunction(`${process.env.api_url}/user/getmanagerdropdown`);
};

export const getTypeOfReturnDropdownData = async () => {
  return await getApiFunction(
    `${process.env.worklog_api_url}/workitem/getformtypelist`
  );
};

export const getCCDropdownData = async () => {
  return await getApiFunction(`${process.env.api_url}/user/getdropdown`);
};

export const getCommentUserDropdownData = async (fields: any) => {
  return await postApiFunction(
    `${process.env.api_url}/user/getgroupusersdropdown`,
    fields
  );
};

export const getBillingTypeData = async () => {
  return await getApiFunction(
    `${process.env.pms_api_url}/BillingType/GetDropdown`
  );
};

export const getDeptData = async () => {
  return await getApiFunction(
    `${process.env.pms_api_url}/department/getdropdown`
  );
};
