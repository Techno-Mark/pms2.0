import React, { useEffect, useState } from "react";
import {
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { callAPI } from "@/utils/API/callAPI";
import ReportLoader from "@/components/common/ReportLoader";
import { hasPermissionWorklog } from "@/utils/commonFunction";

const NotificationDrawer = ({
  emailNotificationOpen,
  setEmailNotificationOpen,
}: any) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [notificationList, setNotificationList] = useState<any[]>([]);

  const getPermissionDetails = async () => {
    setLoading(true);
    const params = {
      DepartmentId: Number(localStorage.getItem("departmentId")),
      UserId: Number(localStorage.getItem("UserId")),
    };
    const url = `${process.env.pms_api_url}/notification/getnotification`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setData(ResponseData);
      }
      setLoading(false);
    };
    callAPI(url, params, successCallback, "POST");
  };

  const saveNotification = async (notification: any) => {
    const params = {
      UserId: Number(localStorage.getItem("UserId")),
      NotificationDeptId: notification.NotificationId,
      IsChecked: notification.IsChecked,
    };
    const url = `${process.env.pms_api_url}/notification/savebyuser`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (emailNotificationOpen) {
      getPermissionDetails();
    }
  }, [emailNotificationOpen]);

  useEffect(() => {
    if (data.length > 0) {
      setNotificationList(data);
    }
  }, [data]);

  const handleCheckboxChange = (notificationId: number) => {
    const updatedList = notificationList.map((notification) =>
      notification.NotificationId === notificationId
        ? { ...notification, IsChecked: !notification.IsChecked }
        : notification
    );

    setNotificationList(updatedList);

    const updatedNotification = updatedList.find(
      (notification) => notification.NotificationId === notificationId
    );

    if (updatedNotification) {
      saveNotification(updatedNotification);
    }
  };

  return (
    <>
      <div
        className={`fixed top-0 right-0 z-30 h-screen overflow-y-auto w-[500px] border border-lightSilver bg-pureWhite transform ${
          emailNotificationOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="sticky top-0 !h-[7%] bg-whiteSmoke border-b z-30 border-lightSilver">
          <div className="flex p-[6px] justify-between items-center">
            <div className="flex items-center py-[6.5px] pl-[5px]">
              Email Notifications
            </div>
            <Tooltip title="Close" placement="left" arrow>
              <IconButton
                className="mr-[10px]"
                onClick={() => setEmailNotificationOpen(false)}
              >
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>
        <div className="!h-[91%] p-4">
          {loading && <ReportLoader />}
          {!loading && data.length === 0 && <p>No data found</p>}
          {!loading && data.length > 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell style={{ width: "auto" }}>Name</TableCell>
                  <TableCell align="center" style={{ width: "50px" }}>
                    IsChecked
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {notificationList.map((notification) => (
                  <TableRow key={notification.NotificationId}>
                    <TableCell>{notification.Name}</TableCell>
                    <TableCell align="center">
                      <Checkbox
                        checked={notification.IsChecked}
                        disabled={
                          !hasPermissionWorklog(
                            "Notification",
                            "save",
                            "settings"
                          )
                        }
                        onChange={() =>
                          handleCheckboxChange(notification.NotificationId)
                        }
                        style={{ marginLeft: "auto", marginRight: "auto" }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </>
  );
};

export default NotificationDrawer;
