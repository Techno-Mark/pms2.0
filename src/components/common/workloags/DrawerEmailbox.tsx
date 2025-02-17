import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import EmailBox from "@/assets/icons/EmailBox";
import { callAPI } from "@/utils/API/callAPI";
import {
  generateEmailboxStatusWithColor,
  generatePriorityWithColor,
} from "@/utils/datatable/CommonFunction";
import { getFileFromBlob } from "@/utils/downloadFile";
import { Download } from "@mui/icons-material";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import FileIcon from "../FileIcon";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { Avatar } from "@mui/material";
import Attachments from "@/components/emailbox/drawer/Attachments";
import History from "@/components/emailbox/drawer/History";
import { extractText } from "@/utils/commonFunction";
import { LabelValue } from "@/utils/Types/types";
import Loading from "@/assets/icons/reports/Loading";
import { getCommentUserDropdownData } from "@/utils/commonDropdownApiCall";

interface conversationAttachment {
  AttachmentId: number;
  UserFileName: string;
  SystemFileName: string;
  Type: number;
  ReferenceId: number;
  Path: string;
  WorkItemId: number;
}

interface conversationData {
  TrailId: number;
  From: string;
  To: string | null;
  CC: string | null;
  BCC: string | null;
  Subject: string;
  Body: string;
  isHTML: boolean;
  ReceivedOn: string;
  MessageId: string;
  Attachments: conversationAttachment[] | null;
  Type: number;
  FromUser: string;
}

const Red = ["A", "F", "K", "P", "U", "Z"];
const Blue = ["B", "G", "L", "Q", "V"];
const Green = ["C", "H", "M", "R", "W"];
const SkyBlue = ["D", "I", "N", "S", "X"];

const DrawerEmailbox = ({
  onOpen,
  onEdit,
  ticketId,
  clientId,
}: {
  onOpen: boolean;
  onEdit: number;
  ticketId: number;
  clientId: number;
}) => {
  const [emailBoxDrawer, setEmailBoxDrawer] = useState(true);
  const [activeTab, setActiveTab] = useState(1);
  const [tabs, setTabs] = useState([]);
  const [ticketDetails, setTicketDetails] = useState<{
    Assignee: number;
    Status: number;
    DueDate: string;
    EmailType: number;
    Priority: number;
    Tags: string[];
    Subject: string;
    RemainingSyncTime: number;
    AttachmentCount: number;
    ApprovalId: number;
    OriginalMessgeId: string;
    AssigneeName: string;
    StatusName: string;
    EmailTypeName: string;
    PriorityName: string;
  } | null>(null);
  const [data, setData] = useState([]);
  const [commentUserData, setCommentUserData] = useState<LabelValue[]>([]);
  const [commentData, setCommentData] = useState([]);

  const getTicketDetails = () => {
    const url = `${process.env.emailbox_api_url}/emailbox/GetTicketTabs`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setTabs(ResponseData.Tabs);
        setTicketDetails(ResponseData.TicketDetails);
      } else {
        setTabs([]);
        setTicketDetails(null);
      }
    };

    callAPI(url, { TicketId: ticketId }, successCallback, "post");
  };

  const getConversationData = (TabId: number) => {
    const url = `${process.env.emailbox_api_url}/emailbox/GetTicketDetails`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        TabId === 1 && setData(ResponseData.ConversationDetails);
        TabId === 2 && setCommentData(ResponseData.CommentDetails);
      } else {
        setData([]);
      }
    };

    callAPI(
      url,
      {
        TicketId: ticketId,
        TabId: TabId,
        AttachmentType: 0,
        FromDate: null,
        ToDate: null,
      },
      successCallback,
      "post"
    );
  };

  useEffect(() => {
    if (ticketId > 0 && (activeTab === 1 || activeTab === 2)) {
      getConversationData(activeTab);
    }
  }, [ticketId, activeTab]);

  useEffect(() => {
    setActiveTab(1);
    const getData = async () => {
      setCommentUserData(
        await getCommentUserDropdownData({
          ClientId: clientId,
          GetClientUser: false,
        })
      );
    };

    onEdit && onOpen && ticketId > 0 && getData();
    onEdit && onOpen && ticketId > 0 && getTicketDetails();
  }, [onEdit, onOpen, ticketId]);

  return (
    <>
      <div className="py-[10px] px-8 flex items-center justify-between font-medium border-dashed border-b border-lightSilver">
        <span className="flex items-center">
          <EmailBox />
          <span className="ml-[21px]">Email Box</span>
        </span>
        <span
          className={`cursor-pointer ${emailBoxDrawer ? "rotate-180" : ""}`}
          onClick={() => setEmailBoxDrawer(!emailBoxDrawer)}
        >
          <ChevronDownIcon />
        </span>
      </div>
      {ticketId > 0 && (
        <div className="flex items-start w-full">
          <div className="flex flex-col items-center justify-center gap-2 w-[12%]">
            {tabs.map(
              (
                i: {
                  label: string;
                  Count: number;
                  TabId: number;
                },
                index: number
              ) => (
                <span
                  className={`flex items-center w-full py-3 pl-3 border-l-[4px] hover:bg-[#F6F6F6] hover:border-[#0592C6] ${
                    activeTab === i.TabId
                      ? "border-[#0592C6] bg-[#F6F6F6]"
                      : "border-pureWhite"
                  }`}
                  key={index}
                  onClick={() => setActiveTab(i.TabId)}
                >
                  {i.label}
                  {i.Count > 0 && `:${i.Count}`}
                </span>
              )
            )}
          </div>
          <div className="flex flex-col gap-2 w-[88%] max-w-[88%] border-l border-gray-300">
            {!!ticketDetails && (
              <div className="flex flex-wrap pl-8 bg-[#F6F6F6] py-3 gap-4 w-full">
                <span>Assignee: {ticketDetails.AssigneeName}</span>
                <span className="flex">
                  Status:&nbsp;
                  {!!ticketDetails.Status
                    ? generateEmailboxStatusWithColor(ticketDetails.StatusName)
                    : ""}
                </span>
                <span>
                  Due Date:&nbsp;
                  {!!ticketDetails.DueDate
                    ? dayjs(ticketDetails.DueDate).format("MM-DD-YYYY")
                    : ""}
                </span>
                <span>Email Type: {ticketDetails.EmailTypeName}</span>
                <span className="flex">
                  Priority:&nbsp;
                  {!!ticketDetails.Priority
                    ? generatePriorityWithColor(ticketDetails.PriorityName)
                    : ""}
                </span>
                <span className="flex items-center gap-2 break-words">
                  Tag:
                  <span className="break-words">
                    {ticketDetails.Tags.length > 0
                      ? ticketDetails.Tags.join(", ")
                      : "-"}
                  </span>
                </span>
              </div>
            )}

            {/* activeTab = 1 */}
            {activeTab === 1 &&
              data.length > 0 &&
              data.map((i: conversationData, index: number) => (
                <div key={index} className="bg-white">
                  <div className="max-w-full rounded-lg flex items-start justify-start p-4 gap-4">
                    <Avatar
                      sx={{
                        width: 34,
                        height: 34,
                        fontSize: 14,
                        bgcolor: Red.includes(
                          i.FromUser.toUpperCase().charAt(0)
                        )
                          ? "#DC3545"
                          : Blue.includes(i.FromUser.charAt(0))
                          ? "#0A58CA"
                          : Green.includes(i.FromUser.charAt(0))
                          ? "#02B89D"
                          : SkyBlue.includes(i.FromUser.charAt(0))
                          ? "#333333"
                          : "#664D03",
                      }}
                    >
                      {i.FromUser.split(" ")
                        .map((word: string) => word.charAt(0).toUpperCase())
                        .join("")}
                    </Avatar>
                    <div className="flex flex-col items-start justify-center w-full">
                      <div className="flex items-start justify-between mb-1 w-full">
                        <p
                          className={`flex ${
                            i.FromUser.length > 20 ? "flex-col" : "gap-2"
                          }`}
                        >
                          {i.FromUser.length > 50 ? (
                            <ColorToolTip
                              title={i.FromUser}
                              placement="top"
                              arrow
                            >
                              <b>{i.FromUser.slice(0, 50)}</b>
                            </ColorToolTip>
                          ) : (
                            <b>{i.FromUser}</b>
                          )}
                          <span>{i.ReceivedOn}</span>
                        </p>
                      </div>
                      <p className="break-all">From: {i.From}</p>
                      {i.Type !== 2 && <p className="break-all">To: {i.To}</p>}
                      {!!i.CC && <p className="break-all">Cc: {i.CC}</p>}
                      {!!i.BCC && <p className="break-all">Bcc: {i.BCC}</p>}
                      <p className="break-all">Subject: {i.Subject}</p>
                      <p
                        className="mt-2 !break-all"
                        dangerouslySetInnerHTML={{
                          __html: i.Body,
                        }}
                        style={{
                          wordBreak: "break-all",
                          maxWidth: "95%",
                          overflow: "auto",
                        }}
                      />
                      {/* <p
                        className="mt-2 !break-all w-full [&>*]:w-full [&>font>pre]:w-full pretag"
                        dangerouslySetInnerHTML={{
                          __html: i.Body,
                        }}
                        style={{
                          wordBreak: "break-all",
                        }}
                      /> */}
                      {!!i.Attachments &&
                        i.Attachments.length > 0 &&
                        i.Attachments.map((attachment: any, index: number) => (
                          <div
                            className="flex items-center justify-start gap-2 w-fit mt-2 border rounded-full py-2 px-4"
                            key={index}
                          >
                            <FileIcon fileName={attachment?.UserFileName} />
                            {attachment?.UserFileName}
                            <span
                              className="cursor-pointer"
                              onClick={() =>
                                getFileFromBlob(
                                  attachment?.SystemFileName,
                                  attachment?.UserFileName,
                                  true
                                )
                              }
                            >
                              <Download />
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ))}

            {/* activeTab = 2 */}
            {activeTab === 2 && commentData.length > 0 && (
              <div className="flex-grow px-4 mb-2 h-[85%] overflow-y-auto flex flex-col items-start justify-start gap-4">
                {commentData.map((comment: any, index: number) => (
                  <div
                    className="bg-white rounded-lg flex flex-col items-start justify-between p-4 gap-4 w-full"
                    key={index}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-4">
                        <Avatar
                          sx={{
                            width: 34,
                            height: 34,
                            fontSize: 14,
                            bgcolor: Red.includes(
                              comment.SubmitedByName.toUpperCase().charAt(0)
                            )
                              ? "#DC3545"
                              : Blue.includes(comment.SubmitedByName.charAt(0))
                              ? "#0A58CA"
                              : Green.includes(comment.SubmitedByName.charAt(0))
                              ? "#02B89D"
                              : SkyBlue.includes(
                                  comment.SubmitedByName.charAt(0)
                                )
                              ? "#333333"
                              : "#664D03",
                          }}
                        >
                          {comment.SubmitedByName.split(" ")
                            .map((word: string) => word.charAt(0).toUpperCase())
                            .join("")}
                        </Avatar>
                        <b>{comment.SubmitedByName}</b>
                        <span>|</span>
                        <span>
                          {!!comment.UpdatedOn
                            ? comment.UpdatedOn
                            : comment.SubmitedOn}
                        </span>
                      </div>
                    </div>
                    <div className="pl-12 ml-2 break-all">
                      {extractText(comment.Message).map((i: string) => {
                        const assignee = commentUserData.map(
                          (j: LabelValue) => j.label
                        );
                        return assignee.includes(i) ? (
                          <span className="text-secondary" key={index}>
                            {i}
                          </span>
                        ) : (
                          i
                        );
                      })}
                      {!!comment.Attachments &&
                        comment.Attachments.length > 0 &&
                        comment.Attachments.filter(
                          (attachment: any) => !attachment.IsRemoved
                        ).map((attachment: any, index: number) => (
                          <div
                            className="flex items-center justify-start gap-2 w-fit mt-2 border rounded-full py-2 px-4"
                            key={index}
                          >
                            <FileIcon fileName={attachment?.UserFileName} />
                            {attachment?.UserFileName}
                            {attachment?.uploading ? (
                              <div className="!w-fit m-0 p-0">
                                <Loading />
                              </div>
                            ) : (
                              <span
                                className="cursor-pointer"
                                onClick={() =>
                                  getFileFromBlob(
                                    attachment?.SystemFileName,
                                    attachment?.UserFileName,
                                    true
                                  )
                                }
                              >
                                <Download />
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {activeTab === 2 && commentData.length <= 0 && (
              <div className="flex-grow flex items-center justify-center h-[200px]">
                No comments yet.
              </div>
            )}

            {/* activetab === 3 */}
            {activeTab === 3 && (
              <Attachments ticketId={ticketId} activeTab={activeTab} />
            )}

            {/* activetab === 4 */}
            {activeTab === 4 && (
              <History ticketId={ticketId} activeTab={activeTab} />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default DrawerEmailbox;
