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
  onDataFetch: any;
}

const ImportDialog: React.FC<ImportDialogProp> = ({
  onOpen,
  onClose,
  onDataFetch,
}) => {
  const [error, setError] = useState("");
  const [importText, setImportText] = useState("");
  const [importFields, setImportFields] = useState<any[]>([]);
  const [isNextCliecked, setIsNextClicked] = useState<boolean>(false);
  const [selectedTasks, setselectedtasks] = useState<any[]>([]);
  const [isTaskClicked, setIsTaskClicked] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUplaoding] = useState<boolean>(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [loading, setLoading] = useState(false);

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
    setSelectedFile(null);
  };

  const handleRowSelect = (
    currentRowsSelected: any,
    allRowsSelected: any,
    rowsSelected: any
  ) => {
    const selectedData = allRowsSelected.map(
      (row: any) => importFields[row.dataIndex]
    );

    const tasks =
      selectedData.length > 0
        ? selectedData.map((selectedRow: any) => ({
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

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleApplyImport = async () => {
    const params = {
      TaskNameList: selectedTasks,
    };
    const url = `${process.env.worklog_api_url}/workitem/import`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Task has been imported successfully.");
        onDataFetch();
        handleClose();
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleApplyImportExcel = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    if (selectedFile) {
      try {
        setIsUplaoding(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await axios.post(
          `${process.env.worklog_api_url}/workitem/importexcel`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `bearer ${token}`,
              org_token: `${Org_Token}`,
            },
          }
        );

        if (response.status === 200) {
          if (response.data.ResponseStatus === "Success") {
            toast.success("Task has been imported successfully.");
            onDataFetch();
            setIsUplaoding(false);
            handleClose();
          } else if (response.data.ResponseStatus === "Warning") {
            toast.warning(
              `Valid Task has been imported and an Excel file ${response.data.ResponseData.FileDownloadName} has been downloaded for invalid tasks.`
            );

            const byteCharacters = atob(
              response.data.ResponseData.FileContents
            );
            const byteNumbers = new Array(byteCharacters.length);
            for (let i = 0; i < byteCharacters.length; i++) {
              byteNumbers[i] = byteCharacters.charCodeAt(i);
            }
            const byteArray = new Uint8Array(byteNumbers);

            const fileBlob = new Blob([byteArray], {
              type: `${response.data.ResponseData.ContentType}`,
            });

            const fileURL = URL.createObjectURL(fileBlob);
            const downloadLink = document.createElement("a");
            downloadLink.href = fileURL;
            downloadLink.setAttribute(
              "download",
              response.data.ResponseData.FileDownloadName
            );
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(fileURL);

            onDataFetch();
            setIsUplaoding(false);
            handleClose();
          } else {
            toast.error(
              "The uploaded file is not in the format of the sample file."
            );
            setIsUplaoding(false);
            handleClose();
          }
        } else {
          toast.error("Please try again later.");
          setIsUplaoding(false);
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  useEffect(() => {
    if (selectedFile !== null) {
      handleApplyImportExcel();
    }
  }, [selectedFile]);

  const handleDownloadSampleFile = async () => {
    setLoading(true);
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");

    try {
      const response = await axios.get(
        `${process.env.worklog_api_url}/workitem/exportexcelfordemo`,
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
          a.download = `SampleExcel.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          toast.success("File has been downloaded successfully.");
          setLoading(false);
        }
      } else {
        toast.error("Please try again later.");
        setLoading(false);
      }
    } catch (error) {
      toast.error("Error downloading data.");
      setLoading(false);
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
                    currentRowsSelected: any,
                    allRowsSelected: any,
                    rowsSelected: any
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
            <div className="pt-6 px-[10px] pb-[10px] h-[235px] w-[40vw]">
              <div className="flex items-center justify-around gap-5">
                <input
                  key={fileInputKey}
                  accept=".xls,.xlsx"
                  style={{ display: "none" }}
                  id="raised-button-file"
                  onChange={handleFileChange}
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
                        <span className="text-darkCharcoal">Import Excel</span>
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
              {loading ? (
                <span className="flex items-center justify-center w-40">
                  <Spinner size="20px" />
                </span>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  className="rounded-[4px] !h-[36px] !bg-[#388e3c] hover:!bg-darkSuccess"
                  onClick={handleDownloadSampleFile}
                >
                  Sample File&nbsp;
                  <span className="text-xl">
                    <Download />
                  </span>
                </Button>
              )}

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
