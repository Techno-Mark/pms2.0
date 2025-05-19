import axios from "axios";
import { toast } from "react-toastify";

export const callAPI = async (
  url: string,
  params: any,
  successCallback: any,
  method: "get" | "post" | "GET" | "POST"
) => {
  try {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    const config = {
      headers: {
        Authorization: `bearer ${token}`,
        org_token: `${Org_Token}`,
      },
    };

    let response;

    if (method.toLowerCase() === "get") {
      response = await axios.get(url, config);
    } else if (method.toLowerCase() === "post") {
      response = await axios.post(url, params, config);
    } else {
      throw new Error(
        "Unsupported HTTP method. Only GET and POST are supported."
      );
    }

    const { ResponseStatus, ResponseData, Message, ErrorData } = response.data;
    if (response.status === 200) {
      if (ResponseStatus === "Success") {
        successCallback(ResponseData, false, ResponseStatus);
      } else if (ResponseStatus === "Warning") {
        successCallback(
          Message !== null && Message.trim().length > 0
            ? Message
            : ResponseData,
          false,
          ResponseStatus
        );
      } else {
        if (Message === null || Message.trim().length <= 0) {
          toast.error(
            !!ErrorData && !!ErrorData.Error
              ? ErrorData.Error
              : "Please try again later."
          );
        } else {
          toast.error(Message);
        }
        successCallback(null, true, ResponseStatus, ErrorData);
      }
    } else {
      if (Message === null) {
        toast.error("Please try again later.");
      } else {
        toast.error(Message);
      }
      successCallback(null, true, ResponseStatus);
    }
  } catch (error: any) {
    if (error.response && error.response.status === 401) {
      window.location.href = "/login";
      localStorage.clear();
    }
  }
};
