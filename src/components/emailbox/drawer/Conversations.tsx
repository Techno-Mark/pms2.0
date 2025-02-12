/* eslint-disable react-hooks/rules-of-hooks */
"use client";
import EmailTemplate from "@/assets/icons/emailBox/EmailTemplate";
import Forward from "@/assets/icons/emailBox/Forward";
import ReplayAll from "@/assets/icons/emailBox/ReplayAll";
import Reply from "@/assets/icons/emailBox/Reply";
import ThreeDot from "@/assets/icons/emailBox/ThreeDot";
import RichTextEditor from "@/components/common/RichTextEditor";
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import { Avatar, Button } from "@mui/material";
import MemberInput from "@/components/common/MemberInput";
import { getTextLength } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { toast } from "react-toastify";
import { CommentAttachment } from "@/utils/Types/worklogsTypes";
import { Close, Download } from "@mui/icons-material";
import FileIcon from "@/components/common/FileIcon";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import Loading from "@/assets/icons/reports/Loading";
import { getFileFromBlob } from "@/utils/downloadFile";
import EmailTemplateDrawer from "./EmailTemplateDrawer";
import DeleteDialog from "@/components/common/workloags/DeleteDialog";

interface conversationAttachment {
  AttachmentId: number;
  UserFileName: string;
  SystemFileName: string;
  AttachmentType: string;
  Type: number;
  ReferenceId: number;
  Path: string;
  WorkItemId: number;
}

interface conversationData {
  TrailId: number;
  From: string;
  To: string;
  CC: string | null;
  BCC: string | null;
  Subject: string;
  Body: string;
  isHTML: boolean;
  ReceivedOn: string;
  MessageId: string | null;
  InReplyTo: string | null;
  Attachments: conversationAttachment[] | null;
  Type: number;
  FromUser: string;
  IsDraft: boolean;
  IsInReview: boolean;
  HasPermission: boolean;
}

const Red = ["A", "F", "K", "P", "U", "Z"];
const Blue = ["B", "G", "L", "Q", "V"];
const Green = ["C", "H", "M", "R", "W"];
const SkyBlue = ["D", "I", "N", "S", "X"];

export interface ConversationDataContenRef {
  clearConversationData: () => void;
}

const Conversations = forwardRef<
  ConversationDataContenRef,
  {
    activeTab: number;
    ticketId: number;
    setOverlayOpen: any;
    getTicketDetails: () => void;
    ticketDetails: {
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
    };
    clientId: number;
    activeTabList: number;
    isDisabled: boolean;
    onClose: () => void;
    onDataFetch: (() => void) | null;
    allFieldsFilled: boolean;
  }
>(
  (
    {
      activeTab,
      ticketId,
      setOverlayOpen,
      getTicketDetails,
      ticketDetails,
      clientId,
      activeTabList,
      isDisabled,
      onClose,
      onDataFetch,
      allFieldsFilled,
    },
    ref
  ) => {
    const draftPlaceholders = ["Edit Draft", "Discard Draft", "Send Draft"];
    const approvalPlaceholders = ["Edit Mail", "Send Mail"];
    const [active, setActive] = useState(0);
    const [activeType, setActiveType] = useState("");
    const [trailId, setTrailId] = useState(0);
    const [showPopup, setShowPopup] = useState(0);
    const popupRef: any = useRef(null);
    const buttonRef: any = useRef(null);
    const isCalledRef = useRef(false);
    const [toMembers, setToMembers] = useState<string[]>([]);
    const [toInputValue, setToInputValue] = useState("");
    const [toInputValueError, setToInputValueError] = useState("");
    const [ccMembers, setCcMembers] = useState<string[]>([]);
    const [ccInputValue, setCcInputValue] = useState("");
    const [ccInputValueError, setCcInputValueError] = useState("");
    const [bccMembers, setBccMembers] = useState<string[]>([]);
    const [bccInputValue, setBccInputValue] = useState("");
    const [bccInputValueError, setBccInputValueError] = useState("");
    const [text, setText] = useState("");
    const [textError, setTextError] = useState(false);
    const [data, setData] = useState<conversationData[]>([]);
    const [sending, setSending] = useState(false);
    const [conversationAttachment, setConversationAttachment] = useState<any>(
      []
    );
    const [openEmailTemplate, setOpenEmailTemplate] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [deleteId, setDeleteId] = useState(0);

    const getConversationData = () => {
      const url = `${process.env.emailbox_api_url}/emailbox/GetTicketDetails`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          setData(ResponseData.ConversationDetails);
        } else {
          setData([]);
        }
      };

      callAPI(
        url,
        {
          TicketId: ticketId,
          TabId: 1,
          AttachmentType: 0,
          FromDate: null,
          ToDate: null,
        },
        successCallback,
        "post"
      );
    };

    useEffect(() => {
      if (activeTab === 1 && !isCalledRef.current) {
        getConversationData();
        isCalledRef.current = true;
      }
    }, [activeTab, ticketId]);

    const handleOutsideClick = (e: any) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setShowPopup(0);
      }
    };

    useEffect(() => {
      if (showPopup) {
        document.addEventListener("click", handleOutsideClick);
      } else {
        document.removeEventListener("click", handleOutsideClick);
      }
      return () => document.removeEventListener("click", handleOutsideClick);
    }, [showPopup]);

    const validateMailData = () => {
      let valid = false;
      if (toMembers.length <= 0) {
        setToInputValueError("Please provide an email address.");
        valid = true;
      }
      if (
        getTextLength(text.trim()) <= 0 ||
        getTextLength(text.trim()) > 5000
      ) {
        setTextError(true);
        valid = true;
      }
      return valid;
    };

    const handleImageChange = async (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      const files = event.target.files;
      if (!files) return;

      const uuidv4 = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0,
              v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          }
        );
      };

      Array.from(files).forEach((file) => {
        const fileSizeInMB = parseFloat((file.size / 1024 / 1024).toFixed(2));

        if (fileSizeInMB > 5) {
          toast.warning(`File ${file.name} exceeds the 5MB limit.`);
          return;
        }

        const fileName = uuidv4().slice(0, 32);
        const attachment = {
          Type: 3,
          AttachmentId: 0,
          WorkItemId: ticketId,
          ReferenceId: trailId,
          UserFileName: file.name,
          SystemFileName: fileName,
          Path: process.env.emailAttachment || "",
          uploading: true,
        };

        // Push the attachment immediately
        setConversationAttachment((prevAttachments: any) => [
          ...prevAttachments,
          attachment,
        ]);

        // Start the upload
        uploadFileToBlob(file, fileName)
          .then((response: any) => {
            if (response.status === 201) {
            }
          })
          .catch((error) => {
            console.error(`Error uploading file ${file.name}:`, error);
          })
          .finally(() => {
            setConversationAttachment((prevAttachments: any) =>
              prevAttachments.map((att: CommentAttachment) =>
                att.SystemFileName === fileName
                  ? { ...att, uploading: false }
                  : att
              )
            );
          });
      });
    };

    const uploadFileToBlob = useCallback(
      async (file: any | null, newFileName: string) => {
        const storageAccount = process.env.storageName;
        const containerName: any = process.env.emailAttachment;
        const sasToken = process.env.sasToken;

        const blobServiceClient = new BlobServiceClient(
          `https://${storageAccount}.blob.core.windows.net?${sasToken}`
        );
        const containerClient =
          blobServiceClient.getContainerClient(containerName);

        const blockBlobClient: BlockBlobClient =
          containerClient.getBlockBlobClient(newFileName);

        await blockBlobClient
          .uploadData(file, {
            blobHTTPHeaders: { blobContentType: file.type },
          })
          .then(async () => {})
          .catch((err) => console.error("err", err));
      },
      []
    );

    const handleDraftMail = (isDraft: boolean) => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
      if (
        !!toInputValueError ||
        !!ccInputValueError ||
        !!bccInputValueError ||
        textError ||
        validateMailData()
      )
        return;

      setSending(true);
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/SaveEmailDraftApproval`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success(
            isDraft
              ? "Email has been successfully saved as a draft."
              : "Email has been successfully sent for approval."
          );
          getConversationData();
          setOverlayOpen(false);
          (activeType !== "Edit Draft" || !isDraft) && onClose();
          (activeType !== "Edit Draft" || !isDraft) && onDataFetch?.();
          getTicketDetails();
          handleClearMailData();
        } else {
          setSending(false);
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          TicketId: ticketId,
          InReplyTo: !!data[active - 1].MessageId
            ? data[active - 1].MessageId
            : data[active - 1].InReplyTo,
          TicketTrailId:
            activeTabList === 3 || activeTabList === 4 ? trailId : 0,
          ApprovalId: ticketDetails.ApprovalId,
          To: toMembers.join(","),
          CC: ccMembers.join(","),
          BCC: bccMembers.join(","),
          Subject: data[active - 1].Subject || "",
          IsHtml: true,
          MailBody: text,
          TicketAttachments: conversationAttachment,
          IsDraft: isDraft,
          IsApproval: !isDraft,
        },
        successCallback,
        "post"
      );
    };

    const handleSubmitMail = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
      if (
        !!toInputValueError ||
        !!ccInputValueError ||
        !!bccInputValueError ||
        textError ||
        validateMailData()
      )
        return;

      setSending(true);
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/sendemail`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          handleClearMailData();
          toast.success("Email sent successfully.");
          getConversationData();
          setOverlayOpen(false);
          getTicketDetails();
          onClose();
          onDataFetch?.();
        } else {
          setSending(false);
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          OriginalMessageId: ticketDetails.OriginalMessgeId,
          InReplyTo: !!data[active - 1].MessageId
            ? data[active - 1].MessageId
            : data[active - 1].InReplyTo,
          To: toMembers.join(","),
          CC: ccMembers.join(","),
          BCC: bccMembers.join(","),
          Subject: data[active - 1].Subject,
          IsHtml: true,
          MailBody: text,
          TicketAttachments: conversationAttachment,
        },
        successCallback,
        "post"
      );
    };

    const handleSubmitDraftOrApproval = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
      if (
        !!toInputValueError ||
        !!ccInputValueError ||
        !!bccInputValueError ||
        textError ||
        validateMailData()
      )
        return;

      setSending(true);
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/SaveAndSendDraftApprovalEmail`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          handleClearMailData();
          toast.success("Email sent successfully.");
          getConversationData();
          setOverlayOpen(false);
          getTicketDetails();
          onClose();
          onDataFetch?.();
        } else {
          setSending(false);
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          OriginalMessageId: ticketDetails.OriginalMessgeId,
          InReplyTo: !!data[active - 1].MessageId
            ? data[active - 1].MessageId
            : data[active - 1].InReplyTo,
          To: toMembers.join(","),
          CC: ccMembers.join(","),
          BCC: bccMembers.join(","),
          Subject: data[active - 1].Subject,
          IsHtml: true,
          MailBody: text,
          TicketAttachments: conversationAttachment,
          TicketId: ticketId,
          TicketTrailId: trailId,
          IsApproval: activeTabList === 3,
          IsDraft: activeTabList === 4,
          ApprovalId: ticketDetails.ApprovalId,
        },
        successCallback,
        "post"
      );
    };

    const deleteDraftMail = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/DiscardDraftById`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          toast.success("Draft mail deleted successfully.");
          getConversationData();
          setOverlayOpen(false);
          getTicketDetails();
          setDeleteId(0);
          handleClearMailData();
          onClose();
          onDataFetch?.();
        } else {
          setTrailId(0);
          setDeleteId(0);
          setIsDeleteOpen(false);
          setActiveType("");
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          TicketTrailId: deleteId,
        },
        successCallback,
        "post"
      );
    };

    const submitMail = () => {
      if (!allFieldsFilled)
        return toast.warning("Please fill all mendatory details.");
      setOverlayOpen(true);

      const url = `${process.env.emailbox_api_url}/emailbox/SendDraftApprovalEmailById`;

      const successCallback = (
        ResponseData: any,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          activeType === "Send Draft" &&
            toast.success("Draft sent successfully.");
          activeType === "Send Mail" &&
            toast.success("Email sent successfully.");
          getConversationData();
          setOverlayOpen(false);
          getTicketDetails();
          setDeleteId(0);
          handleClearMailData();
          onClose();
          onDataFetch?.();
        } else {
          setTrailId(0);
          setDeleteId(0);
          setIsDeleteOpen(false);
          setActiveType("");
          setOverlayOpen(false);
        }
      };

      callAPI(
        url,
        {
          TicketTrailId: trailId,
          HasPermission: data.filter((i) => i.TrailId === trailId)[0]
            ?.HasPermission,
        },
        successCallback,
        "post"
      );
    };

    const handleClearMailData = (change: boolean = true) => {
      change && setActive(0);
      change && setActiveType("");
      setTrailId(0);
      setToMembers([]);
      setToInputValue("");
      setToInputValueError("");
      setCcMembers([]);
      setCcInputValue("");
      setCcInputValueError("");
      setBccMembers([]);
      setBccInputValue("");
      setBccInputValueError("");
      change && setText("");
      setTextError(false);
      setSending(false);
      setOpenEmailTemplate(false);
      change && setConversationAttachment([]);
    };

    const clearConversationData = async () => {
      await handleClearMailData();
    };

    useImperativeHandle(ref, () => ({
      clearConversationData,
    }));

    useEffect(() => {
      handleClearMailData();
    }, [activeTab]);

    useEffect(() => {
      // handleClearMailData(false);
      if (active > 0) {
        setCcMembers(
          data[active - 1].CC?.trim()
            ? data[active - 1].CC?.split(",") ?? []
            : []
        );
        setBccMembers(
          data[active - 1].BCC?.trim()
            ? data[active - 1].BCC?.split(",") ?? []
            : []
        );
        setTrailId(data[active - 1].TrailId || 0);
        if (activeType === "EmailTemplate") {
          setOverlayOpen(true);
          setOpenEmailTemplate(true);
        }
        if (activeType === "Edit Draft" || activeType === "Edit Mail") {
          setText(data[active - 1].Body || "");
          setToMembers(
            data[active - 1].To?.trim() ? data[active - 1].To.split(",") : []
          );
        } else {
          const fromMembers = data[active - 1].From?.trim()
            ? data[active - 1].From.split(",")
            : [];
          const toMembers = data[active - 1].To?.trim()
            ? data[active - 1].To.split(",")
            : [];

          setToMembers([
            ...fromMembers,
            ...toMembers.filter((to) => !fromMembers.includes(to)), // Remove duplicates
          ]);
        }
      }
    }, [active, activeType]);

    return (
      <>
        <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto bg-gray-100 w-full">
          {data.map((i: conversationData, index: number) => (
            <div key={index} className="bg-white">
              {active > 0 && active - 1 === index && (
                <div className="bg-white px-2 rounded-lg w-full break-all">
                  <p className="py-2 px-4">Email Reply</p>
                  <MemberInput
                    label="To"
                    members={toMembers}
                    setMembers={setToMembers}
                    inputValue={toInputValue}
                    setInputValue={setToInputValue}
                    error={toInputValueError}
                    setError={setToInputValueError}
                    validate={true}
                  />
                  <MemberInput
                    label="Cc"
                    members={ccMembers}
                    setMembers={setCcMembers}
                    inputValue={ccInputValue}
                    setInputValue={setCcInputValue}
                    error={ccInputValueError}
                    setError={setCcInputValueError}
                  />
                  <MemberInput
                    label="Bcc"
                    members={bccMembers}
                    setMembers={setBccMembers}
                    inputValue={bccInputValue}
                    setInputValue={setBccInputValue}
                    error={bccInputValueError}
                    setError={setBccInputValueError}
                  />
                  <RichTextEditor
                    text={text}
                    setText={setText}
                    textError={textError}
                    setTextError={setTextError}
                    height="120px"
                    addImage
                    handleImageChange={handleImageChange}
                    placeholders={[
                      { label: "Ticket ID", value: "{{TicketID}}" },
                      { label: "Ticket Subject", value: "{{TicketSubject}}" },
                      { label: "Ticket Priority", value: "{{TicketPriority}}" },
                      { label: "Ticket URL", value: "{{TicketURL}}" },
                      { label: "Tag", value: "{{Tag}}" },
                      { label: "Assignee Name", value: "{{AssigneeName}}" },
                      { label: "Assignee Email", value: "{{AssigneeEmail}}" },
                      { label: "Status", value: "{{Status}}" },
                      { label: "Ticket Type", value: "{{TicketType}}" },
                      { label: "Client Name", value: "{{ClientName}}" },
                      { label: "Client Email", value: "{{ClientEmail}}" },
                      { label: "Updated By", value: "{{UpdatedBy}}" },
                      { label: "SLA Due Time", value: "{{SLADueTime}}" },
                      {
                        label: "OrganizationName",
                        value: "{{OrganizationName}}",
                      },
                      { label: "Closed Date", value: "{{ClosedDate}}" },
                    ]}
                    ChangeValue={true}
                    ticketId={ticketId}
                  />
                  {conversationAttachment.length > 0 && (
                    <div className="flex flex-col items-start justify-center ml-5 gap-2 mt-4">
                      {conversationAttachment.map(
                        (attachment: any, index: number) => (
                          <div
                            className="flex items-center justify-center gap-2 border rounded-full py-1.5 px-4"
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
                                  setConversationAttachment(
                                    conversationAttachment.filter(
                                      (_: any, attachmentIndex: number) =>
                                        attachmentIndex !== index
                                    )
                                  )
                                }
                              >
                                <Close />
                              </span>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-end gap-4 py-4 border-b">
                    <Button
                      variant="outlined"
                      color="error"
                      className="rounded-[4px] !h-[36px]"
                      onClick={() => handleClearMailData()}
                    >
                      <span className="flex items-center justify-center px-[5px]">
                        Cancel
                      </span>
                    </Button>
                    {(activeTabList === 1 || activeTabList === 4) && (
                      <Button
                        variant="contained"
                        className={`rounded-[4px] !h-[36px] ${
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0) ||
                          sending
                            ? "cursor-not-allowed !bg-gray-300 !text-white"
                            : "cursor-pointer !bg-secondary"
                        }`}
                        onClick={() =>
                          sending ||
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0)
                            ? undefined
                            : handleDraftMail(true)
                        }
                        disabled={
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0) ||
                          sending
                        }
                      >
                        <span className="flex items-center justify-center px-[5px]">
                          Save as Draft
                        </span>
                      </Button>
                    )}
                    {i.HasPermission && (
                      <Button
                        variant="outlined"
                        className={`rounded-[4px] !h-[36px] ${
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0) ||
                          sending
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() => {
                          if (
                            sending ||
                            (conversationAttachment.length > 0 &&
                              conversationAttachment.filter(
                                (attachment: any) => attachment.uploading
                              ).length > 0)
                          ) {
                            undefined;
                          } else {
                            if (activeTabList === 1) {
                              handleSubmitMail();
                            } else {
                              handleSubmitDraftOrApproval();
                            }
                          }
                        }}
                        disabled={
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0) ||
                          sending
                        }
                      >
                        <span className="flex items-center justify-center px-[5px]">
                          Sent Email
                        </span>
                      </Button>
                    )}
                    {!i.HasPermission && (
                      <Button
                        variant="outlined"
                        color="warning"
                        className={`rounded-[4px] !h-[36px] ${
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0) ||
                          sending
                            ? "cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                        onClick={() =>
                          sending ||
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0)
                            ? undefined
                            : handleDraftMail(false)
                        }
                        disabled={
                          (conversationAttachment.length > 0 &&
                            conversationAttachment.filter(
                              (attachment: any) => attachment.uploading
                            ).length > 0) ||
                          sending
                        }
                      >
                        <span className="flex items-center justify-center px-[5px]">
                          Sent For Approval
                        </span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
              <div className="max-w-full rounded-lg flex items-start justify-start p-4 gap-4">
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    fontSize: 14,
                    bgcolor: Red.includes(i.FromUser.toUpperCase().charAt(0))
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
                        <ColorToolTip title={i.FromUser} placement="top" arrow>
                          <b>{i.FromUser.slice(0, 50)}</b>
                        </ColorToolTip>
                      ) : (
                        <b>{i.FromUser}</b>
                      )}
                      <span>{i.ReceivedOn}</span>
                    </p>
                    {(ticketDetails.Assignee ===
                      Number(localStorage.getItem("UserId")) ||
                      activeTabList === 3) &&
                      !isDisabled &&
                      !!ticketDetails &&
                      (ticketDetails.Status === 2 ||
                        ticketDetails.Status === 4 ||
                        ticketDetails.Status === 7) && (
                        <div className="flex items-center justify-center gap-3 relative">
                          {activeTabList === 1 && (
                            <>
                              <ColorToolTip
                                title="Email Template"
                                placement="top"
                                arrow
                              >
                                <p
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setActive(index + 1);
                                    // setTrailId(i.TrailId);
                                    setConversationAttachment([]);
                                    setActiveType("EmailTemplate");
                                  }}
                                >
                                  <EmailTemplate />
                                </p>
                              </ColorToolTip>
                              <ColorToolTip
                                title="ReplyAll"
                                placement="top"
                                arrow
                              >
                                <p
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setActive(index + 1);
                                    // setTrailId(i.TrailId);
                                    setConversationAttachment([]);
                                    setActiveType("ReplyAll");
                                  }}
                                >
                                  <ReplayAll />
                                </p>
                              </ColorToolTip>
                              <ColorToolTip
                                title="Forward"
                                placement="top"
                                arrow
                              >
                                <p
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setActive(index + 1);
                                    // setTrailId(i.TrailId);
                                    setConversationAttachment(
                                      !!i.Attachments ? i.Attachments : []
                                    );
                                    setActiveType("Forward");
                                  }}
                                >
                                  <Forward />
                                </p>
                              </ColorToolTip>
                            </>
                          )}
                          {((activeTabList === 4 && i.IsDraft) ||
                            (activeTabList === 3 &&
                              i.IsInReview &&
                              i.HasPermission)) && (
                            <p
                              className="cursor-pointer"
                              onClick={() => setShowPopup(i.TrailId)}
                              ref={buttonRef}
                            >
                              <ThreeDot />
                            </p>
                          )}
                          {i.TrailId === showPopup && (
                            <div
                              ref={popupRef}
                              style={{
                                position: "absolute",
                                top: 30,
                                right: 0,
                                background: "#fff",
                                border: "1px solid #ccc",
                                borderRadius: "4px",
                                boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
                                padding: "10px",
                                zIndex: 10,
                                width: "120px",
                              }}
                            >
                              <ul
                                style={{
                                  listStyle: "none",
                                  margin: 0,
                                  padding: 0,
                                  display: "flex",
                                  flexWrap: "wrap",
                                  gap: "2px",
                                }}
                              >
                                {(activeTabList === 4
                                  ? draftPlaceholders
                                  : activeTabList === 3 && i.HasPermission
                                  ? approvalPlaceholders
                                  : []
                                ).map((placeholder: string, j: number) => (
                                  <li
                                    key={j}
                                    className="hover:bg-gray-100 rounded-lg text-sm w-full py-1 px-2 break-all"
                                    onClick={() => {
                                      setShowPopup(0);
                                      setActiveType(placeholder);
                                      if (
                                        placeholder === "Edit Draft" ||
                                        placeholder === "Edit Mail"
                                      ) {
                                        setActive(index + 1);
                                        setConversationAttachment(
                                          !!i.Attachments ? i.Attachments : []
                                        );
                                      }
                                      if (
                                        placeholder === "Send Draft" ||
                                        placeholder === "Send Mail"
                                      ) {
                                        setTrailId(i.TrailId);
                                        setToMembers(
                                          i.From?.trim()
                                            ? i.From.split(",")
                                            : []
                                        );
                                        setCcMembers(
                                          i.CC?.trim()
                                            ? i.CC?.split(",") ?? []
                                            : []
                                        );
                                        setBccMembers(
                                          i.BCC?.trim()
                                            ? i.BCC?.split(",") ?? []
                                            : []
                                        );
                                        setText(i.Body ?? "");
                                        setIsDeleteOpen(true);
                                      }
                                      if (placeholder === "Discard Draft") {
                                        setDeleteId(i.TrailId);
                                        setIsDeleteOpen(true);
                                      }
                                    }}
                                  >
                                    {placeholder}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                  <p className="break-all">From: {i.From}</p>
                  {i.To && (
                    // i.Type !== 2
                    <p className="break-all">To: {i.To}</p>
                  )}
                  {!!i.CC && <p className="break-all">Cc: {i.CC}</p>}
                  {!!i.BCC && <p className="break-all">Bcc: {i.BCC}</p>}
                  <p className="break-all">Subject: {i.Subject}</p>
                  {/* <p
                    className="mt-2 !break-all"
                    dangerouslySetInnerHTML={{
                      __html: i.Body,
                    }}
                    style={{
                      wordBreak: 'break-all',
                      maxWidth:"100%",
                      overflow:"auto"
                    }}
                  /> */}
                  <p
                    className="mt-2 !break-all w-full [&>*]:w-full [&>font>pre]:w-full pretag"
                    dangerouslySetInnerHTML={{
                      __html: i.Body,
                    }}
                    style={{
                      wordBreak: "break-all",
                    }}
                  />
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
                          <ColorToolTip title="Download" placement="top" arrow>
                            <Download />
                          </ColorToolTip>
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <EmailTemplateDrawer
          onOpen={openEmailTemplate}
          onClose={() => {
            setOpenEmailTemplate(false);
            setOverlayOpen(false);
          }}
          onReset={() => {
            setActive(0);
            setTrailId(0);
            setConversationAttachment([]);
            setActiveType("");
          }}
          clientId={clientId}
          ticketId={ticketId}
          assigneeId={ticketDetails.Assignee}
          getConversationData={getConversationData}
          setText={setText}
        />
        <DeleteDialog
          isOpen={isDeleteOpen}
          onClose={() => {
            setIsDeleteOpen(false);
            setDeleteId(0);
            setActiveType("");
          }}
          onActionClick={() => {
            activeType === "Discard Draft" && deleteDraftMail();
            (activeType === "Send Draft" || activeType === "Send Mail") &&
              submitMail();
          }}
          Title={activeType}
          firstContent={`Are you sure you want to ${activeType}?`}
          secondContent={""}
          buttonContent={true}
        />
      </>
    );
  }
);

export default Conversations;
