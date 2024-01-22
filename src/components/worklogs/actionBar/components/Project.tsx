import React, { useState } from "react";
import { toast } from "react-toastify";
import { InputBase, List, Popover } from "@mui/material";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import ProjectIcon from "@/assets/icons/worklogs/ProjectIcon";
import SearchIcon from "@/assets/icons/SearchIcon";
import { callAPI } from "@/utils/API/callAPI";

const Project = ({
  selectedRowIds,
  getWorkItemList,
  projectDropdownData,
  getOverLay,
}: any) => {
  const [projectSearchQuery, setprojectSearchQuery] = useState("");

  const [anchorElProject, setAnchorElProject] =
    React.useState<HTMLButtonElement | null>(null);

  const handleClickProject = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElProject(event.currentTarget);
  };

  const handleCloseProject = () => {
    setAnchorElProject(null);
  };

  const openProject = Boolean(anchorElProject);
  const idProject = openProject ? "simple-popover" : undefined;

  const handleProjectSearchChange = (event: any) => {
    setprojectSearchQuery(event.target.value);
  };

  const filteredProject = projectDropdownData?.filter((project: any) =>
    project.label.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  const handleOptionProject = (id: any) => {
    updateProject(selectedRowIds, id);
    handleCloseProject();
  };

  const updateProject = async (id: number[], processId: number) => {
    getOverLay(true);
    const params = {
      workitemIds: id,
      ProjectId: processId,
    };
    const url = `${process.env.worklog_api_url}/workitem/bulkupdateworkitemproject`;
    const successCallback = (
      ResponseData: any,
      error: any,
      ResponseStatus: any
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        toast.success("Project has been updated successfully.");
        getWorkItemList();
        getOverLay(false);
      } else {
        getOverLay(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  return (
    <div>
      <ColorToolTip title="Project" arrow>
        <span aria-describedby={idProject} onClick={handleClickProject}>
          <ProjectIcon />
        </span>
      </ColorToolTip>

      {/* Process Project */}
      <Popover
        id={idProject}
        open={openProject}
        anchorEl={anchorElProject}
        onClose={handleCloseProject}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <nav className="!w-52">
          <div className="mr-4 ml-4 mt-4">
            <div
              className="flex items-center h-10 rounded-md pl-2 flex-row"
              style={{
                border: "1px solid lightgray",
              }}
            >
              <span className="mr-2">
                <SearchIcon />
              </span>
              <span>
                <InputBase
                  placeholder="Search"
                  inputProps={{ "aria-label": "search" }}
                  value={projectSearchQuery}
                  onChange={handleProjectSearchChange}
                  style={{ fontSize: "13px" }}
                />
              </span>
            </div>
          </div>
          <List>
            {projectDropdownData.length === 0 ? (
              <span className="flex flex-col py-2 px-4  text-sm">
                No Data Available
              </span>
            ) : (
              filteredProject.map((project: any) => {
                return (
                  <span
                    key={project.value}
                    className="flex flex-col py-2 px-4 hover:bg-gray-100 text-sm"
                  >
                    <span
                      className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                      onClick={() => handleOptionProject(project.value)}
                    >
                      <span className="pt-[0.8px]">{project.label}</span>
                    </span>
                  </span>
                );
              })
            )}
          </List>
        </nav>
      </Popover>
    </div>
  );
};

export default Project;
