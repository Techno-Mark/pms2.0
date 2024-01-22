import ExcelIcon from "@/assets/icons/Import/ExcelIcon";
import FileIcon from "@/assets/icons/worklogs/FileIcon";
import ReportLoader from "@/components/common/ReportLoader";
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
  onDataFetch: any;
  tab: any;
}

const ImportDialog: React.FC<ImportDialogProp> = ({
  onOpen,
  onClose,
  onDataFetch,
  tab,
}) => {
  const [fileInputKey, setFileInputKey] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [isUploading, setIsUplaoding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleClose = () => {
    setFileInputKey((prevKey) => prevKey + 1);
    setSelectedFile(null);
    onClose();
  };

  const handleApplyImportExcel = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    const apiEndPoint =
      tab === "Client"
        ? "client/import"
        : tab === "Project" && "project/import";

    if (selectedFile) {
      try {
        setIsUplaoding(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        const response = await axios.post(
          `${process.env.pms_api_url}/${apiEndPoint}`,
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
    const apiEndPoint =
      tab === "Client"
        ? "client/exportexcelfordemo"
        : tab === "Project" && "project/exportexcelfordemo";

    try {
      const response = await axios.get(
        `${process.env.pms_api_url}/${apiEndPoint}`,
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
          a.download = `${tab}_SampleExcel.xlsx`;
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
        maxWidth="xs"
        onClose={handleClose}
      >
        <DialogTitle className="h-[64px] p-[20px] flex items-center justify-between border-b border-b-lightSilver">
          <span className="text-lg font-medium">Import</span>
        </DialogTitle>
        <DialogContent>
          <div className="pt-6 px-[10px] pb-[10px] h-[200px] w-[23vw]">
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
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default ImportDialog;
