import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { NotificationProps } from "@/utils/Types/settingTypes";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  TableContainer,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const Notification = ({
  onOpen,
  departmentValue,
  canView,
  saveDepartmentData,
  setSaveDepartmentData,
}: NotificationProps) => {
  const [loading, setLoading] = useState(false);
  const [notificationList, setNotificationList] = useState<any[]>([]);
  const [changedNotifications, setChangedNotifications] = useState<any[]>([]);

  const getPermissionDetails = async () => {
    setLoading(true);
    const params = {
      DepartmentId: departmentValue,
      UserId: null,
    };
    const url = `${process.env.pms_api_url}/notification/getnotification`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setNotificationList(ResponseData);
      }
      setLoading(false);
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    if (departmentValue > 0) {
      const timer = setTimeout(() => {
        getPermissionDetails();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [departmentValue]);

  const handleCheckboxChange = (notificationId: number) => {
    setNotificationList((prevList) =>
      prevList.map((notification) =>
        notification.NotificationId === notificationId
          ? { ...notification, IsChecked: !notification.IsChecked }
          : notification
      )
    );

    setChangedNotifications((prevChanged) => {
      const existingIndex = prevChanged.findIndex(
        (notification) => notification.NotificationId === notificationId
      );

      if (existingIndex !== -1) {
        return prevChanged.filter(
          (notification) => notification.NotificationId !== notificationId
        );
      } else {
        const updatedNotification = notificationList.find(
          (notification) => notification.NotificationId === notificationId
        );
        return [
          ...prevChanged,
          { ...updatedNotification, IsChecked: !updatedNotification.IsChecked },
        ];
      }
    });
  };

  const saveData = async () => {
    const params = {
      DepartmentId: departmentValue,
      NotificationList: changedNotifications,
    };
    const url = `${process.env.pms_api_url}/notification/savebydepartment`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setChangedNotifications([]);
        setSaveDepartmentData(false);
        toast.success("Notification updated successfully.")
      }
      setLoading(false);
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    saveDepartmentData && saveData();
  }, [saveDepartmentData]);

  return (
    <>
      {canView && loading && <ReportLoader />}
      {canView && !loading && notificationList.length === 0 && (
        <p className="flex items-center justify-center w-full">No data found</p>
      )}
      {canView && !loading && notificationList.length > 0 && (
        <TableContainer component={Paper} style={{ maxHeight: "86vh" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell className="font-bold">Name</TableCell>
                <TableCell align="center" className="font-bold">
                  IsChecked
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {notificationList.map((notification) => (
                <TableRow key={notification.NotificationId}>
                  <TableCell sx={{ width: "500px" }}>
                    {notification.Name}
                  </TableCell>
                  <TableCell align="center" sx={{ width: "500px" }}>
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
        </TableContainer>
      )}
    </>
  );
};

export default Notification;
