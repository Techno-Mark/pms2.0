import React, { useRef, useState } from "react";
import "next-ts-lib/dist/index.css";
import ClientContent, { ClientContentRef } from "./content/ClientContent";
import PermissionsContent, {
  PermissionContentRef,
} from "./content/PermissionsContent";
import ProjectContent, { ProjectContentRef } from "./content/ProjectContent";
import StatusContent, { StatusContenRef } from "./content/StatusContent";
import UserContent, { UserContentRef } from "./content/UserContent";
import ProcessContent, { ProcessContentRef } from "./content/ProcessContent";
import OrganizationContent, {
  OrganizationContentRef,
} from "./content/OrganizationContent";
import GroupContent, { GroupContentRef } from "./content/GroupContent";
import axios from "axios";
import OverLay from "@/components/common/OverLay";
import { toast } from "react-toastify";
import { Close } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";
import { DrawerProps } from "@/utils/Types/settingTypes";
import NatureOfErrorContent, { NatureOfErrorContentRef } from "./content/NatureOfErrorContent";

const Drawer = ({
  onOpen,
  onClose,
  tab,
  onEdit,
  onUserDataFetch,
  onDataFetch,
  getPermissionDropdown,
  getOrgDetailsFunction,
}: DrawerProps) => {
  const childRef = useRef<UserContentRef>(null);
  const childRefOrg = useRef<OrganizationContentRef>(null);
  const childRefGroup = useRef<GroupContentRef>(null);
  const childRefNatureOfError = useRef<NatureOfErrorContentRef>(null);
  const projectRef = useRef<ProjectContentRef>(null);
  const clientRef = useRef<ClientContentRef>(null);
  const childRefStatus = useRef<StatusContenRef>(null);
  const permissionRef = useRef<PermissionContentRef>(null);
  const [drawerOverlay, setDrawerOverlay] = useState(false);

  const childRefProcess = useRef<ProcessContentRef>(null);

  const [isDeleteOpenProject, setIsDeleteOpenProject] = useState(false);
  const [isDeleteOpenProcess, setIsDeleteOpenProcess] = useState(false);
  const [selectedRowIdProject, setSelectedRowIdProject] = useState<
    number | null
  >(null);
  const [selectedRowIdProcess, setSelectedRowIdProcess] = useState<
    number | null
  >(null);

  const handleClose = () => {
    onClose();

    if (childRefOrg.current) {
      childRefOrg.current.clearOrganizationData();
    }
    if (childRefStatus.current) {
      childRefStatus.current.clearStatusData();
    }
    if (childRef.current) {
      childRef.current.clearAllData();
    }
    if (childRefGroup.current) {
      childRefGroup.current.groupDataValue();
    }
    if (projectRef.current) {
      projectRef.current.clearAllData();
    }
    if (clientRef.current) {
      clientRef.current.clearAllData();
    }
    if (permissionRef.current) {
      permissionRef.current.clearAllData();
    }
    if (childRefProcess.current) {
      childRefProcess.current.ProcessDataValue();
    }
    if (childRefNatureOfError.current) {
      childRefNatureOfError.current.NatureOfErrorDataValue();
    }
  };

  const handleDeleteRowProject = async () => {
    if (selectedRowIdProject) {
      const token = await localStorage.getItem("token");
      const org_Token = await localStorage.getItem("Org_Token");

      try {
        const response = await axios.post(
          `${process.env.pms_api_url}/Project/Delete`,
          {
            ProjectId: selectedRowIdProject,
          },
          {
            headers: {
              Authorization: `bearer ${token}`,
              org_Token,
            },
          }
        );

        if (response.status === 200) {
          if (response.data.ResponseStatus === "Success") {
            toast.success("Project has been deleted successfully!");
            onClose();
            projectRef?.current?.clearAllData();
            onDataFetch?.();
          } else {
            const data = response.data.Message;
            if (data === null) {
              toast("Please try again later.");
            } else {
              toast(data);
            }
          }
        } else {
          const data = response.data.Message;
          if (data === null) {
            toast("Please try again.");
          } else {
            toast(data);
          }
        }
      } catch (error) {
        console.error(error);
      }
      setIsDeleteOpenProject(false);
    }
  };

  const handleDeleteRowProcess = async () => {
    if (selectedRowIdProcess) {
      const token = await localStorage.getItem("token");
      const org_Token = await localStorage.getItem("Org_Token");
      try {
        const prams = {
          ProcessId: selectedRowIdProcess,
        };
        const response = await axios.post(
          `${process.env.pms_api_url}/process/Delete`,
          prams,
          {
            headers: {
              Authorization: `bearer ${token}`,
              org_token: org_Token,
            },
          }
        );
        if (response.status === 200) {
          if (response.data.ResponseStatus === "Success") {
            toast.success("Process has been deleted successfully!");
            if (childRefProcess.current) {
              childRefProcess.current.ProcessDataValue();
            }
            onClose();
            childRefProcess?.current?.ProcessDataValue();
            onDataFetch?.();
          } else {
            const data = response.data.Message;
            if (data === null) {
              toast("Please try again later.");
            } else {
              toast(data);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
      setIsDeleteOpenProcess(false);
    }
  };

  const closeModalProject = () => {
    setIsDeleteOpenProject(false);
  };

  const closeModalProcess = () => {
    setIsDeleteOpenProcess(false);
  };

  const handleProjectChildValuesChange = (
    childValue1: React.SetStateAction<number | null>,
    childValue2: boolean | ((prevState: boolean) => boolean)
  ) => {
    setSelectedRowIdProject(childValue1);
    setIsDeleteOpenProject(childValue2);
  };

  const handleProcessChildValuesChange = (
    childValue1: React.SetStateAction<number | null>,
    childValue2: boolean | ((prevState: boolean) => boolean)
  ) => {
    setSelectedRowIdProcess(childValue1);
    setIsDeleteOpenProcess(childValue2);
  };

  return (
    <>
      <div
        className={`fixed right-0 top-0 z-30 h-screen overflow-y-auto w-[40%] border border-lightSilver bg-pureWhite transform  ${
          onOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out overflow-x-hidden`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">
            {onEdit ? "Edit" : "Create"} {tab === "Permission" ? "Role" : tab === "ErrorDetails" ? "Error Details" : tab}
          </span>
          <Tooltip title="Close" placement="left" arrow>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Tooltip>
        </div>

        {tab === "Client" && (
          <ClientContent
            onOpen={onOpen}
            onEdit={onEdit}
            onClose={onClose}
            onDataFetch={onDataFetch}
            ref={clientRef}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Permission" && (
          <PermissionsContent
            onClose={onClose}
            ref={permissionRef}
            getPermissionDropdown={getPermissionDropdown}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Project" && (
          <ProjectContent
            onOpen={onOpen}
            ref={projectRef}
            onEdit={onEdit}
            onDataFetch={onDataFetch}
            onClose={onClose}
          />
        )}
        {tab === "Status" && (
          <StatusContent
            onEdit={onEdit}
            onClose={onClose}
            ref={childRefStatus}
            onDataFetch={onDataFetch}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
        {tab === "User" && (
          <UserContent
            onOpen={onOpen}
            onEdit={onEdit}
            onClose={onClose}
            ref={childRef}
            onUserDataFetch={onUserDataFetch}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Process" && (
          <ProcessContent
            onOpen={onOpen}
            onEdit={onEdit}
            onClose={onClose}
            ref={childRefProcess}
            onDataFetch={onDataFetch}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
            onValuesChange={handleProcessChildValuesChange}
          />
        )}
        {tab === "Organization" && (
          <OrganizationContent
            onEdit={onEdit}
            onClose={onClose}
            onDataFetch={onDataFetch}
            ref={childRefOrg}
            getOrgDetailsFunction={getOrgDetailsFunction}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Group" && (
          <GroupContent
            onOpen={onOpen}
            onEdit={onEdit}
            onClose={onClose}
            ref={childRefGroup}
            onDataFetch={onDataFetch}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
        {tab === "ErrorDetails" && (
          <NatureOfErrorContent
            onOpen={onOpen}
            onEdit={onEdit}
            onClose={onClose}
            ref={childRefNatureOfError}
            onDataFetch={onDataFetch}
            onChangeLoader={(e: boolean) => setDrawerOverlay(e)}
          />
        )}
      </div>

      {isDeleteOpenProject && tab === "Project" && (
        <DeleteDialog
          isOpen={isDeleteOpenProject}
          onClose={closeModalProject}
          onActionClick={handleDeleteRowProject}
          Title={"Delete Project"}
          firstContent={"Are you sure you want to delete Project?"}
          secondContent={
            "If you delete the project, you will permanently lose project and project related data."
          }
        />
      )}

      {isDeleteOpenProcess && tab === "Process" && (
        <DeleteDialog
          isOpen={isDeleteOpenProcess}
          onClose={closeModalProcess}
          onActionClick={handleDeleteRowProcess}
          Title={"Delete Project"}
          firstContent={"Are you sure you want to delete Project?"}
          secondContent={
            "If you delete the project, you will permanently lose project and project related data."
          }
        />
      )}
      {drawerOverlay ? <OverLay /> : ""}
    </>
  );
};

export default Drawer;
