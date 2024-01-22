/* eslint-disable react/display-name */
import { callAPI } from "@/utils/API/callAPI";
import { Delete, Edit } from "@mui/icons-material";
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  createFilterOptions,
} from "@mui/material";
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

type Options = {
  label: string;
  value: string;
};

const filter = createFilterOptions<Options>();

const ProjectContent = forwardRef<
  ProjectContentRef,
  {
    tab: string;
    onEdit: any;
    onOpen: boolean;
    onClose: () => void;
    projectData: any;
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
      projectData,
      onDataFetch,
      onValuesChange,
      onChangeLoader,
    },
    ref
  ) => {
    const [textFieldOpen, setTextFieldOpen] = useState(false);
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

    const [projectValueError, setProjectValueError] = useState(false);
    const [projectValueErrText, setProjectValueErrText] = useState<string>(
      "This field is required."
    );
    const [projectDrpdown, setProjectDrpdown] = useState([]);
    const [projectValue, setProjectValue] = useState<any>(0);
    const [projectName, setProjectName] = useState("");
    const [projectNameError, setProjectNameError] = useState(false);
    const [projectNameErrText, setProjectNameErrText] = useState<string>(
      "This field is required."
    );
    const [hoveredItem, setHoveredItem] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [open, toggleOpen] = useState(false);

    useEffect(() => {
      const getData = async () => {
        const params = {};
        const url = `${process.env.pms_api_url}/client/getdropdown`;
        const successCallback = (
          ResponseData: any,
          error: any,
          ResponseStatus: any
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
            error: any,
            ResponseStatus: any
          ) => {
            if (ResponseStatus === "Success" && error === false) {
              setClient(ResponseData.ClientId);
              setTypeOfWorkName(
                ResponseData.WorkTypeIds === null
                  ? []
                  : ResponseData.WorkTypeIds
              );
              setProjectValue(ResponseData.ProjectId);
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
        error: any,
        ResponseStatus: any
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

    const getData = async () => {
      const params = {
        ClientId: client,
        SelectAll: true,
      };
      const url = `${process.env.pms_api_url}/project/getdropdown`;
      const successCallback = (
        ResponseData: any,
        error: any,
        ResponseStatus: any
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setProjectDrpdown(ResponseData.List);
          onEdit == 0 &&
            setProjectValue(
              ResponseData.List.length === 1 ? ResponseData.List[0].value : 0
            );
          onEdit == 0 &&
            setProjectValueError(
              ResponseData.List.length === 1 ? false : false
            );
        }
      };
      callAPI(url, params, successCallback, "POST");
    };

    useEffect(() => {
      onOpen && client > 0 && getWorktypeData();
      onOpen && client > 0 && getData();
    }, [client, onOpen]);

    const clearAllFields = () => {
      setClient(0);
      setClientError(false);
      setTypeOfWorkDropdown([]);
      setTypeOfWorkName([]);
      setTypeOfWorks([]);
      setTypeOfWorkNameError(false);
      setSubProject("");
      setTextFieldOpen(false);

      setProjectName("");
      setProjectNameError(false);
      setProjectNameErrText("");
      setProjectValue(0);
      setProjectValueError(false);
      setProjectDrpdown([]);
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
      projectValue <= 0 && setProjectValueError(true);

      if (
        !clientError &&
        client > 0 &&
        !typeOfWorkNameError &&
        typeOfWorkName.length > 0 &&
        !projectNameError &&
        projectValue > 0 &&
        subProject !== null &&
        subProject.trim().length > 0
      ) {
        onChangeLoader(true);
        const params = {
          SubProjectId: subProjectId,
          SubProjectName: subProject.trim(),
          ProjectId: projectValue,
          WorkTypeIds: typeOfWorkName,
        };
        const url = `${process.env.pms_api_url}/project/savesubproject`;
        const successCallback = async (
          ResponseData: any,
          error: any,
          ResponseStatus: any
        ) => {
          if (ResponseStatus === "Success" && error === false) {
            toast.success(
              `Project ${onEdit ? "Updated" : "created"} successfully.`
            );
            await clearAllFields();
            await onDataFetch();
            onChangeLoader(false);
            {
              !addMoreClicked && onClose();
            }
          } else {
            onChangeLoader(false);
          }
        };
        callAPI(url, params, successCallback, "POST");
      } else if (client > 0 && typeOfWorks.length > 0 && projectValue > 0) {
        handleAddProject();
      }
    };

    const handleAddProject = async () => {
      client <= 0 && setClientError(true);
      typeOfWorks.length <= 0 && setTypeOfWorkNameError(true);
      projectName.trim().length <= 0 && setProjectNameError(true);

      if (
        !clientError &&
        client !== 0 &&
        !typeOfWorkNameError &&
        typeOfWorkName.length > 0 &&
        !projectNameError &&
        projectName !== ""
      ) {
        const params = {
          ClientId: client,
          WorkTypeIds: typeOfWorkName,
          ProjectId: projectValue !== 0 ? projectValue : null,
          ProjectName: projectName.trim(),
        };
        const url = `${process.env.pms_api_url}/project/saveproject`;
        const successCallback = async (
          ResponseData: any,
          error: any,
          ResponseStatus: any
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
            handleClose();
            clearAllFields();
            onDataFetch();
            onClose();
          }
        };
        callAPI(url, params, successCallback, "POST");
      }
    };

    const handleClose = () => {
      toggleOpen(false);
      setEditDialogOpen(false);
    };

    const handleProjectName = (e: any) => {
      if (e.target.value === "" || e.target.value.trim().length <= 0) {
        setProjectName(e.target.value);
        setProjectNameError(true);
        setProjectNameErrText("This is required field.");
      } else {
        setProjectName(e.target.value);
        setProjectNameError(false);
        setProjectNameErrText("This field is required.");
      }
    };

    const handleProject = (e: React.SyntheticEvent, value: any) => {
      if (value !== null) {
        if (isNaN(parseInt(value.value))) {
          toggleOpen(true);
          setProjectName(value.value);
          setProjectValue(null);
        }
        if (value !== null && !isNaN(parseInt(value.value))) {
          const selectedValue = value.value;
          setProjectValue(selectedValue);
          setProjectValueError(false);
          setProjectValueErrText("");
        } else {
          setProjectValue(0);
        }
      }
    };

    const handleValueChange = (isDeleteOpen: any, selectedRowId: boolean) => {
      onValuesChange(isDeleteOpen, selectedRowId);
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

            <Autocomplete
              className={`${projectValueError ? "errorAutocomplete" : ""}`}
              limitTags={2}
              id="checkboxes-tags-demo"
              options={projectDrpdown}
              value={
                projectValue !== 0
                  ? projectDrpdown.find(
                      (option: any) => option.value === projectValue
                    ) || null
                  : null
              }
              getOptionLabel={(option: any) => option.label}
              onChange={handleProject}
              filterOptions={(options: any, params: any) => {
                const filtered = filter(options, params);
                if (params.inputValue !== "") {
                  const isExistingProject = options.some(
                    (option: any) =>
                      option.label.toLowerCase() ===
                      params.inputValue.toLowerCase()
                  );

                  if (!isExistingProject && !onEdit) {
                    filtered.push({
                      label: `Add "${params.inputValue}"`,
                      value: params.inputValue,
                    });
                  }
                }

                return filtered;
              }}
              renderOption={(props: any, option: any) => {
                const isItemHovered = option === hoveredItem;

                const handleEditClick = () => {
                  setProjectName(option.label);
                  setEditDialogOpen(true);
                };

                const handleDeleteClick = () => {
                  handleValueChange(true, option.value);
                };
                return (
                  <li
                    {...props}
                    onMouseEnter={() => setHoveredItem(option)}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {option.label}
                    {isItemHovered && (
                      <div className="flex justify-center items-center">
                        <span
                          className="absolute right-3"
                          onClick={handleDeleteClick}
                        >
                          <Delete />
                        </span>
                        <span
                          className="absolute right-10 pt-1"
                          onClick={handleEditClick}
                        >
                          <Edit />
                        </span>
                      </div>
                    )}
                  </li>
                );
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <span>
                      Project
                      <span className="text-defaultRed">&nbsp;*</span>
                    </span>
                  }
                  placeholder="Please Select..."
                  variant="standard"
                />
              )}
            />
            {projectValueError && (
              <span className="text-[#D32F2F] text-[12px] -mt-3">
                {projectValueErrText}
              </span>
            )}

            {!textFieldOpen && (
              <TextField
                value={subProject}
                id="standard-basic"
                label="Sub-project Name"
                placeholder="Enter Sub-Project Name"
                variant="standard"
                onChange={(e) => setSubProject(e.target.value)}
              />
            )}
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
        <Dialog open={editDialogOpen || open} onClose={handleClose}>
          <DialogTitle>
            {editDialogOpen ? "Edit Project" : "Add a new Project"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {editDialogOpen
                ? "Did you change any project in list? Please, edit it!"
                : "Did you miss any project in list? Please, add it!"}
            </DialogContentText>
            <TextField
              className="w-full mt-2"
              value={projectName}
              error={projectNameError}
              helperText={projectNameError && projectNameErrText}
              id="standard-basic"
              label="Project"
              placeholder={
                editDialogOpen ? "Edit a project" : "Add new project"
              }
              variant="standard"
              onChange={handleProjectName}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleClose}
              variant="outlined"
              className="rounded-[4px] !h-[36px]"
            >
              Close
            </Button>
            <Button
              variant="contained"
              className="rounded-[4px] !h-[36px] !bg-[#0592c6]"
              type="button"
              onClick={handleAddProject}
            >
              {editDialogOpen ? "Save" : "Add"}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  }
);

export default ProjectContent;
