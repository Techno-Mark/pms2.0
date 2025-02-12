import OverLay from "@/components/common/OverLay";
import {
  PermissionsMenuItem,
  UserPermissionDrawer,
} from "@/utils/Types/settingTypes";
import axios from "axios";
import { Button, CheckBox, Close, DataTable } from "next-ts-lib";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

const UserPermissionDrawer = ({
  onOpen,
  onClose,
  userId,
  roleId,
  userType,
}: UserPermissionDrawer) => {
  const [isLoadingUserPermission, setIsLoadingUserPermission] = useState(false);
  const [data, setData] = useState<PermissionsMenuItem[]>([]);
  const [activeTab, setActiveTab] = useState(1);

  const getData = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    try {
      const response = await axios.post(
        `${process.env.pms_api_url}/Role/GetPermission`,
        {
          RoleId: roleId,
          UserId: userId,
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
          setData(response.data.ResponseData);
        } else {
          const data = response.data.Message;
          if (data === null) {
            toast.error("Please try again later.");
          } else {
            toast.error(data);
          }
        }
      } else {
        const data = response.data.Message;
        if (data === null) {
          toast.error("Login failed. Please try again.");
        } else {
          toast.error(data);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (roleId > 0) {
      setActiveTab(1);
      getData();
    }
  }, [roleId]);

  const getLargestArray = (arr: any) => {
    let index = 0;
    let arrLength = arr && arr[index]?.ActionList.length;
    arr?.forEach((a: any, i: number) => {
      if (a.ActionList.length > arrLength) {
        arrLength = a?.ActionList.length;
        index = i;
      }
    });
    return arr && arr[index]?.ActionList;
  };

  function generateColumns(data: any) {
    const largestChildArray = getLargestArray(data);
    const columns = [
      { header: "", accessor: "Name", sortable: false },
      ...(largestChildArray
        ? largestChildArray.map((child: null, index: number) => ({
            header: "",
            accessor: index,
            sortable: false,
          }))
        : []),
    ];

    return columns;
  }

  const handleSubmit = async (action: any) => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    try {
      setIsLoadingUserPermission(true);
      const response = await axios.post(
        `${process.env.pms_api_url}/Role/SaveUserPermission`,
        {
          PermissionId: action.ActionId,
          PermissionActionId: action.PermisisonActionId,
          UserId: userId,
          HasPermission: !action.IsChecked,
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
          setIsLoadingUserPermission(false);
        } else {
          const data = response.data.Message;
          if (data === null) {
            toast.error("Please try again later.");
          } else {
            toast.error(data);
          }
          setIsLoadingUserPermission(false);
        }
      } else {
        const data = response.data.Message;
        if (data === null) {
          toast.error("Failed Please try again.");
        } else {
          toast.error(data);
        }
        setIsLoadingUserPermission(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckboxChange = (
    parentId: number,
    childIndex: number | undefined,
    actionIndex: number
  ) => {
    const updatedData = data.map((parent: any, parentIdx: number) => {
      if (parentIdx === parentId) {
        if (childIndex !== undefined) {
          return {
            ...parent,
            Children: parent.Children.map((child: any, childIdx: number) => {
              if (childIdx === childIndex) {
                return {
                  ...child,
                  ActionList: child.ActionList.map(
                    (action: any, actionIdx: number) => {
                      if (actionIdx === actionIndex) {
                        const actionData: any = {
                          ActionId: child.Id,
                          PermisisonActionId: action.PermisisonActionId,
                          ActionName: action.ActionName,
                          IsChecked: action.IsChecked,
                        };
                        handleSubmit(actionData);
                        return {
                          ...action,
                          IsChecked: !action.IsChecked,
                        };
                      }
                      return action;
                    }
                  ),
                };
              }
              return child;
            }),
          };
        } else {
          return {
            ...parent,
            ActionList: parent.ActionList.map(
              (action: any, actionIdx: number) => {
                if (actionIdx === actionIndex) {
                  const actionData: any = {
                    ActionId: parent.Id,
                    PermisisonActionId: action.PermisisonActionId,
                    ActionName: action.ActionName,
                    IsChecked: action.IsChecked,
                  };
                  handleSubmit(actionData);
                  return {
                    ...action,
                    IsChecked: !action.IsChecked,
                  };
                }
                return action;
              }
            ),
          };
        }
      }
      return parent;
    });

    setData(updatedData);
  };

  const getCheckbox = (
    actionList: any,
    parentId: number,
    childIndex?: number | 0
  ) => {
    return actionList
      ?.sort((a: any, b: any) => b.ActionName.localeCompare(a.ActionName))
      .map((action: any, index: number) => {
        const uniqueId =
          childIndex === undefined
            ? parentId.toString() +
              action.ActionName +
              action.ActionId.toString()
            : parentId.toString() +
              action.ActionName +
              childIndex +
              action.ActionId.toString();

        return userType === "Client" ? (
          action.ActionId !== 12 && (
            <CheckBox
              key={uniqueId}
              label={action.ActionName}
              type="checkbox"
              id={uniqueId}
              checked={action.IsChecked}
              onChange={() =>
                parentId === 3 && data.length === 3
                  ? handleCheckboxChange(2, childIndex, index)
                  : handleCheckboxChange(parentId, childIndex, index)
              }
            />
          )
        ) : (
          <CheckBox
            key={uniqueId}
            label={action.ActionName}
            type="checkbox"
            id={uniqueId}
            checked={action.IsChecked}
            onChange={() =>
              parentId === 3 && data.length === 3
                ? handleCheckboxChange(2, childIndex, index)
                : handleCheckboxChange(parentId, childIndex, index)
            }
          />
        );
      });
  };

  let tableData = (activeTab === 1 ? data.slice(0, 6) : data.slice(6)).map(
    (i: PermissionsMenuItem) => {
      const isViewChecked = i.ActionList;
      const Id = i.Sequence - 1;

      return {
        ...i,
        ...getCheckbox(isViewChecked, Id),

        details:
          i.Children.length > 0 ? (
            <div className="ml-12">
              <DataTable
                noHeader
                columns={[
                  { header: "", accessor: "name", sortable: false },
                  ...getLargestArray(i?.Children).map(
                    (child: null, index: number) =>
                      new Object({
                        header: "",
                        accessor: index,
                        sortable: false,
                      })
                  ),
                ]}
                data={i.Children.map(
                  ({ Name, ActionList, ...more }: any, index: number) =>
                    new Object({
                      name: Name,
                      ...getCheckbox(ActionList, Id, index),
                    })
                )}
              />
            </div>
          ) : (
            ""
          ),
      };
    }
  );

  const handleClose = () => {
    setData([]);
    onClose();
  };

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[80vw] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">
            Edit Permission
          </span>
          <span onClick={handleClose}>
            <Close variant="medium" />
          </span>
        </div>
        {data.length > 4 && (
          <div className="flex gap-[16px] items-center py-[6.5px] ml-4">
            <label
              onClick={() => {
                setActiveTab(1);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                activeTab === 1
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              PMS
            </label>
            <span className="text-lightSilver">|</span>
            <label
              onClick={() => {
                setActiveTab(2);
              }}
              className={`py-[10px] text-[16px] cursor-pointer select-none ${
                activeTab === 2
                  ? "text-secondary font-semibold"
                  : "text-slatyGrey"
              }`}
            >
              Email box
            </label>
          </div>
        )}
        <div className="max-h-[75%] overflow-y-auto">
          {data.length > 0 && (
            <DataTable
              noHeader
              expandable
              columns={generateColumns(data)}
              data={tableData}
            />
          )}
        </div>
        <div className="flex justify-end fixed w-full bottom-0 gap-[20px] px-[20px] py-[15px] bg-pureWhite border-t border-lightSilver">
          <Button
            onClick={handleClose}
            variant="btn-outline-primary"
            className="rounded-[4px] !h-[36px] uppercase"
          >
            Cancel
          </Button>
        </div>
      </div>
      {isLoadingUserPermission ? <OverLay /> : ""}
    </>
  );
};

export default UserPermissionDrawer;
