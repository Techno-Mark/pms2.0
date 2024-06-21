import { callAPI } from "@/utils/API/callAPI";
import { ProjectGetByIdList } from "@/utils/Types/settingTypes";
import { LabelValue } from "@/utils/Types/types";
import { Autocomplete, Button, TextField } from "@mui/material";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { toast } from "react-toastify";

export interface ProjectContentRef {
  clearAllData: () => void;
}

const ProjectContent = forwardRef<
  ProjectContentRef,
  {
    onEdit: number;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
  }
>(({ onEdit, onClose, onOpen, onDataFetch }, ref) => {
  const [addMoreClicked, setAddMoreClicked] = useState(false);

  const [client, setClient] = useState(0);
  const [clientError, setClientError] = useState(false);
  const [clientDrpdown, setClientDrpdown] = useState<LabelValue[]>([]);

  const [typeOfWorks, setTypeOfWorks] = useState<LabelValue[]>([]);
  const [typeOfWorkName, setTypeOfWorkName] = useState<number[]>([]);
  const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState<LabelValue[]>(
    []
  );
  const [typeOfWorkNameError, setTypeOfWorkNameError] = useState(false);

  const [subProject, setSubProject] = useState("");
  const [subProjectId, setSubProjectId] = useState<number | null>(null);

  const [projectValue, setProjectValue] = useState<number>(0);
  const [projectName, setProjectName] = useState("");
  const [projectNameError, setProjectNameError] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const params = {};
      const url = `${process.env.pms_api_url}/client/getdropdown`;
      const successCallback = (
        ResponseData: LabelValue[],
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setClientDrpdown(ResponseData);
        } else {
          setClientDrpdown([]);
        }
      };
      callAPI(url, params, successCallback, "GET");
    };

    onOpen && getData();
  }, [onOpen]);

  useEffect(() => {
    if (onEdit > 0) {
      const getData = async () => {
        const params = {
          ProjectId: onEdit,
        };
        const url = `${process.env.pms_api_url}/project/getbyid`;
        const successCallback = (
          ResponseData: ProjectGetByIdList,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            setClient(ResponseData.ClientId);
            setTypeOfWorkName(
              ResponseData.WorkTypeIds === null ? [] : ResponseData.WorkTypeIds
            );
            setProjectValue(ResponseData.ProjectId);
            setProjectName(ResponseData.ProjectName);
            setSubProject(ResponseData.SubProjectName);
            setSubProjectId(ResponseData.SubProjectId);
          }
        };
        callAPI(url, params, successCallback, "POST");
      };

      getData();
    }
  }, [onEdit]);

  const getWorktypeData = async () => {
    const params = {
      clientId: client,
    };
    const url = `${process.env.pms_api_url}/WorkType/GetDropdown`;
    const successCallback = (
      ResponseData: LabelValue[],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTypeOfWorkDropdown(ResponseData);
        onEdit > 0 &&
          typeOfWorkName.length > 0 &&
          setTypeOfWorks(
            typeOfWorkName.length > 0
              ? ResponseData.filter((tfw: LabelValue) =>
                  typeOfWorkName.includes(tfw.value)
                )
              : []
          );
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    onOpen && client > 0 && getWorktypeData();
  }, [client, onOpen, typeOfWorkName]);

  const clearAllFields = () => {
    setClient(0);
    setClientError(false);
    setTypeOfWorkDropdown([]);
    setTypeOfWorkName([]);
    setTypeOfWorks([]);
    setTypeOfWorkNameError(false);
    setSubProject("");

    setProjectName("");
    setProjectNameError(false);
    setProjectValue(0);
  };

  const clearAllData = async () => {
    onClose();
    setAddMoreClicked(false);
    await clearAllFields();
  };

  useImperativeHandle(ref, () => ({
    clearAllData,
  }));

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    client <= 0 && setClientError(true);
    typeOfWorks.length <= 0 && setTypeOfWorkNameError(true);
    projectName.toString().trim().length <= 0 && setProjectNameError(true);

    if (
      !clientError &&
      client !== 0 &&
      !typeOfWorkNameError &&
      typeOfWorkName.length > 0 &&
      !projectNameError &&
      projectName.trim().length > 0
    ) {
      const params = {
        ClientId: client,
        WorkTypeIds: typeOfWorkName,
        ProjectId: projectValue !== 0 ? projectValue : null,
        ProjectName: projectName.toString().trim(),
      };
      const url = `${process.env.pms_api_url}/project/saveproject`;
      const successCallback = async (
        ResponseData: null,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            `Project ${
              projectValue === 0 ||
              projectValue === null ||
              projectValue === undefined
                ? "created"
                : "Updated"
            } successfully.`
          );
          clearAllFields();
          onDataFetch?.();
          !addMoreClicked && onClose();
        }
      };
      callAPI(url, params, successCallback, "POST");
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex gap-[18px] flex-col p-[20px] max-h-[78.5vh]">
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={clientDrpdown}
            value={
              clientDrpdown.find((i: LabelValue) => i.value === client) || null
            }
            onChange={(e, value: LabelValue | null) => {
              value && setClient(value.value);
              value && setTypeOfWorks([]);
              value && setTypeOfWorkName([]);
            }}
            disabled={onEdit > 0}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                label={
                  <span>
                    Client Name
                    <span className="text-defaultRed">&nbsp;*</span>
                  </span>
                }
                error={clientError}
                onBlur={() => {
                  if (client > 0) {
                    setClientError(false);
                  }
                }}
                helperText={clientError ? "This is a required field." : ""}
              />
            )}
          />
          <Autocomplete
            multiple
            id="tags-standard"
            options={
              typeOfWorkDropdown.length === typeOfWorks.length
                ? []
                : typeOfWorkDropdown.filter(
                    (option) =>
                      !typeOfWorks.find(
                        (typeOfWork) => typeOfWork.value === option.value
                      )
                  )
            }
            getOptionLabel={(option: LabelValue) => option.label}
            onChange={(e, data: LabelValue[]) => {
              if (data.some((d: LabelValue) => d.value === -1)) {
                setTypeOfWorks(
                  typeOfWorkDropdown.filter((d: LabelValue) => d.value !== -1)
                );
                setTypeOfWorkName(
                  typeOfWorkDropdown
                    .filter((d: LabelValue) => d.value !== -1)
                    .map((d: LabelValue) => d.value)
                );
              } else {
                setTypeOfWorks(data);
                setTypeOfWorkName(data.map((d: LabelValue) => d.value));
              }
            }}
            value={typeOfWorks}
            renderInput={(params: any) => (
              <TextField
                {...params}
                variant="standard"
                label={
                  <span>
                    Type Of Work
                    <span className="text-defaultRed">&nbsp;*</span>
                  </span>
                }
                error={typeOfWorkNameError}
                onBlur={() => {
                  if (typeOfWorks.length > 0) {
                    setTypeOfWorkNameError(false);
                  }
                }}
                helperText={
                  typeOfWorkNameError ? "This is a required field." : ""
                }
              />
            )}
          />

          <TextField
            label={
              <span>
                Project
                <span className="!text-defaultRed">&nbsp;*</span>
              </span>
            }
            fullWidth
            value={projectName?.trim().length <= 0 ? "" : projectName}
            onChange={(e) => {
              setProjectName(e.target.value);
              setProjectNameError(false);
            }}
            onBlur={(e) => {
              if (
                e.target.value.trim().length <= 0 ||
                e.target.value.trim().length > 50
              ) {
                setProjectNameError(true);
              }
            }}
            error={projectNameError}
            helperText={
              projectNameError && projectName?.trim().length > 50
                ? "Maximum 50 characters allowed."
                : projectNameError
                ? "This is a required field."
                : ""
            }
            margin="normal"
            variant="standard"
            autoComplete="off"
            sx={{ marginTop: "-3px" }}
          />

          {/* {!textFieldOpen && (
              <TextField
                value={subProject}
                id="standard-basic"
                label="Sub-project Name"
                placeholder="Enter Sub-Project Name"
                variant="standard"
                onChange={(e) => setSubProject(e.target.value)}
              />
            )} */}
        </div>

        <div className="flex justify-end fixed w-full bottom-0 py-[15px] bg-pureWhite border-t border-lightSilver">
          {onEdit > 0 ? (
            <Button
              variant="outlined"
              className="rounded-[4px] !h-[36px] !text-secondary"
              onClick={clearAllData}
            >
              Close
            </Button>
          ) : (
            <Button
              variant="outlined"
              className="rounded-[4px] !h-[36px] !text-secondary cursor-pointer"
              onClick={() => setAddMoreClicked(true)}
              type="submit"
            >
              Add More
            </Button>
          )}
          <Button
            variant="contained"
            className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
            type="submit"
          >
            {onEdit > 0 ? "Save" : `Create Project`}
          </Button>
        </div>
      </form>
    </>
  );
});

export default ProjectContent;
