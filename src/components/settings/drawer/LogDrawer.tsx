import React, { useEffect, useState } from "react";
import TaskIcon from "@/assets/icons/TaskIcon";
import OverLay from "@/components/common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import {
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  ThemeProvider,
  Tooltip,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { LabelValue } from "@/utils/Types/types";
import MUIDataTable from "mui-datatables";
import { getMuiTheme } from "@/utils/datatable/CommonStyle";
import { generateCommonBodyRender } from "@/utils/datatable/CommonFunction";

interface List {
  FieldId: number;
  DisplayName: string;
  IsChecked: boolean;
  Type: string;
}

const LogDrawer = ({
  onOpen,
  onClose,
  selectedRowId,
  type,
}: {
  onOpen: boolean;
  onClose: () => void;
  selectedRowId: number | null;
  type: string;
}) => {
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [logData, setLogData] = useState([]);

  const handleClose = () => {
    onClose();
  };

  const getData = async () => {
    setIsLoadingLogs(true);
    const params =
      type === "Client"
        ? { Clientid: selectedRowId }
        : { ProjectId: selectedRowId };
    const url = `${process.env.pms_api_url}/${
      type === "Client" ? "client/getlogsbyid" : "project/getlogsbyid"
    }`;
    const successCallback = (
      ResponseData: { List: any; TotalCount: number },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setIsLoadingLogs(false);
        setLogData(ResponseData.List);
        // setTotalCount(ResponseData.TotalCount);
      } else {
        setIsLoadingLogs(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    onOpen && getData();
  }, [onOpen]);

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

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[50vw] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">Logs</span>
          <div>
            <Tooltip title="Close" placement="left" arrow>
              <IconButton onClick={handleClose}>
                <Close />
              </IconButton>
            </Tooltip>
          </div>
        </div>

        <div className="flex flex-col ml-4 max-h-[76vh] overflow-y-auto">
            {logData.length > 0 &&
              logData.map((i: any, index: number) => (
                <div
                  className="mt-5 text-sm"
                  key={i.UpdatedBy + index}
                >
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
        </div>

        <div className="flex justify-end fixed w-full bottom-0 gap-[20px] px-[20px] py-[15px] bg-pureWhite border-t border-lightSilver">
          <Button
            variant="outlined"
            className="rounded-[4px] !h-[36px] !text-secondary"
            onClick={handleClose}
          >
            Cancel
          </Button>
        </div>
      </div>
      {isLoadingLogs ? <OverLay /> : ""}
    </>
  );
};

export default LogDrawer;
