import { Avatar, Button, IconButton, Tooltip } from "@mui/material";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Close } from "@mui/icons-material";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import { toast } from "react-toastify";
import MemberInput from "@/components/common/MemberInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import { CommentAttachment } from "@/utils/Types/worklogsTypes";
import Loading from "@/assets/icons/reports/Loading";
import FileIcon from "@/components/common/FileIcon";
import { getTextLength } from "@/utils/commonFunction";
import { callAPI } from "@/utils/API/callAPI";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import Download from "@/assets/icons/Import/Download";
import ReplayAll from "@/assets/icons/emailBox/ReplayAll";
import Forward from "@/assets/icons/emailBox/Forward";
import { getFileFromBlob } from "@/utils/downloadFile";

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
  SentError: string | null;
  Exception: string | null;
}

const Red = ["A", "F", "K", "P", "U", "Z"];
const Blue = ["B", "G", "L", "Q", "V"];
const Green = ["C", "H", "M", "R", "W"];
const SkyBlue = ["D", "I", "N", "S", "X"];

interface EmailBoxNewMailEditDrawerProps {
  onOpen: boolean;
  onClose: () => void;
  onDataFetch: (() => void) | null;
  ticketId: number;
  activeTabPermission: boolean;
}

const EmailBoxNewMailEditDrawer: React.FC<EmailBoxNewMailEditDrawerProps> = ({
  onOpen,
  onClose,
  onDataFetch,
  ticketId,
  activeTabPermission,
}) => {
  const isCalledRef = useRef(false);
  const [active, setActive] = useState(0);
  const [activeType, setActiveType] = useState("");
  const [trailId, setTrailId] = useState(0);
  const [overlayOpen, setOverlayOpen] = useState(false);
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
  const [sending, setSending] = useState(false);
  const [conversationAttachment, setConversationAttachment] = useState<any>([]);
  const [blockedMail, setBlockedMail] = useState<any[]>([]);
  const [conversationDetails, setConversationDetails] = useState<any>([]);
  const [status, setStatus] = useState(0);
  const [originalMessgeId, setOriginalMessageId] = useState("");

  const getConversationData = () => {
    const url = `${process.env.emailbox_api_url}/emailbox/getNewMailById`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setConversationDetails(ResponseData.ConversationDetails);
        setStatus(ResponseData.StatusAndOriginalMessageId.Status);
        setOriginalMessageId(
          ResponseData.StatusAndOriginalMessageId.OriginalMessageId
        );
      } else {
        setConversationDetails([]);
      }
      isCalledRef.current = false;
    };

    callAPI(url, { TicketId: ticketId }, successCallback, "post");
  };

  useEffect(() => {
    if (!isCalledRef.current) {
      getConversationData();
      isCalledRef.current = true;
    }
  }, [ticketId]);

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

  const validateMailData = () => {
    let valid = false;
    if (toMembers.length <= 0) {
      setToInputValueError("Please provide an email address.");
      valid = true;
    }
    if (getTextLength(text.trim()) <= 0 || getTextLength(text.trim()) > 5000) {
      setTextError(true);
      valid = true;
    }
    return valid;
  };

  const handleSubmitMail = () => {
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
      ResponseStatus: string,
      ErrorData: {
        ErrorCode: string;
        Error: string;
        ErrorDetail: any;
      }
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        handleClearMailData();
        toast.success("Email sent successfully.");
        getConversationData();
        setOverlayOpen(false);
        getConversationData();
        onClose();
        onDataFetch?.();
      } else {
        Array.isArray(ErrorData.ErrorDetail) && ErrorData.ErrorDetail.length > 0
          ? setBlockedMail(ErrorData.ErrorDetail)
          : setBlockedMail([]);
        setSending(false);
        setOverlayOpen(false);
      }
    };

    callAPI(
      url,
      {
        OriginalMessageId: originalMessgeId,
        InReplyTo: !!conversationDetails[active - 1].MessageId
          ? conversationDetails[active - 1].MessageId
          : conversationDetails[active - 1].InReplyTo,
        To: toMembers.join(","),
        CC: ccMembers.join(","),
        BCC: bccMembers.join(","),
        Subject: conversationDetails[active - 1].Subject,
        IsHtml: true,
        MailBody: text,
        TicketAttachments: conversationAttachment,
      },
      successCallback,
      "post"
    );
  };

  const handleClearMailData = () => {
    setActive(0);
    setActiveType("");
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
    setText("");
    setTextError(false);
    setSending(false);
    setConversationAttachment([]);
    setBlockedMail([]);
  };

  const handleDrawerClose = () => {
    setOverlayOpen(false);
  };

  useEffect(() => {
    if (active > 0) {
      setCcMembers(
        conversationDetails[active - 1].CC?.trim()
          ? conversationDetails[active - 1].CC?.split(",") ?? []
          : []
      );
      setBccMembers(
        conversationDetails[active - 1].BCC?.trim()
          ? conversationDetails[active - 1].BCC?.split(",") ?? []
          : []
      );
      setTrailId(conversationDetails[active - 1].TrailId || 0);
      if (activeType === "Edit Draft" || activeType === "Edit Mail") {
        setText(conversationDetails[active - 1].Body || "");
        setToMembers(
          conversationDetails[active - 1].To?.trim()
            ? conversationDetails[active - 1].To.split(",")
            : []
        );
      } else {
        const fromMembers = conversationDetails[active - 1].From?.trim()
          ? conversationDetails[active - 1].From.split(",")
          : [];
        const toMembers = conversationDetails[active - 1].To?.trim()
          ? conversationDetails[active - 1].To.split(",")
          : [];

        setToMembers([
          ...fromMembers,
          ...toMembers.filter((to: any) => !fromMembers.includes(to)),
        ]);
      }
    }
  }, [active, activeType]);

  return (
    <div
      className={`fixed top-0 right-0 z-30 h-screen w-[85vw] border border-lightSilver bg-pureWhite transform ${
        onOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out `}
    >
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-lightSilver">
        <div className="flex items-center gap-6">
          <span className="font-bold text-lg">New Email</span>
        </div>
        <Tooltip title="Close" placement="top" arrow>
          <IconButton
            className="mr-[4px]"
            onClick={() => {
              handleClearMailData();
              onClose();
            }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </div>

      <div
        className="w-[100%] flex items-center justify-center bg-gray-100 overflow-y-auto"
        style={{ height: "calc(100% - 73px)" }}
      >
        <div className={`w-[95%] h-full flex flex-col`}>
          {conversationDetails.map((i: conversationData, index: number) => (
            <div key={index} className="bg-white mt-10">
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
                    blockedMail={blockedMail}
                  />
                  <MemberInput
                    label="Cc"
                    members={ccMembers}
                    setMembers={setCcMembers}
                    inputValue={ccInputValue}
                    setInputValue={setCcInputValue}
                    error={ccInputValueError}
                    setError={setCcInputValueError}
                    blockedMail={blockedMail}
                  />
                  <MemberInput
                    label="Bcc"
                    members={bccMembers}
                    setMembers={setBccMembers}
                    inputValue={bccInputValue}
                    setInputValue={setBccInputValue}
                    error={bccInputValueError}
                    setError={setBccInputValueError}
                    blockedMail={blockedMail}
                  />
                  <RichTextEditor
                    text={text}
                    setText={setText}
                    textError={textError}
                    setTextError={setTextError}
                    height="120px"
                    addImage
                    handleImageChange={handleImageChange}
                    placeholders={[]}
                    ChangeValue={true}
                    ticketId={ticketId}
                  />
                  {conversationAttachment.length > 0 && (
                    <div
                      className={`flex flex-col items-start justify-center ml-5 gap-2 mt-4 ${
                        conversationDetails.length - 1 === index ? "mb-4" : ""
                      }`}
                    >
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
                          handleSubmitMail();
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
                  </div>
                </div>
              )}
              <div className="w-full rounded-lg flex items-start justify-start p-4 gap-4">
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
                <div className="flex flex-col items-start justify-center w-full max-w-[95%]">
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
                    {
                      <div className="flex items-center justify-center gap-3 relative">
                        {activeTabPermission && status !== 10 && (
                          <>
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
                            <ColorToolTip title="Forward" placement="top" arrow>
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
                      </div>
                    }
                  </div>
                  <p className="break-all">From: {i.From}</p>
                  {i.To && <p className="break-all">To: {i.To}</p>}
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
                      maxWidth: "98%",
                      overflow: "auto",
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
      </div>

      <DrawerOverlay
        isOpen={overlayOpen}
        className="!-top-[1px] !-left-[1px]"
        onClose={handleDrawerClose}
      />
    </div>
  );
};

export default EmailBoxNewMailEditDrawer;
