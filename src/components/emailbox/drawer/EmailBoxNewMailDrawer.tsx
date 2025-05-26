import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  Tooltip,
} from "@mui/material";
import React, { useCallback, useState } from "react";
import { Close } from "@mui/icons-material";
import { callAPI } from "@/utils/API/callAPI";
import { ColorToolTip } from "@/utils/datatable/CommonStyle";
import DrawerOverlay from "@/components/settings/drawer/DrawerOverlay";
import { toast } from "react-toastify";
import MemberInput from "@/components/common/MemberInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import { CommentAttachment } from "@/utils/Types/worklogsTypes";
import Loading from "@/assets/icons/reports/Loading";
import FileIcon from "@/components/common/FileIcon";
import { getTextLength } from "@/utils/commonFunction";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";

interface EmailBoxNewMailDrawerProps {
  onOpen: boolean;
  onClose: () => void;
  onDataFetch: (() => void) | null;
  ticketId: number;
  activeTabPermission: boolean;
}

const todayPlus1 = dayjs().add(1, "day");
const todayPlus7 = dayjs().add(7, "day");

const EmailBoxNewMailDrawer: React.FC<EmailBoxNewMailDrawerProps> = ({
  onOpen,
  onClose,
  onDataFetch,
  ticketId,
  activeTabPermission,
}) => {
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [subjectError, setSubjectError] = useState("");
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
  const [followUp1, seFollowUp1] = useState<string>("");
  const [followUp2, seFollowUp2] = useState<string>("");
  const [followUp3, seFollowUp3] = useState<string>("");

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
        ReferenceId: 0,
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
    if (subject.trim().length <= 0) {
      setSubjectError("Please provide subject.");
      valid = true;
    }
    if (subject.trim().length > 250) {
      setSubjectError("Subject cannot exceed 250 characters.");
      valid = true;
    }
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
      !!subjectError ||
      !!toInputValueError ||
      !!ccInputValueError ||
      !!bccInputValueError ||
      textError ||
      validateMailData()
    )
      return;

    setSending(true);
    setOverlayOpen(true);

    const FollowUpDates = followUp1
      ? JSON.stringify({
          FollowUpDates: {
            FollowUpDates: {
              followUp1: dayjs(followUp1).format("YYYY-MM-DD"),
              followUp2: followUp2
                ? dayjs(followUp2).format("YYYY-MM-DD")
                : null,
              followUp3: followUp3
                ? dayjs(followUp3).format("YYYY-MM-DD")
                : null,
            },
            FollowUpCount: 0,
          },
        })
      : null;

    const url = `${process.env.emailbox_api_url}/emailbox/createInitialClientTicketFromUser`;

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
        setOverlayOpen(false);
        setSending(false);
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
        OriginalMessageId: null,
        To: toMembers.join(","),
        CC: ccMembers.join(","),
        BCC: bccMembers.join(","),
        Subject: subject.trim(),
        IsHtml: true,
        MailBody: text,
        TicketAttachments: conversationAttachment,
        FollowUpDates: FollowUpDates,
      },
      successCallback,
      "post"
    );
  };

  const handleClearMailData = () => {
    setSubject("");
    setSubjectError("");
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

  return (
    <>
      <Dialog
        open={onOpen}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        fullWidth
        maxWidth="md"
        className="z-20"
      >
        <DialogTitle id="alert-dialog-title">
          <div className="flex flex-row justify-between items-center">
            <span>Create New Email</span>
            <ColorToolTip title="Close" placement="top" arrow>
              <IconButton
                onClick={() => {
                  handleClearMailData();
                  onClose();
                }}
              >
                <Close />
              </IconButton>
            </ColorToolTip>
          </div>
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            className="border-y border-y-lightSilver w-full p-4"
          >
            <div className="py-2 px-4">
              <div className="flex items-start gap-3">
                <p>Subject:</p>
                <div className="flex items-center flex-wrap gap-2 flex-1">
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => {
                      setSubject(e.target.value);
                      setSubjectError("");
                    }}
                    placeholder="Enter Subject"
                    className="flex-grow border-none focus:ring-0 outline-none text-sm py-[2px]"
                  />
                </div>
              </div>
              {subjectError && (
                <p className="text-red-500 text-sm mt-2">{subjectError}</p>
              )}
            </div>
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
            <div className="flex items-center justify-start gap-4 py-4">
              {/* Follow-Up Date 1 */}
              <Grid item xs={3}>
                <div className={`inline-flex muiDatepickerCustomizer w-full`}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Follow-Up Date 1"
                      value={followUp1 === "" ? null : dayjs(followUp1)}
                      minDate={todayPlus1}
                      maxDate={
                        followUp2
                          ? dayjs(followUp2)
                              .subtract(1, "day")
                              .isAfter(todayPlus7)
                            ? todayPlus7
                            : dayjs(followUp2).subtract(1, "day")
                          : todayPlus7
                      }
                      onChange={(newDate: any) => {
                        seFollowUp1(newDate?.$d ?? "");
                        // Reset next dates if they conflict
                        if (
                          followUp2 &&
                          newDate &&
                          dayjs(newDate.$d).isAfter(dayjs(followUp2))
                        ) {
                          seFollowUp2("");
                          seFollowUp3("");
                        }
                      }}
                      slotProps={{
                        textField: {
                          readOnly: true,
                        } as Record<string, any>,
                      }}
                    />
                  </LocalizationProvider>
                </div>
              </Grid>

              {/* Follow-Up Date 2 */}
              {followUp1 && (
                <Grid item xs={3}>
                  <div className={`inline-flex muiDatepickerCustomizer w-full`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Follow-Up Date 2"
                        value={followUp2 === "" ? null : dayjs(followUp2)}
                        minDate={dayjs(followUp1).add(1, "day")}
                        maxDate={
                          followUp3
                            ? dayjs(followUp3)
                                .subtract(1, "day")
                                .isAfter(todayPlus7)
                              ? todayPlus7
                              : dayjs(followUp3).subtract(1, "day")
                            : todayPlus7
                        }
                        onChange={(newDate: any) => {
                          seFollowUp2(newDate?.$d ?? "");
                          if (
                            followUp3 &&
                            newDate &&
                            dayjs(newDate.$d).isAfter(dayjs(followUp3))
                          ) {
                            seFollowUp3("");
                          }
                        }}
                        slotProps={{
                          textField: {
                            readOnly: true,
                          } as Record<string, any>,
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </Grid>
              )}

              {/* Follow-Up Date 3 */}
              {followUp2 && (
                <Grid item xs={3}>
                  <div className={`inline-flex muiDatepickerCustomizer w-full`}>
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Follow-Up Date 3"
                        value={followUp3 === "" ? null : dayjs(followUp3)}
                        minDate={dayjs(followUp2).add(1, "day")}
                        maxDate={todayPlus7}
                        onChange={(newDate: any) => {
                          seFollowUp3(newDate?.$d ?? "");
                        }}
                        slotProps={{
                          textField: {
                            readOnly: true,
                          } as Record<string, any>,
                        }}
                      />
                    </LocalizationProvider>
                  </div>
                </Grid>
              )}
            </div>
          </DialogContentText>
        </DialogContent>
        <DialogActions className="mb-2">
          <Button
            variant="outlined"
            color="error"
            className="rounded-[4px] !h-[36px]"
            onClick={() => {
              handleClearMailData();
              onClose();
            }}
          >
            <span className="flex items-center justify-center px-[5px]">
              Cancel
            </span>
          </Button>
          {activeTabPermission && (
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
          )}
        </DialogActions>
      </Dialog>
      <DrawerOverlay
        isOpen={overlayOpen}
        className="!-top-[1px] !-left-[1px] !z-50"
        onClose={handleDrawerClose}
      />
    </>
  );
};

export default EmailBoxNewMailDrawer;
