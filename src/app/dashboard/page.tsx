"use client";
import React, { useEffect, useState } from "react";
import Navbar from "@/components/common/Navbar";
import Wrapper from "@/components/common/Wrapper";
import {
  Avatar,
  Card,
  FormControl,
  IconButton,
  InputBase,
  InputLabel,
  List,
  MenuItem,
  Popover,
  Select,
} from "@mui/material";
import TotalTaskCreated from "@/assets/icons/dashboard_Client/TotalTaskCreated";
import InProgressWork from "@/assets/icons/dashboard_Client/InProgressWork";
import PendingTask from "@/assets/icons/dashboard_Client/PendingTask";
import CompletedTask from "@/assets/icons/dashboard_Client/CompletedTask";
import Chart_Priority from "@/components/dashboard/charts/Chart_Priority";
import Chart_ReturnType from "@/components/dashboard/charts/Chart_ReturnType";
import ArrowDown from "@/assets/icons/dashboard_Client/ArrowDown";
import ArrowUp from "@/assets/icons/dashboard_Client/ArrowUp";
import SearchIcon from "@/assets/icons/SearchIcon";
import Btn_FullScreen from "@/assets/icons/dashboard_Client/Btn_FullScreen";
import Dialog_TaskList from "@/components/dashboard/dialog/Dialog_TaskList";
import Datatable_Overdue from "@/components/dashboard/datatable/Datatable_Overdue";
import Datatable_OnHold from "@/components/dashboard/datatable/Datatable_OnHold";
import Chart_OverallProjectCompletion from "@/components/dashboard/charts/Chart_OverallProjectCompletion";
import Chart_TotalHours from "@/components/dashboard/charts/Chart_TotalHours";
import Chart_TaskStatus from "@/components/dashboard/charts/Chart_TaskStatus";
import Dialog_TotalHoursInfo from "@/components/dashboard/dialog/Dialog_TotalHoursInfo";
import Dialog_TaskStatusInfo from "@/components/dashboard/dialog/Dialog_TaskStatusInfo";
import Dialog_PriorityInfo from "@/components/dashboard/dialog/Dialog_PriorityInfo";
import { hasPermissionWorklog } from "@/utils/commonFunction";
import { useRouter } from "next/navigation";
import Dialog_OverallProjectSummary from "@/components/dashboard/dialog/Dialog_OverallProjectSummary";
import Dialog_SummaryList from "@/components/dashboard/dialog/Dialog_SummaryList";
import Dialog_ReturnTypeData from "@/components/dashboard/dialog/Dialog_ReturnTypeData";
import { callAPI } from "@/utils/API/callAPI";
import {
  getDepartmentDataByClient,
  getTypeOfWorkDropdownData,
} from "@/utils/commonDropdownApiCall";
import {
  KeyValueColorCode,
  KeyValueColorCodeSequence,
  LabelValue,
} from "@/utils/Types/types";

interface Project {
  Childrens: Project[];
  ProjectName: string;
  Level: number;
  ParentId: number | null;
  ProjectId: number;
}

interface ProjectList {
  List: Project[] | [];
}

const Page = () => {
  const router = useRouter();
  const [isTotalHrsDialogOpen, setIsTotalHrsDialogOpen] =
    useState<boolean>(false);
  const [isTaskStatusDialogOpen, setIsTaskStatusDialogOpen] =
    useState<boolean>(false);
  const [isPriorityInfoDialogOpen, setIsPriorityInfoDialogOpen] =
    useState<boolean>(false);
  const [isProjectStatusDialogOpen, setIsProjectStatusDialogOpen] =
    useState<boolean>(false);
  const [clickedPriorityName, setClickedPriorityName] = useState<string>("");
  const [clickedStatusName, setClickedStatusName] = useState<number>(0);
  const [clickedWorkTypeName, setClickedWorkTypeName] = useState<string>("");
  const [clickedProjectStatusName, setClickedProjectStatusName] =
    useState<string>("");
  const [isDatatableDialog, setIsDatatableDialog] = useState<boolean>(false);
  const [isOverdueClicked, setIsOverdueClicked] = useState<boolean>(true);
  const [isOnHoldClicked, setIsOnHoldClicked] = useState<boolean>(false);
  const [workType, setWorkType] = useState<any | null>(0);
  const [workTypeData, setWorkTypeData] = useState<any[] | any>([]);
  const [department, setDepartment] = useState<any | null>(0);
  const [departmentData, setDepartmentData] = useState<any[] | any>([]);
  const [projects, setProjects] = useState<any | any[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<number[]>([]);
  const [currentProjectName, setCurrentProjectName] = useState<any>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [projectSummary, setProjectSummary] = useState<
    KeyValueColorCodeSequence[] | []
  >([]);
  const [anchorElProjects, setAnchorElProjects] = React.useState<
    HTMLButtonElement | null | any
  >(null);
  const [summaryLabel, setSummaryLabel] = useState<number>(0);
  const [isSummaryListDialogOpen, setIsSummaryListDialogOpen] =
    useState<boolean>(false);
  const [isReturnTypeDialogOpen, setIsReturnTypeDialogOpen] =
    useState<boolean>(false);
  const [clickedReturnTypeValue, setClickedReturnTypeValue] = useState<any>("");

  useEffect(() => {
    if (localStorage.getItem("isClient") === "true") {
      if (!hasPermissionWorklog("", "View", "Dashboard")) {
        router.push("/");
      }
    } else {
      router.push("/");
    }
  }, [router]);

  const handleClickProjects = (event: any) => {
    setAnchorElProjects(event.currentTarget);
  };

  const handleCloseProjects = () => {
    setAnchorElProjects(null);
  };

  const openProjects = Boolean(anchorElProjects);
  const idProjects = openProjects ? "simple-popover" : undefined;

  const handleOptionProjects = (id: number, name: string) => {
    setCurrentProjectId([id]);
    setCurrentProjectName(name);
    handleCloseProjects();
  };

  const handleSearchChange = (e: string) => {
    setSearchQuery(e);
  };

  const filteredProjects = searchQuery
    ? projects.filter((project: Project) =>
        project.ProjectName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : projects;

  const handleSelectAllProject = () => {
    setCurrentProjectId([]);
    setCurrentProjectName("All Projects");
    handleCloseProjects();
  };

  const handleValueFromOverallProject = (
    isDialogOpen: boolean,
    selectedPointData: string
  ) => {
    setIsProjectStatusDialogOpen(isDialogOpen);
    setClickedProjectStatusName(selectedPointData);
  };

  const handleValueFromReturnType = (
    isDialogOpen: boolean,
    selectedPointData: string
  ) => {
    setIsReturnTypeDialogOpen(isDialogOpen);
    setClickedReturnTypeValue(selectedPointData);
  };

  const handleValueFromTaskStatus = (
    isDialogOpen: boolean,
    selectedPointData: number
  ) => {
    setIsTaskStatusDialogOpen(isDialogOpen);
    setClickedStatusName(selectedPointData);
  };

  const handleValueFromPriority = (
    isDialogOpen: boolean,
    selectedPointData: string
  ) => {
    setIsPriorityInfoDialogOpen(isDialogOpen);
    setClickedPriorityName(selectedPointData);
  };

  const getProjects = async () => {
    const ClientId = await localStorage.getItem("clientId");
    const params = {
      clientId: ClientId,
      TypeofWorkId: null,
      isAll: true,
    };
    const url = `${process.env.pms_api_url}/project/getdropdown`;
    const successCallback = (
      ResponseData: ProjectList,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setProjects(ResponseData.List);
      } else {
        setProjects([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const getWorkTypes = async () => {
    const ClientId = await localStorage.getItem("clientId");
    setWorkTypeData(await getTypeOfWorkDropdownData(ClientId));
    setDepartmentData(await getDepartmentDataByClient(ClientId));
  };

  useEffect(() => {
    getProjects();
    getWorkTypes();
  }, []);

  const getProjectSummary = async () => {
    const params = {
      projectIds: currentProjectId,
      typeOfWork: workType === 0 ? null : workType,
      DepartmentId: department === 0 ? null : department,
    };
    const url = `${process.env.report_api_url}/clientdashboard/summarybyproject`;
    const successCallback = (
      ResponseData: KeyValueColorCodeSequence[] | [],
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setProjectSummary(ResponseData);
      } else {
        setProjectSummary([]);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  useEffect(() => {
    getProjectSummary();
  }, [currentProjectId, workType, department]);

  const statusIconMapping: any = {
    1: <TotalTaskCreated />,
    2: <PendingTask />,
    3: <InProgressWork />,
    4: <CompletedTask />,
  };

  return (
    <Wrapper className="min-h-screen overflow-y-auto">
      <div>
        <Navbar />
        <div>
          <section className="flex py-[10px] px-[20px] justify-between items-center">
            <div
              className={`flex items-center gap-[50px] px-5 cursor-pointer h-[65px] min-w-[225px] ${
                anchorElProjects === null
                  ? "bg-whiteSmoke rounded"
                  : "bg-[#EEF4F8] delay-75 rounded"
              }`}
              aria-describedby={idProjects}
              onClick={handleClickProjects}
            >
              <div className="flex items-center gap-[15px]">
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: 14,
                    color: "#02B89D",
                    backgroundColor: "#C9DDEB",
                  }}
                >
                  {currentProjectName
                    ? currentProjectName
                        .split(" ")
                        .map((word: string) => word.charAt(0).toUpperCase())
                        .join("")
                    : "All Projects"
                        .split(" ")
                        .map((word: string) => word.charAt(0).toUpperCase())
                        .join("")}
                </Avatar>
                <span
                  className={`${
                    anchorElProjects === null
                      ? ""
                      : "font-semibold text-secondary"
                  }`}
                >
                  {currentProjectName ? currentProjectName : "All Projects"}
                </span>
              </div>
              <span>
                {anchorElProjects === null ? <ArrowDown /> : <ArrowUp />}
              </span>
            </div>

            <Popover
              id={idProjects}
              open={openProjects}
              anchorEl={anchorElProjects}
              onClose={handleCloseProjects}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              sx={{ marginTop: 0.2 }}
            >
              <nav className="!w-[225px] !max-h-[550px]">
                <div className="px-4 mt-4">
                  <div className="flex items-center h-10 rounded-md pl-2 flex-row border border-lightSilver">
                    <span className="mr-2">
                      <SearchIcon />
                    </span>
                    <span>
                      <InputBase
                        placeholder="Search"
                        inputProps={{ "aria-label": "search" }}
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        style={{ fontSize: "13px" }}
                      />
                    </span>
                  </div>
                </div>
                <List>
                  {(searchQuery === "" ||
                    searchQuery.toLowerCase().includes("all projects") ||
                    searchQuery.toLowerCase().startsWith("a") ||
                    searchQuery.toLowerCase().startsWith("l")) && (
                    <span className="flex flex-col py-1 px-4 hover-bg-whiteSmoke text-sm">
                      <span className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2">
                        <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}>
                          {"All Projects"
                            .split(" ")
                            .map((word: string) => word.charAt(0).toUpperCase())
                            .join("")}
                        </Avatar>

                        <span
                          onClick={() => {
                            handleSelectAllProject();
                          }}
                          className="pt-[0.8px]"
                        >
                          All Projects
                        </span>
                      </span>
                    </span>
                  )}

                  {filteredProjects.length === 0 &&
                    !searchQuery.toLowerCase().includes("all projects") &&
                    !searchQuery.toLowerCase().startsWith("a") &&
                    !searchQuery.toLowerCase().startsWith("l") && (
                      <span className="flex flex-col py-1 px-4 hover-bg-whiteSmoke text-sm">
                        <span className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2">
                          No Result found
                        </span>
                      </span>
                    )}

                  {filteredProjects?.map((project: Project) => {
                    return (
                      <span
                        key={project.ProjectId}
                        className="flex flex-col py-1 px-4 hover-bg-whiteSmoke text-sm"
                      >
                        <span
                          className="pt-1 pb-1 cursor-pointer flex flex-row items-center gap-2"
                          onClick={() =>
                            handleOptionProjects(
                              project.ProjectId,
                              project.ProjectName
                            )
                          }
                        >
                          <Avatar sx={{ width: 34, height: 34, fontSize: 14 }}>
                            {project.ProjectName.split(" ")
                              .map((word: string) =>
                                word.charAt(0).toUpperCase()
                              )
                              .join("")}
                          </Avatar>

                          <span className="pt-[0.8px]">
                            {project.ProjectName}
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </List>
              </nav>
            </Popover>

            <div>
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, minWidth: 150, marginTop: 1 }}
              >
                <InputLabel id="demo-simple-select-standard-label">
                  Type Of Work
                </InputLabel>
                <Select
                  labelId="workType"
                  id="workType"
                  value={workType === 0 ? 0 : workType}
                  onChange={(e) => setWorkType(e.target.value)}
                >
                  <MenuItem value={0}>All</MenuItem>
                  {workTypeData?.length > 0 &&
                    workTypeData?.map((i: LabelValue) => (
                      <MenuItem value={i.value} key={i.value}>
                        {i.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
              <FormControl
                variant="standard"
                sx={{ mx: 0.75, minWidth: 150, marginTop: 1 }}
              >
                <InputLabel id="demo-simple-select-standard-label">
                  Department
                </InputLabel>
                <Select
                  labelId="department"
                  id="department"
                  value={department === 0 ? 0 : department}
                  onChange={(e) => setDepartment(e.target.value)}
                >
                  <MenuItem value={0}>All</MenuItem>
                  {departmentData?.length > 0 &&
                    departmentData?.map((i: LabelValue) => (
                      <MenuItem value={i.value} key={i.value}>
                        {i.label}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </div>
          </section>

          <section className="flex gap-[25px] items-center px-[20px] py-[10px]">
            {projectSummary &&
              projectSummary?.map((item: KeyValueColorCodeSequence) => (
                <Card
                  key={item.Key}
                  className={`w-full border shadow-md hover:shadow-xl cursor-pointer`}
                  style={{ borderColor: item.ColorCode }}
                >
                  <div
                    className="flex p-[20px] items-center"
                    onClick={() => {
                      setSummaryLabel(item.Sequence);
                      setIsSummaryListDialogOpen(true);
                    }}
                  >
                    <span
                      style={{ color: item.ColorCode }}
                      className={`border-r border-lightSilver pr-[20px]`}
                    >
                      {statusIconMapping[item.Sequence]}
                    </span>
                    <div className="inline-flex flex-col items-start pl-[20px]">
                      <span className="text-[14px] font-normal text-darkCharcoal">
                        {item.Key}
                      </span>
                      <span className="text-[20px] text-slatyGrey font-semibold">
                        {item.Value}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
          </section>

          <section className="flex gap-[20px] items-center px-[20px]">
            <Card className="w-full h-[344px] border border-lightSilver rounded-lg">
              <Chart_OverallProjectCompletion
                sendData={handleValueFromOverallProject}
                onSelectedProjectIds={currentProjectId}
                onSelectedWorkType={workType}
                onSelectedDepartment={department}
              />
            </Card>
            <Card className="w-full h-[344px] mb-[40px] border border-lightSilver rounded-lg mt-10">
              <Chart_Priority
                onSelectedProjectIds={currentProjectId}
                onSelectedWorkType={workType}
                onSelectedDepartment={department}
                sendData={handleValueFromPriority}
              />
            </Card>
            {(workType === 0 || workType === 3) && (
              <Card className="w-full h-[344px] border border-lightSilver rounded-lg justify-center flex">
                <Chart_ReturnType
                  onSelectedProjectIds={currentProjectId}
                  onSelectedWorkType={workType}
                  onSelectedDepartment={department}
                  sendData={handleValueFromReturnType}
                />
              </Card>
            )}
            {/* <div className="w-full h-[344px]"></div> */}
            {/* <Card className="w-full h-[344px] border border-lightSilver rounded-lg">
              <Chart_TotalHours
                sendData={handleValueFromTotalHours}
                onSelectedProjectIds={currentProjectId}
                onSelectedWorkType={workType}
              />
            </Card> */}
          </section>

          <section className="px-[20px] py-[10px]">
            <Card className="w-full border border-lightSilver rounded-lg">
              <Chart_TaskStatus
                sendData={handleValueFromTaskStatus}
                onSelectedProjectIds={currentProjectId}
                onSelectedWorkType={workType}
                onSelectedDepartment={department}
              />
            </Card>
          </section>

          <section className="flex gap-[20px] px-[20px] py-[10px]">
            {/* <div className="flex flex-col w-[345px]">
              <Card className="w-full h-[344px] mb-[40px] border border-lightSilver rounded-lg">
                <Chart_Priority
                  onSelectedProjectIds={currentProjectId}
                  onSelectedWorkType={workType}
                  sendData={handleValueFromPriority}
                />
              </Card>

              {workType !== 1 && (
                <Card className="w-full h-[344px] border border-lightSilver rounded-lg justify-center flex">
                  <Chart_ReturnType
                    onSelectedProjectIds={currentProjectId}
                    onSelectedWorkType={workType}
                    sendData={handleValueFromReturnType}
                  />
                </Card>
              )}
            </div> */}

            <Card className="w-full h-full">
              <div>
                <div className="bg-whiteSmoke flex justify-between items-center px-[10px]">
                  <div className="flex gap-[20px] items-center py-[6.5px] px-[10px]">
                    <label
                      onClick={() => {
                        setIsOverdueClicked(true);
                        setIsOnHoldClicked(false);
                      }}
                      className={`py-[10px] cursor-pointer select-none ${
                        isOverdueClicked
                          ? "text-secondary text-[16px] font-semibold"
                          : "text-slatyGrey text-[14px]"
                      }`}
                    >
                      Overdue
                    </label>
                    <span className="text-lightSilver">|</span>
                    <label
                      onClick={() => {
                        setIsOnHoldClicked(true);
                        setIsOverdueClicked(false);
                      }}
                      className={`py-[10px] cursor-pointer select-none ${
                        isOnHoldClicked
                          ? "text-secondary text-[16px] font-semibold"
                          : "text-slatyGrey text-[14px]"
                      }`}
                    >
                      On Hold
                    </label>
                  </div>

                  <IconButton onClick={() => setIsDatatableDialog(true)}>
                    <Btn_FullScreen />
                  </IconButton>
                </div>

                {isOverdueClicked && (
                  <Datatable_Overdue
                    onSelectedProjectIds={currentProjectId}
                    onSelectedWorkType={workType}
                    onSelectedDepartment={department}
                  />
                )}

                {isOnHoldClicked && (
                  <Datatable_OnHold
                    onSelectedProjectIds={currentProjectId}
                    onSelectedWorkType={workType}
                    onSelectedDepartment={department}
                  />
                )}
              </div>
            </Card>
          </section>
        </div>

        <Dialog_TaskList
          onOpen={isDatatableDialog}
          onClose={() => setIsDatatableDialog(false)}
          onSelectedWorkType={workType}
          onSelectedDepartment={department}
          onSelectedProjectIds={currentProjectId}
        />

        {/* <Dialog_TotalHoursInfo
          onOpen={isTotalHrsDialogOpen}
          onClose={() => setIsTotalHrsDialogOpen(false)}
          onWorkTypeData={workTypeData}
          onSelectedProjectIds={currentProjectId}
          onSelectedWorkTypeName={clickedWorkTypeName}
        /> */}

        <Dialog_TaskStatusInfo
          onOpen={isTaskStatusDialogOpen}
          onClose={() => setIsTaskStatusDialogOpen(false)}
          onWorkTypeData={workTypeData}
          onSelectedProjectIds={currentProjectId}
          onSelectedWorkType={workType}
          onSelectedDepartment={department}
          onSelectedStatusName={clickedStatusName}
        />

        <Dialog_PriorityInfo
          onOpen={isPriorityInfoDialogOpen}
          onClose={() => setIsPriorityInfoDialogOpen(false)}
          onSelectedProjectIds={currentProjectId}
          onSelectedPriorityName={clickedPriorityName}
          onSelectedWorkType={workType}
          onSelectedDepartment={department}
        />

        <Dialog_OverallProjectSummary
          onOpen={isProjectStatusDialogOpen}
          onClose={() => setIsProjectStatusDialogOpen(false)}
          onSelectedProjectIds={currentProjectId}
          onSelectedWorkType={workType}
          onSelectedDepartment={department}
          onSelectedTaskStatus={clickedProjectStatusName}
        />

        <Dialog_SummaryList
          onOpen={isSummaryListDialogOpen}
          onClose={() => setIsSummaryListDialogOpen(false)}
          onSelectedProjectIds={currentProjectId}
          onSelectedWorkType={workType}
          onSelectedDepartment={department}
          onSelectedSummaryStatus={summaryLabel}
          onCurrProjectSummary={projectSummary}
        />

        <Dialog_ReturnTypeData
          onOpen={isReturnTypeDialogOpen}
          onClose={() => setIsReturnTypeDialogOpen(false)}
          onSelectedProjectIds={currentProjectId}
          onSelectedReturnTypeValue={
            clickedReturnTypeValue === "Individual Return" ? 1 : 2
          }
          onSelectedWorkType={workType}
          onSelectedDepartment={department}
        />
      </div>
    </Wrapper>
  );
};

export default Page;
