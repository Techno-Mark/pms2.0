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

const Drawer = ({
  onOpen,
  onClose,
  tab,
  onEdit,
  userData,
  orgData,
  onUserDataFetch,
  projectData,
  processData,
  onDataFetch,
  clientData,
  groupData,
  getPermissionDropdown,
  onRefresh,
  statusData,
  getOrgDetailsFunction,
}: any) => {
  const childRef = useRef<UserContentRef>(null);
  const childRefOrg = useRef<OrganizationContentRef>(null);
  const childRefGroup = useRef<GroupContentRef>(null);
  const projectRef = useRef<ProjectContentRef | any>(null);
  const clientRef = useRef<ClientContentRef>(null);
  const childRefStatus = useRef<StatusContenRef>(null);
  const permissionRef = useRef<PermissionContentRef>(null);
  const [drawerOverlay, setDrawerOverlay] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const childRefProcess = useRef<ProcessContentRef | any>(null);

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
            projectRef.current.clearAllData();
            onDataFetch();
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
            childRefProcess.current.ProcessDataValue();
            onDataFetch();
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
        } transition-transform duration-300 ease-in-out`}
      >
        <div className="flex p-[20px] justify-between items-center bg-whiteSmoke border-b border-lightSilver">
          <span className="text-pureBlack text-lg font-medium">
            {onEdit ? "Edit" : "Create"} {tab === "Permission" ? "Role" : tab}
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
            tab={tab}
            onEdit={onEdit}
            onClose={onClose}
            clientData={onEdit && clientData}
            onDataFetch={onDataFetch}
            ref={clientRef}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Permission" && (
          <PermissionsContent
            tab={tab}
            onClose={onClose}
            ref={permissionRef}
            getPermissionDropdown={getPermissionDropdown}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Project" && (
          <ProjectContent
            onOpen={onOpen}
            tab={tab}
            ref={projectRef}
            onEdit={onEdit}
            onDataFetch={onDataFetch}
            onClose={onClose}
            projectData={projectData}
            onValuesChange={handleProjectChildValuesChange}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Status" && (
          <StatusContent
            tab={tab}
            onEdit={onEdit}
            onClose={onClose}
            ref={childRefStatus}
            statusData={onEdit && statusData}
            onDataFetch={onDataFetch}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
          />
        )}
        {tab === "User" && (
          <UserContent
            onOpen={onOpen}
            tab={tab}
            onEdit={onEdit}
            onClose={onClose}
            ref={childRef}
            userData={onEdit && userData}
            onUserDataFetch={onUserDataFetch}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Process" && (
          <ProcessContent
            onOpen={onOpen}
            tab={tab}
            onEdit={onEdit}
            onClose={onClose}
            ref={childRefProcess}
            onDataFetch={onDataFetch}
            processData={onEdit && processData}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
            onValuesChange={handleProcessChildValuesChange}
          />
        )}
        {tab === "Organization" && (
          <OrganizationContent
            tab={tab}
            onEdit={onEdit}
            onClose={onClose}
            orgData={orgData}
            onDataFetch={onDataFetch}
            ref={childRefOrg}
            getOrgDetailsFunction={getOrgDetailsFunction}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
          />
        )}
        {tab === "Group" && (
          <GroupContent
            onOpen={onOpen}
            tab={tab}
            onEdit={onEdit}
            onClose={onClose}
            orgData={orgData}
            ref={childRefGroup}
            onDataFetch={onDataFetch}
            groupData={onEdit && groupData}
            onChangeLoader={(e: any) => setDrawerOverlay(e)}
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
