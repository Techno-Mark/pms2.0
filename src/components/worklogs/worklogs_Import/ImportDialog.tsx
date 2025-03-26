import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import { TextareaAutosize } from "@mui/base/TextareaAutosize";
import { FormControl, FormHelperText } from "@mui/material";
import MUIDataTable from "mui-datatables";
import ExcelIcon from "@/assets/icons/Import/ExcelIcon";
import FileIcon from "@/assets/icons/Import/FileIcon";
import Download from "@/assets/icons/Import/Download";
import {
  Table_Options,
  Table_Columns,
} from "@/utils/worklog/importTableOprions";
import { TransitionDown } from "@/utils/style/DialogTransition";
import { callAPI } from "@/utils/API/callAPI";
import { Spinner } from "next-ts-lib";

interface ImportDialogProp {
  onOpen: boolean;
  onClose: () => void;
  onDataFetch: (() => void) | null;
}

const ImportDialog = ({ onOpen, onClose, onDataFetch }: ImportDialogProp) => {
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");
  const [importFields, setImportFields] = useState<
    | {
        id: number;
        field: string;
      }[]
    | []
  >([]);
  const [isNextCliecked, setIsNextClicked] = useState<boolean>(false);
  const [selectedTasks, setselectedtasks] = useState<
    | {
        TaskName: string;
      }[]
    | []
  >([]);
  const [isTaskClicked, setIsTaskClicked] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUplaoding] = useState<boolean>(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedFileErrorlog, setSelectedFileErrorlog] = useState<any>(null);
  const [isUploadingErrorlog, setIsUplaodingErrorlog] =
    useState<boolean>(false);
  const [fileInputKeyErrorlog, setFileInputKeyErrorlog] = useState(0);
  const [loadingErrorlog, setLoadingErrorlog] = useState(false);

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setError("");
    setImportText("");
    setImportFields([]);
    setIsNextClicked(false);
    setIsTaskClicked(false);
    setselectedtasks([]);
    setFileInputKey((prevKey) => prevKey + 1);
    setFileInputKeyErrorlog((prevKey) => prevKey + 1);
    setSelectedFile(null);
    setSelectedFileErrorlog(null);
  };

  const handleRowSelect = (
    currentRowsSelected: { index: number; dataIndex: number }[] | [],
    allRowsSelected: { index: number; dataIndex: number }[] | [],
    rowsSelected: number[] | []
  ) => {
    const selectedData = allRowsSelected.map(
      (row: { index: number; dataIndex: number }) => importFields[row.dataIndex]
    );

    const tasks =
      selectedData.length > 0
        ? selectedData.map((selectedRow: { id: number; field: string }) => ({
            TaskName: selectedRow.field,
          }))
        : [];

    setselectedtasks(tasks);
  };

  const convertToArrayOfObjects = (data: string) => {
    let dataArray;
    if (data.includes("\n")) {
      dataArray = data
        .split("\n")
        .filter((item) => item.trim() !== "")
        .map((item, index) => ({ id: index + 1, field: item.trim() }));
    } else {
      dataArray = [{ id: 1, field: data.trim() }];
    }
    return dataArray;
  };

  const handleProcessData = () => {
    if (importText.trim() === "") {
      setError("Please enter import fields");
      return;
    }

    setIsNextClicked(true);
    setIsTaskClicked(false);
    setImportFields(convertToArrayOfObjects(importText));
  };

  const handleFileChange = (event: any, isTask: boolean) => {
    isTask
      ? setSelectedFile(event.target.files[0])
      : setSelectedFileErrorlog(event.target.files[0]);
  };

  const handleApplyImport = async () => {
    const params = {
      TaskNameList: selectedTasks,
    };
    const url = `${process.env.worklog_api_url}/workitem/import`;
    const successCallback = (
      ResponseData: null,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Task has been imported successfully.");
        onDataFetch?.();
        handleClose();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleApplyImportExcel = async (isTask: boolean) => {
    const token = localStorage.getItem("token");
    const Org_Token = localStorage.getItem("Org_Token");

    const file = isTask ? selectedFile : selectedFileErrorlog;

    if (file) {
      const setUploading = isTask ? setIsUplaoding : setIsUplaodingErrorlog;
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await axios.post(
          `${process.env.worklog_api_url}/workitem/${
            isTask ? "importexcel" : "importerrorlogsexcel"
          }`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `bearer ${token}`,
              org_token: `${Org_Token}`,
            },
          }
        );

        const { ResponseStatus, Message, ResponseData } = response.data;

        if (ResponseStatus === "Success") {
          toast.success("Task has been imported successfully.");
        } else if (ResponseStatus === "Warning" && ResponseData) {
          handleFileDownload(ResponseData);
          toast.warning(
            "Valid tasks imported. Invalid tasks saved to an Excel file."
          );
        } else {
          toast.error(Message || "The uploaded file format is invalid.");
        }

        onDataFetch?.();
        handleClose();
      } catch (error) {
        console.error("Error during file upload:", error);
        toast.error("An error occurred while uploading. Please try again.");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleFileDownload = (fileData: {
    FileContents: string;
    FileDownloadName: string;
    ContentType: string;
  }) => {
    const { FileContents, FileDownloadName, ContentType } = fileData;

    const byteCharacters = atob(FileContents);
    const byteNumbers = new Uint8Array(
      Array.from(byteCharacters).map((char) => char.charCodeAt(0))
    );

    const blob = new Blob([byteNumbers], { type: ContentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = FileDownloadName;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (selectedFile !== null) {
      handleApplyImportExcel(true);
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFileErrorlog !== null) {
      handleApplyImportExcel(false);
    }
  }, [selectedFileErrorlog]);

  const handleDownloadSampleFile = async (isTask: boolean) => {
    isTask ? setLoading(true) : setLoadingErrorlog(true);
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    try {
      const response = await axios.get(
        `${process.env.worklog_api_url}/workitem/${
          isTask ? "exportexcelfordemo" : "exporterrorlogsample"
        }`,
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        if (response.data.ResponseStatus === "Failure") {
          toast.error("Please try again later.");
          setLoading(false);
        } else {
          const blob = new Blob([response.data], {
            type: response.headers["content-type"],
          });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${
            isTask ? "SampleTaskExcel" : "SampleErrorlogExcel"
          }.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success("File has been downloaded successfully.");
          isTask ? setLoading(false) : setLoadingErrorlog(false);
        }
      } else {
        toast.error("Please try again later.");
        isTask ? setLoading(false) : setLoadingErrorlog(false);
      }
    } catch (error) {
      toast.error("Error downloading data.");
      isTask ? setLoading(false) : setLoadingErrorlog(false);
    }
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={TransitionDown}
        keepMounted
        maxWidth="md"
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Import</span>
          {isTaskClicked ? (
            <Button
              color="info"
              onClick={() => {
                setIsTaskClicked(false);
                setImportText("");
              }}
            >
              Back
            </Button>
          ) : isNextCliecked ? (
            <Button
              color="info"
              onClick={() => {
                setIsNextClicked(false);
                setIsTaskClicked(true);
              }}
            >
              Back
            </Button>
          ) : null}
        </DialogTitle>
        <DialogContent>
          {isTaskClicked ? (
            <div className="pt-6 px-[10px] pb-[10px] h-[235px] w-[40vw]">
              <FormControl sx={{ mx: 0.75 }} variant="standard">
                <TextareaAutosize
                  color="error"
                  aria-label="import_TextArea"
                  minRows={8}
                  required
                  placeholder="Enter Import Fields"
                  className={`outline-none border-b border-lightSilver !w-[37.5vw] ${
                    error.length > 0 ? "!border-defaultRed" : ""
                  }`}
                  value={importText}
                  onChange={(e) => {
                    setImportText(e.target.value);
                    setError("");
                  }}
                />
                {error.length > 0 && (
                  <FormHelperText error>{error}</FormHelperText>
                )}
              </FormControl>
            </div>
          ) : isNextCliecked ? (
            <div className="pt-6 pb-1 w-[40vw]">
              <MUIDataTable
                options={{
                  ...Table_Options,
                  onRowSelectionChange: (
                    currentRowsSelected:
                      | { index: number; dataIndex: number }[]
                      | [],
                    allRowsSelected:
                      | { index: number; dataIndex: number }[]
                      | [],
                    rowsSelected: number[] | []
                  ) =>
                    handleRowSelect(
                      currentRowsSelected,
                      allRowsSelected,
                      rowsSelected
                    ),
                }}
                columns={Table_Columns}
                data={importFields}
                title={undefined}
              />
            </div>
          ) : (
            <div className="pt-6 px-[10px] pb-[10px] h-[235px]">
              <div className="flex items-center justify-around gap-5">
                <input
                  key={`${fileInputKey + Math.random()}`}
                  accept=".xls,.xlsx"
                  style={{ display: "none" }}
                  id="raised-button-file"
                  onChange={(e) => {
                    handleFileChange(e, true);
                  }}
                  type="file"
                />
                <label
                  htmlFor="raised-button-file"
                  className="flex items-center justify-center border border-lightSilver rounded-md w-full h-52 shadow-md hover:shadow-xl hover:bg-[#f5fcff] hover:border-[#a4e3fe] cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-3">
                    {isUploading ? (
                      <span>Uploading..</span>
                    ) : (
                      <>
                        <ExcelIcon />
                        <span className="text-darkCharcoal">
                          Import Task Excel
                        </span>
                      </>
                    )}
                  </div>
                </label>
                <input
                  key={fileInputKeyErrorlog}
                  accept=".xls,.xlsx"
                  style={{ display: "none" }}
                  id="raised-button-file-errorlog"
                  onChange={(e) => handleFileChange(e, false)}
                  type="file"
                />
                <label
                  htmlFor="raised-button-file-errorlog"
                  className="flex items-center justify-center border border-lightSilver rounded-md w-full h-52 shadow-md hover:shadow-xl hover:bg-[#f5fcff] hover:border-[#a4e3fe] cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-3">
                    {isUploadingErrorlog ? (
                      <span>Uploading..</span>
                    ) : (
                      <>
                        <ExcelIcon />
                        <span className="text-darkCharcoal">
                          Import Errorlog Excel
                        </span>
                      </>
                    )}
                  </div>
                </label>
                <div
                  className="flex items-center justify-center border border-lightSilver rounded-md w-full h-52 shadow-md hover:shadow-xl hover:bg-[#f5fcff] hover:border-[#a4e3fe] cursor-pointer"
                  onClick={() => setIsTaskClicked(true)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <FileIcon />
                    <span className="text-darkCharcoal">Import Task</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
        <DialogActions
          className={`border-t border-t-lightSilver p-[20px] mx-[15px] gap-[10px] h-[64px] ${
            isTaskClicked
              ? ""
              : isNextCliecked
              ? "flex justify-end"
              : "flex justify-between"
          }`}
        >
          {isTaskClicked ? (
            <>
              <Button variant="outlined" color="error" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                className="!bg-secondary"
                variant="contained"
                onClick={handleProcessData}
              >
                Next
              </Button>
            </>
          ) : isNextCliecked ? (
            <Button
              className={`${selectedTasks.length <= 0 ? "" : "!bg-secondary"}`}
              variant="contained"
              onClick={handleApplyImport}
              disabled={selectedTasks.length <= 0}
            >
              Submit
            </Button>
          ) : (
            <>
              <div className="flex items-center justify-center gap-4">
                {loading ? (
                  <span className="flex items-center justify-center w-40">
                    <Spinner size="20px" />
                  </span>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    className="rounded-[4px] !h-[36px] !bg-[#388e3c] hover:!bg-darkSuccess"
                    onClick={() => handleDownloadSampleFile(true)}
                  >
                    Sample Task File&nbsp;
                    <span className="text-xl">
                      <Download />
                    </span>
                  </Button>
                )}
                {loadingErrorlog ? (
                  <span className="flex items-center justify-center w-40">
                    <Spinner size="20px" />
                  </span>
                ) : (
                  <Button
                    variant="contained"
                    color="success"
                    className="rounded-[4px] !h-[36px] !bg-[#0281B9] hover:!bg-[#385461]"
                    onClick={() => handleDownloadSampleFile(false)}
                  >
                    Sample Errorlog File&nbsp;
                    <span className="text-xl">
                      <Download />
                    </span>
                  </Button>
                )}
              </div>

              <Button
                variant="outlined"
                className="rounded-[4px] !h-[36px]"
                onClick={handleClose}
              >
                Cancel
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ImportDialog;
