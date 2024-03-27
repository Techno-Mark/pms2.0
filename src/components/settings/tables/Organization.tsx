import ReportLoader from "@/components/common/ReportLoader";
import SwitchModal from "@/components/common/SwitchModal";
import { callAPI } from "@/utils/API/callAPI";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
} from "@/utils/datatable/CommonFunction";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import { Switch, ThemeProvider } from "@mui/material";
import TableActionIcon from "@/assets/icons/TableActionIcon";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import MUIDataTable from "mui-datatables";
import { OrgList, OrgProps, SettingAction } from "@/utils/Types/settingTypes";

const initialFilter = {
  GlobalSearch: "",
  SortColumn: null,
  IsDesc: true,
};

const Organization = ({
  onOpen,
  onEdit,
  onDataFetch,
  onSearchData,
  onSearchClear,
  onHandleExport,
}: OrgProps) => {
  const [loader, setLoader] = useState(true);
  const [userList, setUserList] = useState<OrgList[]>([]);
  const [isOpenSwitchModal, setIsOpenSwitchModal] = useState(false);
  const [switchId, setSwitchId] = useState(0);
  const [switchActive, setSwitchActive] = useState(false);
  const [filteredObject, setFilteredOject] = useState<{
    GlobalSearch: string;
    SortColumn: string | null;
    IsDesc: boolean;
  }>(initialFilter);

  useEffect(() => {
    if (onSearchData.trim().length >= 0) {
      setFilteredOject({
        ...filteredObject,
        GlobalSearch: onSearchData.trim(),
      });
    }
  }, [onSearchData]);

  useEffect(() => {
    const fetchData = async () => {
      const Org_Token = await localStorage.getItem("Org_Token");
      if (Org_Token !== null) {
        getAll();
        onDataFetch(fetchData);
      } else {
        setTimeout(fetchData, 1000);
      }
    };

    const timer = setTimeout(() => {
      fetchData();
    }, 500);
    return () => clearTimeout(timer);
  }, [filteredObject]);

  const getAll = async () => {
    const params = filteredObject;
    const url = `${process.env.pms_api_url}/organization/getall`;
    const successCallback = (
      ResponseData: OrgList[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        onHandleExport(ResponseData.length > 0 ? true : false);
        setLoader(false);
        setUserList(ResponseData);
      } else {
        setLoader(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const closeSwitchModal = async () => {
    await setIsOpenSwitchModal(false);
  };

  const handleToggleOrg = async () => {
    const params = {
      organizationId: switchId,
      isActive: switchActive,
    };
    const url = `${process.env.pms_api_url}/organization/activeinactive`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setIsOpenSwitchModal(false);
        toast.success("Status Updated Successfully.");
        onSearchClear();
        setFilteredOject({
          ...filteredObject,
          GlobalSearch: "",
        });
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleActionValue = async (actionId: string, id: number) => {
    if (actionId.toLowerCase() === "edit") {
      onEdit(id);
    }
  };

  const Actions = ({ actions, id }: SettingAction) => {
    const actionsRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        actionsRef.current &&
        !actionsRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    useEffect(() => {
      window.addEventListener("click", handleOutsideClick);
      return () => {
        window.removeEventListener("click", handleOutsideClick);
      };
    }, []);

    return (
      <div>
        <span
          ref={actionsRef}
          className="w-5 h-5 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <TableActionIcon />
        </span>
        {open && (
          <React.Fragment>
            <div className="absolute top-30 right-3 z-10 flex justify-center items-center">
              <div className="py-2 border border-lightSilver rounded-md bg-pureWhite shadow-lg ">
                <ul className="w-28">
                  {actions.map((action: string, index: number) => (
                    <li
                      key={index}
                      onClick={() => handleActionValue(action, id)}
                      className="flex w-full h-9 px-3 hover:bg-lightGray !cursor-pointer"
                    >
                      <div className="flex justify-center items-center ml-2 cursor-pointer">
                        <label className="inline-block text-xs cursor-pointer">
                          {action}
                        </label>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  };

  const generateConditionalColumn = (
    column: {
      name: string;
      label: string;
      bodyRenderer: (arg0: any) => any;
    },
    rowDataIndex: number
  ) => {
    if (column.label === "Status") {
      return {
        name: "IsActive",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Status"),
          customBodyRender: (value: boolean, tableMeta: any) => {
            const activeUser = async () => {
              await setIsOpenSwitchModal(true);
              await setSwitchId(
                tableMeta.rowData[tableMeta.rowData.length - 1]
              );
              await setSwitchActive(!value);
            };
            return (
              <div>
                <Switch checked={value} onChange={() => activeUser()} />
              </div>
            );
          },
        },
      };
    } else if (column.label === "Actions") {
      return {
        name: "OrganizationId",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Actions"),
          customBodyRender: (value: number) => {
            return <Actions actions={["Edit"]} id={value} />;
          },
        },
      };
    } else {
      return generateCustomColumn(
        column.name,
        column.label,
        column.bodyRenderer
      );
    }
  };

  const column = [
    {
      name: "OrganizationName",
      label: "Organization Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "IsActive",
      label: "Status",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "OrganizationId",
      label: "Actions",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const orgColumns = column.map((col: any) => {
    return generateConditionalColumn(col, 10);
  });

  const options: any = {
    filterType: "checkbox",
    responsive: "standard",
    tableBodyHeight: "83vh",
    viewColumns: false,
    filter: false,
    print: false,
    download: false,
    search: false,
    pagination: false,
    selectToolbarPlacement: "none",
    draggableColumns: {
      enabled: true,
      transitionTime: 300,
    },
    elevation: 0,
    selectableRows: "none",
  };

  return (
    <>
      {loader ? (
        <ReportLoader />
      ) : (
        <>
          <div className="muiTableActionHeight">
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                data={userList}
                columns={orgColumns}
                title={undefined}
                options={{
                  ...options,
                  textLabels: {
                    body: {
                      noMatch: (
                        <div className="flex items-start">
                          <span>
                            Currently there is no record, you may{" "}
                            <a
                              className="text-secondary underline cursor-pointer"
                              onClick={onOpen}
                            >
                              create organization
                            </a>{" "}
                            to continue.
                          </span>
                        </div>
                      ),
                      toolTip: "",
                    },
                  },
                }}
                data-tableid="Datatable"
              />
            </ThemeProvider>
          </div>

          {isOpenSwitchModal && (
            <SwitchModal
              isOpen={isOpenSwitchModal}
              onClose={closeSwitchModal}
              title={`${
                switchActive === true ? "Active" : "InActive"
              } Organization`}
              actionText="Yes"
              onActionClick={handleToggleOrg}
              firstContent={`Are you sure you want to ${
                switchActive === true ? "Active" : "InActive"
              } Organization?`}
            />
          )}
        </>
      )}
    </>
  );
};

export default Organization;
