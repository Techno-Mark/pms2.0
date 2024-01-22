import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
} from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { generateCustomColumn } from "@/utils/datatable/columns/ColsGenerateFunctions";
import { ThemeProvider } from "@emotion/react";
import { CheckBox } from "@mui/icons-material";
import {
  Checkbox,
  FormControlLabel,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
} from "@mui/material";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";

const Permissions = ({
  onOpen,
  permissionValue,
  sendDataToParent,
  expanded,
  loading,
  getOrgDetailsFunction,
  canView,
  canEdit,
  canDelete,
  onHandleExport,
}: any) => {
  const [data, setData] = useState<any>([]);

  useEffect(() => {
    if (permissionValue > 0) {
      const timer = setTimeout(() => {
        getAll();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [permissionValue]);

  const getAll = async () => {
    const params = {
      roleId: permissionValue !== 0 && permissionValue,
    };
    const url = `${process.env.pms_api_url}/Role/GetPermission`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setData(ResponseData);
        getOrgDetailsFunction();
        sendDataToParent(ResponseData);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleCheckboxChange = (
    parentId: number,
    childIndex: number | undefined,
    actionIndex: number
  ) => {
    const updatedData = data.map((parent: any, parentIdx: number) => {
      if (parentIdx === parentId) {
        console.log(parent);
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
    sendDataToParent(updatedData);
  };

  const generateConditionalColumn = (
    column: {
      name: string;
      label: string;
      bodyRenderer: (arg0: any) => any;
    },
    rowDataIndex: number
  ) => {
    if (column.name === "ActionList") {
      return {
        name: "ActionList",
        options: {
          filter: true,
          viewColumns: false,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName(""),
          customBodyRender: (value: any, tableMeta: any) => {
            return (
              <div className="flex items-center justify-start gap-20">
                {value.map((i: any, index: any) => (
                  <FormControlLabel
                    className="w-40"
                    key={i.ActionId}
                    control={
                      <Checkbox
                        checked={i.IsChecked}
                        onChange={() =>
                          tableMeta.rowData[3] - 1 === 3 && data.length === 3
                            ? handleCheckboxChange(2, undefined, index)
                            : handleCheckboxChange(
                                tableMeta.rowData[3] - 1,
                                undefined,
                                index
                              )
                        }
                        inputProps={{ "aria-label": "controlled" }}
                      />
                    }
                    label={i.ActionName}
                  />
                ))}
              </div>
            );
          },
        },
      };
    } else if (column.name === "ParentId") {
      return {
        name: "ParentId",
        options: {
          display: false,
          viewColumns: false,
        },
      };
    } else if (column.name === "Sequence") {
      return {
        name: "Sequence",
        options: {
          display: false,
          viewColumns: false,
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
      name: "Name",
      label: "",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ActionList",
      label: "",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "ParentId",
      options: {
        display: false,
        viewColumns: false,
      },
    },
    {
      name: "Sequence",
      options: {
        display: false,
        viewColumns: false,
      },
    },
  ];

  const permissionColumns: any = column.map((col: any) => {
    return generateConditionalColumn(col, 10);
  });

  const options: any = {
    filterType: "checkbox",
    responsive: "standard",
    tableBodyHeight: "73vh",
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
    expandableRows: true,
    renderExpandableRow: (rowData: any, rowMeta: any) => {
      return (
        <React.Fragment>
          <tr>
            <td colSpan={12}>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableBody>
                    {/* <span className="ml-16"> */}
                    {data[rowMeta.rowIndex].Children.length > 0 ? (
                      data[rowMeta.rowIndex].Children.map(
                        (i: any, index: any) => {
                          return (
                            <div key={i.Id}>
                              <TableCell className="!pl-20 w-[19.4rem]">
                                {i.Name}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-start gap-20 -ml-10">
                                  {i.ActionList.map((j: any, indexj: any) => {
                                    return (
                                      <FormControlLabel
                                        className="w-36"
                                        key={j.ActionId}
                                        control={
                                          <Checkbox
                                            checked={j.IsChecked}
                                            onChange={() =>
                                              i.Sequence - 1 === 3 &&
                                              data.length === 3
                                                ? handleCheckboxChange(
                                                    2,
                                                    indexj,
                                                    index
                                                  )
                                                : handleCheckboxChange(
                                                    i.Sequence - 1,
                                                    indexj,
                                                    index
                                                  )
                                            }
                                            inputProps={{
                                              "aria-label": "controlled",
                                            }}
                                          />
                                        }
                                        label={j.ActionName}
                                      />
                                    );
                                  })}
                                </div>
                              </TableCell>
                            </div>
                          );
                        }
                      )
                    ) : (
                      <TableRow className="h-16">
                        <span className="flex items-center justify-start pt-5 ml-16">
                          No data found.
                        </span>
                      </TableRow>
                    )}
                    {/* </span> */}
                  </TableBody>
                </Table>
              </TableContainer>
            </td>
          </tr>
        </React.Fragment>
      );
    },
    elevation: 0,
    selectableRows: "none",
  };

  return (
    <>
      {canView ? (
        loading ? (
          <ReportLoader />
        ) : (
          <div>
            <ThemeProvider theme={getMuiTheme()}>
              <MUIDataTable
                data={data}
                columns={permissionColumns}
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
                              create role
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
        )
      ) : (
        <div className="flex justify-center items-center py-[17px] text-[14px] text-red-500">
          You don&apos;t have the privilege to view data.
        </div>
      )}
    </>
  );
};

export default Permissions;
