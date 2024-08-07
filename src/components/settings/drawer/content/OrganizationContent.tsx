import { callAPI } from "@/utils/API/callAPI";
import { OrgGetByIdList } from "@/utils/Types/settingTypes";
import { Button, TextField } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";

export interface OrganizationContentRef {
  clearOrganizationData: () => void;
}

const OrganizationContent = forwardRef<
  OrganizationContentRef,
  {
    onEdit: number;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    getOrgDetailsFunction: (() => void) | null;
    onChangeLoader: (e: boolean) => void;
  }
>(
  (
    { onEdit, onClose, onDataFetch, getOrgDetailsFunction, onChangeLoader },
    ref
  ) => {
    const [organizationId, setOrganizationId] = useState(0);
    const [clientName, setClientName] = useState("");
    const [clientNameErr, setClientNameErr] = useState(false);
    const [projectName, setProjectName] = useState("");
    const [projectNameErr, setProjectNameErr] = useState(false);
    const [processName, setProcessName] = useState("");
    const [processNameErr, setProcessNameErr] = useState(false);
    const [subProcessName, setSubProcessName] = useState("");
    const [subProcessNameErr, setSubProcessNameErr] = useState(false);
    const [organizationName, setOrganizationName] = useState("");
    const [organizationNameErr, setOrganizationNameErr] = useState(false);
    const [orgCreationDate, setOrgCreationDate] = useState("");

    useEffect(() => {
      setClientName("Client");
      setProjectName("Project");
      setProcessName("Process");
      setSubProcessName("SubProcess");
    }, []);

    useEffect(() => {
      if (onEdit > 0) {
        const params = { OrganizationId: onEdit > 0 ? onEdit : 0 };
        const url = `${process.env.pms_api_url}/organization/getbyid`;
        const successCallback = (
          ResponseData: OrgGetByIdList,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            setOrganizationId(ResponseData.OrganizationId);
            setOrganizationName(ResponseData.OrganizationName);
            setClientName(ResponseData.ClientModuleName);
            setProjectName(ResponseData.ProjectModuleName);
            setProcessName(ResponseData.ProcessModuleName);
            setSubProcessName(ResponseData.SubProcessModuleName);
            setOrgCreationDate(ResponseData.DateOfCreation);
          } else {
            setOrganizationId(0);
            setOrganizationName("");
            setClientName("");
            setProjectName("");
            setProcessName("");
            setSubProcessName("");
            setOrgCreationDate("");
          }
        };
        callAPI(url, params, successCallback, "POST");
      } else {
        setOrganizationId(0);
        setOrganizationName("");
        setClientName("");
        setProjectName("");
        setProcessName("");
        setSubProcessName("");
      }
    }, [onEdit]);

    const clear = () => {
      setOrganizationId(0);
      setClientName("");
      setClientNameErr(false);
      setProjectName("");
      setProjectNameErr(false);
      setProcessName("");
      setProcessNameErr(false);
      setSubProcessName("");
      setSubProcessNameErr(false);
      setOrganizationName("");
      setOrganizationNameErr(false);
      setOrgCreationDate("");
    };

    const clearOrganizationData = async () => {
      await clear();
      onClose();
    };

    useImperativeHandle(ref, () => ({
      clearOrganizationData,
    }));

    const handleSubmit = async (e: any) => {
      e.preventDefault();

      clientName.trim().length <= 0 && setClientNameErr(true);
      organizationName.trim().length <= 0 && setOrganizationNameErr(true);
      organizationName.trim().length > 50 && setOrganizationNameErr(true);
      processName.trim().length <= 0 && setProcessNameErr(true);
      projectName.trim().length <= 0 && setProjectNameErr(true);
      subProcessName.trim().length <= 0 && setSubProcessNameErr(true);
      if (
        !organizationNameErr &&
        !subProcessNameErr &&
        !processNameErr &&
        !clientNameErr &&
        !projectNameErr &&
        clientName.trim().length > 0 &&
        organizationName.trim().length > 0 &&
        organizationName.trim().length < 50 &&
        processName.trim().length > 0 &&
        projectName.trim().length > 0 &&
        subProcessName.trim().length > 0
      ) {
        onChangeLoader(true);
        const params = {
          OrganizationId: onEdit > 0 ? onEdit : 0,
          OrganizationName: organizationName.trim(),
          ClientModuleName: clientName.trim(),
          ProjectModuleName: projectName.trim(),
          ProcessModuleName: processName.trim(),
          SubProcessModuleName: subProcessName.trim(),
        };
        const url = `${process.env.pms_api_url}/organization/save`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(
              `Organization ${
                onEdit > 0 ? "Updated" : "created"
              }  successfully!`
            );
            clearOrganizationData();
            getOrgDetailsFunction?.();
            onClose();
            onDataFetch?.();
            onChangeLoader(false);
          } else {
            onChangeLoader(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    };

    const addMoreSubmit = async (e: any) => {
      e.preventDefault();

      clientName.trim().length <= 0 && setClientNameErr(true);
      organizationName.trim().length <= 0 && setOrganizationNameErr(true);
      organizationName.trim().length > 50 && setOrganizationNameErr(true);
      processName.trim().length <= 0 && setProcessNameErr(true);
      projectName.trim().length <= 0 && setProjectNameErr(true);
      subProcessName.trim().length <= 0 && setSubProcessNameErr(true);

      if (
        !organizationNameErr &&
        !subProcessNameErr &&
        !processNameErr &&
        !clientNameErr &&
        !projectNameErr &&
        clientName.trim().length > 0 &&
        organizationName.trim().length > 0 &&
        organizationName.trim().length < 50 &&
        processName.trim().length > 0 &&
        projectName.trim().length > 0 &&
        subProcessName.trim().length > 0
      ) {
        const params = {
          OrganizationId: onEdit > 0 ? onEdit : 0,
          OrganizationName: organizationName.trim(),
          ClientModuleName: clientName.trim(),
          ProjectModuleName: projectName.trim(),
          ProcessModuleName: processName.trim(),
          SubProcessModuleName: subProcessName.trim(),
        };
        const url = `${process.env.pms_api_url}/organization/save`;
        const successCallback = (
          ResponseData: null,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(
              `Organization ${
                onEdit > 0 ? "Updated" : "created"
              }  successfully!`
            );
            clearOrganizationData();
            getOrgDetailsFunction?.();
            onDataFetch?.();
          } else {
            onChangeLoader(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    };

    useEffect(() => {
      setClientName("Client");
      setProjectName("Project");
      setProcessName("Process");
      setSubProcessName("SubProcess");
    }, []);

    return (
      <form className="max-h-[78vh] overflow-y-auto">
        <div className="flex gap-[20px] flex-col p-[20px]">
          <TextField
            label={
              <span>
                Organization Name
                <span className="!text-defaultRed">&nbsp;*</span>
              </span>
            }
            fullWidth
            className="pt-1"
            value={organizationName?.trim().length <= 0 ? "" : organizationName}
            onChange={(e) => {
              setOrganizationName(e.target.value);
              setOrganizationNameErr(false);
            }}
            onBlur={(e) => {
              if (
                e.target.value.trim().length < 3 ||
                e.target.value.trim().length > 50
              ) {
                setOrganizationNameErr(true);
              }
            }}
            error={organizationNameErr}
            helperText={
              organizationNameErr &&
              organizationName?.trim().length > 0 &&
              organizationName?.trim().length < 3
                ? "Minimum 3 characters allowed."
                : organizationNameErr && organizationName?.trim().length > 50
                ? "Maximum 50 characters allowed."
                : organizationNameErr
                ? "This is a required field."
                : ""
            }
            margin="normal"
            variant="standard"
            sx={{ width: 570 }}
          />
        </div>
        <div className="moduleOrg px-5">
          <div className="flex moduleOrgHeader font-semibold justify-between items-center py-3">
            <h1 className="font-medium text-[18px]">Default Name</h1>
            <h1 className="font-medium text-[18px]">Display Name</h1>
          </div>
          <div className="flex moduleOrgHeader font-semibold justify-between items-center">
            <span className="font-medium text-[16px]">Clients</span>
            <div className="max-w-[230px]">
              <TextField
                fullWidth
                className="pt-1"
                value={clientName?.trim().length <= 0 ? "" : clientName}
                onChange={(e) => {
                  setClientName(e.target.value);
                  setClientNameErr(false);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim().length < 1) {
                    setClientNameErr(true);
                  }
                }}
                error={clientNameErr}
                helperText={clientNameErr ? "This is a required field." : ""}
                margin="normal"
                variant="standard"
                sx={{ width: 200 }}
              />
            </div>
          </div>
          <div className="flex moduleOrgHeader font-semibold justify-between items-center">
            <span className="font-medium text-[16px]">Project</span>
            <div className="max-w-[230px]">
              <TextField
                fullWidth
                className="pt-1"
                value={projectName?.trim().length <= 0 ? "" : projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setProjectNameErr(false);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim().length < 1) {
                    setProjectNameErr(true);
                  }
                }}
                error={projectNameErr}
                helperText={projectNameErr ? "This is a required field." : ""}
                margin="normal"
                variant="standard"
                sx={{ width: 200 }}
              />
            </div>
          </div>
          <div className="flex moduleOrgHeader font-semibold justify-between items-center">
            <span className="font-medium text-[16px]">Process</span>
            <div className="max-w-[230px]">
              <TextField
                fullWidth
                className="pt-1"
                value={processName?.trim().length <= 0 ? "" : processName}
                onChange={(e) => {
                  setProcessName(e.target.value);
                  setProcessNameErr(false);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim().length < 1) {
                    setProcessNameErr(true);
                  }
                }}
                error={processNameErr}
                helperText={processNameErr ? "This is a required field." : ""}
                margin="normal"
                variant="standard"
                sx={{ width: 200 }}
              />
            </div>
          </div>
          <div className="flex moduleOrgHeader font-semibold justify-between items-center">
            <span className="font-medium text-[16px]">SubProcess</span>
            <div className="max-w-[230px]">
              <TextField
                fullWidth
                className="pt-1"
                value={subProcessName?.trim().length <= 0 ? "" : subProcessName}
                onChange={(e) => {
                  setSubProcessName(e.target.value);
                  setSubProcessNameErr(false);
                }}
                onBlur={(e) => {
                  if (e.target.value.trim().length < 1) {
                    setSubProcessNameErr(true);
                  }
                }}
                error={subProcessNameErr}
                helperText={
                  subProcessNameErr ? "This is a required field." : ""
                }
                margin="normal"
                variant="standard"
                sx={{ width: 200 }}
              />
            </div>
          </div>
        </div>

        {onEdit > 0 && (
          <div className="flex flex-col my-5 px-5">
            <TextField
              label="Date of Creation"
              sx={{ mt: "-5px" }}
              fullWidth
              value={
                orgCreationDate?.trim().length <= 0 || orgCreationDate === null
                  ? ""
                  : orgCreationDate
              }
              onChange={() => {}}
              margin="normal"
              variant="standard"
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
        )}

        <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
          <>
            {onEdit > 0 ? (
              <Button
                variant="outlined"
                className="rounded-[4px] !h-[36px] !text-secondary"
                onClick={() => clearOrganizationData()}
              >
                Close
              </Button>
            ) : (
              <Button
                variant="outlined"
                className="rounded-[4px] !h-[36px] !text-secondary cursor-pointer"
                onClick={addMoreSubmit}
              >
                Add More
              </Button>
            )}
            <Button
              variant="contained"
              className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
              type="submit"
              onClick={handleSubmit}
            >
              {onEdit > 0 ? "Save" : "Create Organization"}
            </Button>
          </>
        </div>
      </form>
    );
  }
);

export default OrganizationContent;
