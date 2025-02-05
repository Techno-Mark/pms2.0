import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import HistoryIcon from "@/assets/icons/HistoryIcon";
import { callAPI } from "@/utils/API/callAPI";
import { generateCommonBodyRender } from "@/utils/datatable/CommonFunction";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { AuditlogGetByWorkitem } from "@/utils/Types/worklogsTypes";
import { ThemeProvider } from "@mui/material";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useState } from "react";

const DrawerLogs = ({
  onOpen,
  onEdit,
}: {
  onOpen: boolean;
  onEdit: number;
}) => {
  const [logsDrawer, setLogsDrawer] = useState(true);
  const [logsData, setLogsDate] = useState<AuditlogGetByWorkitem[] | []>([]);

  const logsDatatableTaskCols = [
    {
      name: "Filed",
      label: "Filed Name",
      options: {
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "OldValue",
      label: "Old Value",
      options: {
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
    {
      name: "NewValue",
      label: "New Value",
      options: {
        customBodyRender: (value: string) => {
          return generateCommonBodyRender(value);
        },
      },
    },
  ];

  const getLogsData = async () => {
    setLogsDrawer(true)
    const params = {
      WorkitemId: onEdit,
    };
    const url = `${process.env.report_api_url}/auditlog/getbyworkitem`;
    const successCallback = (
      ResponseData: { List: AuditlogGetByWorkitem[] | []; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (
        ResponseStatus === "Success" &&
        ResponseData !== null &&
        ResponseData.List.length >= 0 &&
        error === false
      ) {
        setLogsDate(ResponseData.List);
      } else {
        setLogsDate([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    onOpen && onEdit > 0 && getLogsData();
  }, [onEdit, onOpen]);

  return (
    <>
      <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
        <span className="flex items-center">
          <HistoryIcon />
          <span className="ml-[21px]">Logs</span>
        </span>
        <span
          className={`cursor-pointer ${logsDrawer ? "rotate-180" : ""}`}
          onClick={() => setLogsDrawer(!logsDrawer)}
        >
          <ChevronDownIcon />
        </span>
      </div>
      {logsDrawer &&
        logsData.length > 0 &&
        logsData.map((i: AuditlogGetByWorkitem, index: number) => (
          <div className="mt-5 pl-[70px] text-sm" key={i.UpdatedBy + index}>
            <div className="flex gap-3 mt-4">
              <b className="mt-2">{index + 1}</b>
              <div className="flex flex-col items-start">
                <b>Modify By: {i.UpdatedBy}</b>
                <b>
                  Date & Time:&nbsp;
                  {i.UpdatedOn.split("T")[0]
                    .split("-")
                    .slice(1)
                    .concat(i.UpdatedOn.split("T")[0].split("-")[0])
                    .join("-")}
                  &nbsp;&&nbsp;
                  {i.UpdatedOn.split("T")[1]}
                </b>
                <br />
                <ThemeProvider theme={getMuiTheme()}>
                  <MUIDataTable
                    data={i.UpdatedFieldsList}
                    columns={logsDatatableTaskCols}
                    title={undefined}
                    options={{
                      responsive: "standard",
                      viewColumns: false,
                      filter: false,
                      print: false,
                      download: false,
                      search: false,
                      selectToolbarPlacement: "none",
                      selectableRows: "none",
                      elevation: 0,
                      pagination: false,
                    }}
                    data-tableid="task_Report_Datatable"
                  />
                </ThemeProvider>
                <br />
              </div>
            </div>
          </div>
        ))}
    </>
  );
};

export default DrawerLogs;
