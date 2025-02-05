import FileIcon from "@/components/common/FileIcon";
import ReportLoader from "@/components/common/ReportLoader";
import { callAPI } from "@/utils/API/callAPI";
import { generateCustomColumn } from "@/utils/datatable/ColsGenerateFunctions";
import {
  generateCommonBodyRender,
  generateCustomHeaderName,
} from "@/utils/datatable/CommonFunction";
import { ColorToolTip, getMuiTheme } from "@/utils/datatable/CommonStyle";
import { options } from "@/utils/datatable/TableOptions";
import { getFileFromBlob, getFileFromBlobForZip } from "@/utils/downloadFile";
import { LabelValue } from "@/utils/Types/types";
import { ThemeProvider } from "@emotion/react";
import { Download } from "@mui/icons-material";
import { Autocomplete, FormControl, TextField } from "@mui/material";
import MUIDataTable from "mui-datatables";
import React, { useEffect, useRef, useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

const Attachments = ({
  activeTab,
  ticketId,
}: {
  activeTab: number;
  ticketId: number;
}) => {
  const isCalledRef = useRef(false);
  const [historyData, setHistoryData] = useState<{
    loaded: boolean;
    data: any;
    tableDataCount: number;
  }>({
    loaded: false,
    data: [],
    tableDataCount: 0,
  });
  const [attachmentType, setAttachmentType] = useState(0);
  const attachmentTypeDropdown = [
    { label: "All", value: 0 },
    { label: "Internal Attachment", value: 3 },
    { label: "Email Attachment", value: 4 },
  ];

  const getAttachmentData = async (AttachmentType: number) => {
    setHistoryData({
      ...historyData,
      loaded: false,
    });
    const url = `${process.env.emailbox_api_url}/emailbox/GetTicketDetails`;
    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setHistoryData({
          ...historyData,
          data: ResponseData.AttachmentDetails,
          loaded: true,
        });
      } else {
        setHistoryData({ ...historyData, loaded: true });
      }
    };
    callAPI(
      url,
      {
        TicketId: ticketId,
        TabId: 3,
        AttachmentType: AttachmentType,
        FromDate: null,
        ToDate: null,
      },
      successCallback,
      "POST"
    );
  };

  useEffect(() => {
    setHistoryData({
      loaded: false,
      data: [],
      tableDataCount: 0,
    });
    setAttachmentType(0);
    if (activeTab === 3 && !isCalledRef.current) {
      getAttachmentData(0);
      isCalledRef.current = true;
    }
  }, [activeTab]);

  const attachmentColConfig = [
    {
      name: "UserFileName",
      label: "File Name",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "UploadedBy",
      label: "Uploaded By",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "UploadedTime",
      label: "Time",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "AttachmentType",
      label: "Attachment Type",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "URL",
      label: "Action",
      bodyRenderer: generateCommonBodyRender,
    },
    {
      name: "SystemFileName",
      label: "SystemFileName",
      bodyRenderer: generateCommonBodyRender,
    },
  ];

  const generateConditionalColumn = (column: {
    name: string;
    label: string;
    bodyRenderer: (arg0: any) => any;
  }) => {
    if (column.label === "File Name") {
      return {
        name: "UserFileName",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("File Name"),
          customBodyRender: (value: string) => {
            const shortProcessName =
              value !== null &&
              value !== undefined &&
              value !== "" &&
              value !== "0" &&
              value.length > 20
                ? value.slice(0, 20)
                : value;

            return (
              <div className="ml-2">
                {!value ||
                value === "0" ||
                value === null ||
                value === "null" ? (
                  "-"
                ) : value.length > 20 ? (
                  <>
                    <FileIcon fileName={value} />
                    &nbsp;
                    <ColorToolTip title={value} placement="top">
                      <span>{shortProcessName}</span>
                    </ColorToolTip>
                    <span>...</span>
                  </>
                ) : (
                  <>
                    <FileIcon fileName={value} />
                    &nbsp;
                    {shortProcessName}
                  </>
                )}
              </div>
            );
          },
        },
      };
    } else if (column.label === "Attachment Type") {
      return {
        name: "AttachmentType",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () =>
            generateCustomHeaderName("Attachment Type"),
          customBodyRender: (value: string) => {
            return (
              <div>
                {value === "3" ? "Internal Attachment" : "Email Attachment"}
              </div>
            );
          },
        },
      };
    } else if (column.label === "Action") {
      return {
        name: "URL",
        options: {
          filter: true,
          sort: true,
          customHeadLabelRender: () => generateCustomHeaderName("Action"),
          customBodyRender: (value: string, tableMeta: any) => {
            return (
              <div
                onClick={() => {
                  getFileFromBlob(
                    tableMeta.rowData[tableMeta.rowData.length - 1],
                    tableMeta.rowData[0],
                    true
                  );
                }}
                className="cursor-pointer"
              >
                <Download />
              </div>
            );
          },
        },
      };
    } else if (column.name === "SystemFileName") {
      return {
        name: "SystemFileName",
        options: {
          filter: false,
          sort: false,
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

  const attachmentCols = attachmentColConfig.map((col: any) => {
    return generateConditionalColumn(col);
  });

  const handleDownloadAll = async () => {
    const zip = new JSZip();

    const filePromises = historyData.data.map(async (file: any) => {
      try {
        const blob = await getFileFromBlobForZip(file.SystemFileName);

        if (blob) {
          zip.file(file.UserFileName, blob);
        }
      } catch (err) {
        console.error(`Error processing file: ${file.UserFileName}`, err);
      }
    });

    await Promise.all(filePromises);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "Attachments.zip");
    });
  };

  return (
    <div className="p-2">
      <div className="flex items-center justify-between mb-4 mt-2 mr-20">
        <FormControl
          variant="standard"
          sx={{ mx: 0.75, minWidth: 210, pt: "3px" }}
        >
          <Autocomplete
            id="tags-standard"
            options={attachmentTypeDropdown}
            getOptionLabel={(option: LabelValue) => option.label}
            onChange={(e, data: LabelValue | null) => {
              setAttachmentType(!!data ? data.value : 0);
              !!data && getAttachmentData(data.value);
            }}
            value={
              attachmentTypeDropdown.find(
                (i: LabelValue) => i.value === attachmentType
              ) || null
            }
            renderInput={(params: any) => (
              <TextField
                {...params}
                variant="standard"
                label="Attachment Type"
              />
            )}
          />
        </FormControl>
        {historyData.data.length > 0 && (
          <ColorToolTip
            title="Download"
            placement="top"
            arrow
            className="cursor-pointer"
            onClick={handleDownloadAll}
          >
            <Download />
          </ColorToolTip>
        )}
      </div>
      {historyData.loaded ? (
        <ThemeProvider theme={getMuiTheme()}>
          <MUIDataTable
            data={historyData.data}
            columns={attachmentCols}
            title={undefined}
            options={{ ...options, tableBodyHeight: "65vh" }}
            data-tableid="task_Report_Datatable"
          />
        </ThemeProvider>
      ) : (
        <ReportLoader />
      )}
    </div>
  );
};

export default Attachments;
