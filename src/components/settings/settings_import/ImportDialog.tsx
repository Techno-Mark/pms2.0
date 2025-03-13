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
  onDataFetch: (() => void) | null;
  tab: string;
}

const ImportDialog = ({
  onOpen,
  onClose,
  onDataFetch,
  tab,
}: ImportDialogProp) => {
  const [fileInputKey, setFileInputKey] = useState(0);
  const [fileInputKeyClient, setFileInputKeyClient] = useState(0);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [selectedFileId, setSelectedFileId] = useState<number>(0);
  const [isUploading, setIsUplaoding] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isUploadingClient, setIsUplaodingClient] = useState<boolean>(false);
  const [loadingClient, setLoadingClient] = useState<boolean>(false);

  const handleFileChange = (event: any) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleClose = () => {
    setFileInputKey((prevKey) => prevKey + 1);
    setFileInputKeyClient((prevKey) => prevKey + 1);
    setSelectedFile(null);
    setSelectedFileId(0);
    onClose();
  };

  const handleApplyImportExcel = async () => {
    const token = await localStorage.getItem("token");
    const Org_Token = await localStorage.getItem("Org_Token");
    const apiEndPoint =
      tab === "Client"
        ? `${process.env.pms_api_url}/client/import`
        : tab === "Project"
        ? `${process.env.pms_api_url}/project/import`
        : tab === "User" && `${process.env.api_url}/user/import`;

    if (selectedFile) {
      try {
        selectedFileId === 1 && setIsUplaoding(true);
        selectedFileId === 2 && setIsUplaodingClient(true);
        const formData = new FormData();
        formData.append("File", selectedFile);
        if (tab === "User") {
          formData.append("RoleType", selectedFileId.toString());
        }

        const response = await axios.post(`${apiEndPoint}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
        });

        if (response.status === 200) {
          if (response.data.ResponseStatus === "Success") {
            toast.success("Task has been imported successfully.");
            onDataFetch?.();
            selectedFileId === 1 && setIsUplaoding(false);
            selectedFileId === 2 && setIsUplaodingClient(false);
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

            onDataFetch?.();
            selectedFileId === 1 && setIsUplaoding(false);
            selectedFileId === 2 && setIsUplaodingClient(false);
            handleClose();
          } else {
            toast.error(
              "The uploaded file is not in the format of the sample file."
            );
            selectedFileId === 1 && setIsUplaoding(false);
            selectedFileId === 2 && setIsUplaodingClient(false);
            handleClose();
          }
        } else {
          toast.error("Please try again later.");
          selectedFileId === 1 && setIsUplaoding(false);
          selectedFileId === 2 && setIsUplaodingClient(false);
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

  const handleDownloadSampleFile = async (id?: number) => {
    id === 1 && setLoading(true);
    id === 2 && setLoadingClient(true);
    const token = localStorage.getItem("token");
    const Org_Token = localStorage.getItem("Org_Token");

    let apiEndPoint = "";

    if (tab === "Client") {
      apiEndPoint = `${process.env.pms_api_url}/client/exportexcelfordemo`;
    } else if (tab === "Project") {
      apiEndPoint = `${process.env.pms_api_url}/project/exportexcelfordemo`;
    } else if (tab === "User") {
      apiEndPoint = `${process.env.api_url}/user/exportexcelfordemo`;
    }

    try {
      let response;

      if (tab === "User" && id) {
        response = await axios.post(apiEndPoint, id, {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
            "Content-Type": "Text",
          },
          responseType: "blob",
        });
      } else {
        response = await axios.get(apiEndPoint, {
          headers: {
            Authorization: `bearer ${token}`,
            org_token: `${Org_Token}`,
          },
          responseType: "blob",
        });
      }

      if (response.status === 200) {
        const blob = new Blob([response.data], {
          type: response.headers["content-type"],
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${
          tab === "User" && id == 1
            ? "Employee"
            : tab === "User" && id == 2
            ? "Client_User"
            : tab
        }_SampleExcel.xlsx`;
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
      id === 1 && setLoading(false);
      id === 2 && setLoadingClient(false);
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
            className={`pt-6 px-[10px] pb-[10px] h-[200px] ${
              tab === "User" ? "w-full" : "min-w-[20vw] w-full"
            } flex items-center justify-center gap-4`}
          >
            <div
              className={`flex items-center justify-around gap-5 ${
                tab === "User" ? "w-[50%]" : "w-[100%]"
              }`}
            >
              <input
                key={fileInputKey}
                accept=".xls,.xlsx"
                style={{ display: "none" }}
                id="raised-button-file"
                onChange={(e) => {
                  setSelectedFileId(1);
                  handleFileChange(e);
                }}
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
                      <span className="text-darkCharcoal">
                        {tab === "User" ? "Employee Excel" : "Import Excel"}
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
            {tab === "User" && (
              <div className="flex items-center justify-around gap-5 w-[50%]">
                <input
                  key={fileInputKeyClient}
                  accept=".xls,.xlsx"
                  style={{ display: "none" }}
                  id="raised-button-file-client"
                  onChange={(e) => {
                    setSelectedFileId(2);
                    handleFileChange(e);
                  }}
                  type="file"
                />
                <label
                  htmlFor="raised-button-file-client"
                  className="flex items-center justify-center border border-lightSilver rounded-md w-full h-44 shadow-md hover:shadow-xl hover:bg-[#f5fcff] hover:border-[#a4e3fe] cursor-pointer"
                >
                  <div className="flex flex-col items-center gap-3">
                    {isUploadingClient ? (
                      <span>Uploading..</span>
                    ) : (
                      <>
                        <ExcelIcon />
                        <span className="text-darkCharcoal">
                          {tab === "User" ? "Client Excel" : "Import Excel"}
                        </span>
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
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
                onClick={() => handleDownloadSampleFile(1)}
              >
                {tab === "User" ? "Employee Sample File" : "Sample File"}&nbsp;
                <span className="text-xl">
                  <Download />
                </span>
              </Button>
            )}
            {tab === "User" && loadingClient ? (
              <span className="flex items-center justify-center w-40">
                <Spinner size="20px" />
              </span>
            ) : (
              tab === "User" && (
                <Button
                  variant="contained"
                  color="success"
                  className="rounded-[4px] !h-[36px] !bg-[#388e3c] hover:!bg-darkSuccess"
                  onClick={() => handleDownloadSampleFile(2)}
                >
                  Client Sample File&nbsp;
                  <span className="text-xl">
                    <Download />
                  </span>
                </Button>
              )
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

export default ImportDialog;
