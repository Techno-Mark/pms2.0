import AddPlusIcon from "@/assets/icons/AddPlusIcon";
import AlarmIcon from "@/assets/icons/AlarmIcon";
import RestartButton from "@/assets/icons/worklogs/RestartButton";
import { Button, IconButton, Tooltip } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import EmailData, { EmailDataContenRef } from "./EmailData";
import { Close } from "@mui/icons-material";
import Conversations, { ConversationDataContenRef } from "./Conversations";
import Comments from "./Comments";
import History from "./History";
import Attachments from "./Attachments";
import { callAPI } from "@/utils/API/callAPI";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";

interface EmailBoxDrawerProps {
  onOpen: boolean;
  onClose: () => void;
  onDataFetch: (() => void) | null;
  clientId: number;
  ticketId: number;
  activeTabList: number;
  activeTabPermission: boolean;
  tagDropdown: { label: string; value: string }[];
  getTagDropdownData: () => void;
}

const EmailBoxDrawer: React.FC<EmailBoxDrawerProps> = ({
  onOpen,
  onClose,
  onDataFetch,
  clientId,
  ticketId,
  activeTabList,
  activeTabPermission,
  tagDropdown,
  getTagDropdownData,
}) => {
  const router = useRouter();
  const clientRef = useRef<EmailDataContenRef>(null);
  const conversationRef = useRef<ConversationDataContenRef>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [tabs, setTabs] = useState<
    { label: string; Count: number; TabId: number }[]
  >([
    // { label: "Conversation", Count: 1, TabId: 1 },
    // { label: "Comments", Count: 0, TabId: 2 },
    // { label: "Attachment", Count: 0, TabId: 3 },
    // { label: "History", Count: 0, TabId: 4 },
  ]);
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [createTask, setCreateTask] = useState(false);
  const [allFieldsFilled, setAllFieldsFilled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [syncTime, setSyncTime] = useState(0);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const handleTaskCreate = () => {
    setOverlayOpen(true);
    const params = {
      TicketIds: [ticketId],
    };
    const url = `${process.env.emailbox_api_url}/emailbox/saveWorkItemFromTicket`;
    const successCallback = (
      ResponseData: {
        InvalidStatusCount: number;
        ValidTicketCount: number;
        InvalidTicketCount: number;
      },
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        ResponseData.ValidTicketCount > 0 &&
          toast.success("Task created successfully.");
        (ResponseData.InvalidStatusCount > 0 ||
          ResponseData.InvalidTicketCount > 0) &&
          toast.error("Please try again later.");
        setOverlayOpen(false);
        getTicketDetails();
      } else {
        setOverlayOpen(false);
      }
    };
    callAPI(url, params, successCallback, "POST");
  };

  const handleClose = () => {
    if (clientRef.current) {
      clientRef.current.clearEmailDataData();
    }
    if (conversationRef.current) {
      conversationRef.current.clearConversationData();
    }
    setActiveTab(0);
    setTabs([]);
    setTicketDetails(null);
    setCreateTask(false);
    setAllFieldsFilled(false);

    if (typeof window !== "undefined") {
      const pathname = window.location.href.includes("id=");
      if (pathname) {
        onClose();
        router.push("/emailbox");
      } else {
        onClose();
        onDataFetch?.();
      }
    }
  };

  const getTicketDetails = (open: boolean = false) => {
    const url = `${process.env.emailbox_api_url}/emailbox/GetTicketTabs`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTabs(ResponseData.Tabs);
        setTicketDetails(ResponseData.TicketDetails);
        setCreateTask(
          !!ResponseData.TicketDetails.Assignee &&
            !!ResponseData.TicketDetails.EmailType &&
            !!ResponseData.TicketDetails.Priority &&
            (ResponseData.TicketDetails.Status === 2 ||
              ResponseData.TicketDetails.Status === 3 ||
              ResponseData.TicketDetails.Status === 5) &&
            !!ResponseData.TicketDetails.ApprovalId
        );
        setAllFieldsFilled(
          !!ResponseData.TicketDetails.Assignee &&
            !!ResponseData.TicketDetails.EmailType &&
            !!ResponseData.TicketDetails.Priority &&
            !!ResponseData.TicketDetails.Status &&
            !!ResponseData.TicketDetails.ApprovalId
        );
        setSyncTime(ResponseData.TicketDetails.RemainingSyncTime);
        open && setActiveTab(1);
      }
    };

    callAPI(url, { TicketId: ticketId }, successCallback, "post");
  };

  useEffect(() => {
    onOpen && getTicketDetails(true);
  }, [onOpen]);

  const getSyncTime = () => {
    const url = `${process.env.emailbox_api_url}/emailbox/calculateRemaningOrSpentSLATime`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setSyncTime(ResponseData.RemainingSyncTime);
      }
    };

    callAPI(url, { TicketIds: [ticketId] }, successCallback, "post");
  };

  const handleDrawerClose = () => {
    setOverlayOpen(false);
  };

  return (
    <div
      className={`fixed top-0 right-0 z-30 h-screen w-[85vw] border border-lightSilver bg-pureWhite transform ${
        onOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out`}
    >
      <div className="flex items-center justify-between p-3 bg-gray-100">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">
            #{ticketId}&nbsp;
            <ColorToolTip
              title={!!ticketDetails && ticketDetails.Subject}
              placement="top"
              arrow
            >
              {!!ticketDetails &&
                (ticketDetails.Subject.length > 30
                  ? `${ticketDetails.Subject.slice(0, 30)}...`
                  : ticketDetails.Subject)}
            </ColorToolTip>{" "}
            - {!!ticketDetails && ticketDetails.AttachmentCount} Attachments
          </span>
          {!!ticketDetails && ticketDetails.IsSyncOn && (
            <span className="flex items-center gap-1 text-lg text-[#02B89D]">
              <AlarmIcon />
              {`${syncTime < 0 ? "-" : ""}${String(
                Math.floor(Math.abs(syncTime) / 3600)
              ).padStart(2, "0")}:${String(
                Math.floor((Math.abs(syncTime) % 3600) / 60)
              ).padStart(2, "0")}:${String(Math.abs(syncTime) % 60).padStart(
                2,
                "0"
              )}`}
              {activeTabList !== 2 &&
                activeTabList !== 5 &&
                !!ticketDetails &&
                ticketDetails.IsSyncOn && (
                  <ColorToolTip title="Sync" placement="top" arrow>
                    <span
                      onClick={() => getSyncTime()}
                      className="cursor-pointer"
                    >
                      <RestartButton />
                    </span>
                  </ColorToolTip>
                )}
            </span>
          )}
        </div>
        <Tooltip title="Close" placement="top" arrow>
          <IconButton className="mr-[4px]" onClick={handleClose}>
            <Close />
          </IconButton>
        </Tooltip>
      </div>

      <div className="pl-4 gap-1 border-t border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center justify-center pt-2">
          {tabs.length > 0 &&
            (activeTabList === 2 ? [...tabs.slice(0, 1),...tabs.slice(2, 3)] : tabs).map((tab) => (
              <p
                key={tab.TabId}
                className={`cursor-pointer px-4 py-2 ${
                  activeTab === tab.TabId
                    ? "text-secondary border-b border-secondary"
                    : ""
                }`}
                onClick={() => setActiveTab(tab.TabId)}
              >
                {tab.label}
                {tab.Count > 0 && `:${tab.Count}`}
              </p>
            ))}
        </div>
        <div className="flex items-center justify-center gap-4">
          {/* <Button
            variant="outlined"
            color="info"
            className="rounded-[4px] !h-[36px] mr-2"
            onClick={handleTaskCreate}
          >
            <span className="flex items-center gap-[10px] px-[5px]">
              <span className="pt-1">Submit for Approval</span>
            </span>
          </Button> */}
          {activeTabList !== 2 &&
            activeTabPermission &&
            !!ticketDetails &&
            !ticketDetails.IsWorkItemCreated && (
              <Button
                variant="contained"
                className={`rounded-[4px] !h-[36px] ${
                  !createTask
                    ? "bg-gray-500 !cursor-not-allowed"
                    : "!bg-secondary cursor-pointer"
                } mr-2`}
                onClick={() => {
                  if (createTask) {
                    setIsCreateTaskOpen(true);
                  }
                }}
                disabled={!createTask}
              >
                <span className="flex items-center gap-[10px] px-[5px]">
                  <AddPlusIcon color={!createTask ? "gray" : "white"} />
                  <span className="pt-1">Create Task</span>
                </span>
              </Button>
            )}
        </div>
      </div>

      <div
        className="w-[100%] flex items-center justify-center"
        style={{ height: "calc(100% - 123px)" }}
      >
        <div className="bg-white min-w-[25%] h-full">
          <EmailData
            ref={clientRef}
            onOpen={onOpen}
            activeTab={activeTab}
            clientId={clientId}
            ticketId={ticketId}
            ticketDetails={ticketDetails}
            getTicketDetails={getTicketDetails}
            setOverlayOpen={setOverlayOpen}
            tagDropdown={tagDropdown}
            getTagDropdownData={getTagDropdownData}
            activeTabList={activeTabList}
            isDisabled={activeTabList === 2 || !activeTabPermission}
          />
        </div>
        <div className="w-[75%] h-full">
          {activeTab === 1 ? (
            <Conversations
              ref={conversationRef}
              activeTab={activeTab}
              ticketId={ticketId}
              setOverlayOpen={setOverlayOpen}
              getTicketDetails={getTicketDetails}
              ticketDetails={ticketDetails}
              clientId={clientId}
              activeTabList={activeTabList}
              onClose={onClose}
              onDataFetch={onDataFetch}
              allFieldsFilled={allFieldsFilled}
              isDisabled={activeTabList === 2 || !activeTabPermission}
            />
          ) : activeTab === 2 ? (
            <Comments
              activeTab={activeTab}
              ticketId={ticketId}
              clientId={clientId}
              isDisabled={activeTabList === 2 || !activeTabPermission}
            />
          ) : activeTab === 3 ? (
            <Attachments activeTab={activeTab} ticketId={ticketId} />
          ) : (
            activeTab === 4 && (
              <History activeTab={activeTab} ticketId={ticketId} />
            )
          )}
        </div>
      </div>

      <DrawerOverlay
        isOpen={overlayOpen}
        className="!-top-[1px] !-left-[1px]"
        onClose={handleDrawerClose}
      />

      <DeleteDialog
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onActionClick={handleTaskCreate}
        Title={"Create Task"}
        firstContent={"Are you sure you want to create task?"}
        secondContent={""}
        buttonContent={true}
      />
    </div>
  );
};

export default EmailBoxDrawer;
