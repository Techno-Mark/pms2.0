import { callAPI } from "@/utils/API/callAPI";
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
    tab: string;
    onEdit: any;
    onOpen: boolean;
    onClose: () => void;
    onDataFetch: any;
    onValuesChange: any;
    onChangeLoader: any;
  }
>(
  (
    {
      tab,
      onEdit,
      onClose,
      onOpen,
      onDataFetch,
      onValuesChange,
      onChangeLoader,
    },
    ref
  ) => {
    const [addMoreClicked, setAddMoreClicked] = useState(false);

    const [client, setClient] = useState(0);
    const [clientError, setClientError] = useState(false);
    const [clientDrpdown, setClientDrpdown] = useState([]);

    const [typeOfWorks, setTypeOfWorks] = useState<any[]>([]);
    const [typeOfWorkName, setTypeOfWorkName] = useState<any[]>([]);
    const [typeOfWorkDropdown, setTypeOfWorkDropdown] = useState<any[]>([]);
    const [typeOfWorkNameError, setTypeOfWorkNameError] = useState(false);

    const [subProject, setSubProject] = useState("");
    const [subProjectId, setSubProjectId] = useState(null);

    const [projectValue, setProjectValue] = useState<any>(0);
    const [projectName, setProjectName] = useState("");
    const [projectNameError, setProjectNameError] = useState(false);

    useEffect(() => {
      const getData = async () => {
        const params = {};
        const url = `${process.env.pms_api_url}/client/getdropdown`;
        const successCallback = (
          ResponseData: any,
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
      if (onEdit) {
        const getData = async () => {
          const params = {
            ProjectId: onEdit,
          };
          const url = `${process.env.pms_api_url}/project/getbyid`;
          const successCallback = (
            ResponseData: any,
            error: boolean,
            ResponseStatus: string
          ) => {
            if (ResponseStatus === "Success" && error === false) {
              setClient(ResponseData.ClientId);
              setTypeOfWorkName(
                ResponseData.WorkTypeIds === null
                  ? []
                  : ResponseData.WorkTypeIds
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
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setTypeOfWorkDropdown(ResponseData);
          onEdit > 0 &&
            typeOfWorkName.length > 0 &&
            setTypeOfWorks(
              typeOfWorkName.length > 0
                ? ResponseData.filter((client: any) =>
                    typeOfWorkName.includes(client.value)
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
          ResponseData: any,
          error: boolean,
          ResponseStatus: string
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(
              `Project ${
                projectValue === 0 ||
                projectValue === null ||
                projectValue === "" ||
                projectValue === undefined
                  ? "created"
                  : "Updated"
              } successfully.`
            );
            clearAllFields();
            onDataFetch();
            onClose();
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
              value={clientDrpdown.find((i: any) => i.value === client) || null}
              onChange={(e, value: any) => {
                value && setClient(value.value);
                value && setTypeOfWorks([]);
                value && setTypeOfWorkName([]);
              }}
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
                  onBlur={(e) => {
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
              getOptionLabel={(option: any) => option.label}
              onChange={(e: any, data: any) => {
                if (data.some((d: any) => d.value === -1)) {
                  setTypeOfWorks(
                    typeOfWorkDropdown.filter((d: any) => d.value !== -1)
                  );
                  setTypeOfWorkName(
                    typeOfWorkDropdown
                      .filter((d: any) => d.value !== -1)
                      .map((d: any) => d.value)
                  );
                } else {
                  setTypeOfWorks(data);
                  setTypeOfWorkName(data.map((d: any) => d.value));
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
                  onBlur={(e) => {
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
              onBlur={(e: any) => {
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
            {onEdit ? (
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
              >
                Add More
              </Button>
            )}
            <Button
              variant="contained"
              className="rounded-[4px] !h-[36px] !mx-6 !bg-secondary cursor-pointer"
              type="submit"
            >
              {onEdit ? "Save" : `Create Project`}
            </Button>
          </div>
        </form>
      </>
    );
  }
);

export default ProjectContent;
