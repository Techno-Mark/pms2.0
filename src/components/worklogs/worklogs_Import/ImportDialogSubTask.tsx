import ExcelIcon from "@/assets/icons/Import/ExcelIcon";
import { TransitionDown } from "@/utils/style/DialogTransition";
import { Download } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import axios from "axios";
import { Spinner } from "next-ts-lib";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

interface ImportDialogProp {
  onOpen: boolean;
  onClose: () => void;
  taskId: number;
  selectedFile: any;
  setSelectedFile: any;
  fileInputKey: any;
  setFileInputKey: any;
  isUploading: boolean;
  handleApplyImportExcel: (e: number) => void;
}

const ImportDialogSubTask = ({
  onOpen,
  onClose,
  taskId,
  selectedFile,
  setSelectedFile,
  fileInputKey,
  setFileInputKey,
  isUploading,
  handleApplyImportExcel,
}: ImportDialogProp) => {
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
    taskId === 0 && onClose();
  };

  const handleClose = () => {
    setFileInputKey((prevKey: any) => prevKey + 1);
    setSelectedFile(null);
    onClose();
  };

  useEffect(() => {
    if (selectedFile !== null && taskId > 0) {
      handleApplyImportExcel(taskId);
    }
  }, [selectedFile]);

  const handleDownloadSampleFile = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    const Org_Token = localStorage.getItem("Org_Token");

    try {
      let response = await axios.get(
        `${process.env.worklog_api_url}/workitem/exportexcelforSubTaskItem`,
        {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
          responseType: "blob",
        }
      );

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `SubTask_SampleExcel.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("File has been downloaded successfully.");
      } else {
        toast.error("Please try again later.");
      }
    } catch (error) {
      toast.error("Error downloading data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog
        open={onOpen}
        TransitionComponent={TransitionDown}
        keepMounted
        maxWidth="lg"
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Import</span>
        </DialogTitle>
        <DialogContent>
          <div
            className={`pt-6 px-[10px] pb-[10px] h-[200px] w-full flex items-center justify-center gap-4`}
          >
            <div className="flex items-center justify-around gap-5 w-[100%]">
              <input
                key={fileInputKey}
                accept=".xls,.xlsx"
                style={{ display: "none" }}
                id="raised-button-file-sub-task"
                onChange={(e) => handleFileChange(e)}
                type="file"
              />
              <label
                htmlFor="raised-button-file-sub-task"
                className="flex items-center justify-center border border-lightSilver rounded-md w-full h-44 shadow-md hover:shadow-xl hover:bg-[#f5fcff] hover:border-[#a4e3fe] cursor-pointer"
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
            </div>
          </div>
        </DialogContent>
        <DialogActions className="border-t border-t-lightSilver p-[20px] mx-[15px] gap-[10px] h-[64px] flex items-center justify-between">
          <div className="flex items-center justify-start gap-4">
            {loading ? (
              <span className="flex items-center justify-center w-40">
                <Spinner size="20px" />
              </span>
            ) : (
              <Button
                variant="contained"
                color="success"
                className="rounded-[4px] !h-[36px] !bg-[#388e3c] hover:!bg-darkSuccess"
                onClick={() => handleDownloadSampleFile()}
              >
                Sample File
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
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ImportDialogSubTask;
