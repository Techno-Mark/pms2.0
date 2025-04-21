import OverLay from "@/components/common/OverLay";
import { callAPI } from "@/utils/API/callAPI";
import { Close } from "@mui/icons-material";
import { IconButton, Tooltip } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";

interface chatBotDrawerProps {
  onOpen: boolean;
  onClose: () => void;
  ticketId: number;
  trailId: number;
  setText: any;
  onReset: () => void;
}

interface chatBotData {
  role: "user" | "assistant";
  content: string;
}

const ChatBotDrawer: React.FC<chatBotDrawerProps> = ({
  onOpen,
  onClose,
  ticketId,
  trailId,
  setText,
  onReset,
}) => {
  const [chatBotData, setChatBotData] = useState<chatBotData[]>([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [promptText, setPromptText] = useState("");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatBotData]);

  const getEmailType = () => {
    const url = `${process.env.emailbox_api_url}/emailbox/getautoemailresponse`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setChatBotData(ResponseData.messages);
      } else {
        setChatBotData([]);
      }
    };

    callAPI(
      url,
      { TicketId: ticketId, TicketTrailId: trailId, isFullPreview: true },
      successCallback,
      "post"
    );
  };

  const handleSend = () => {
    if (!promptText.trim()) return;
    setLoading(true);

    const newUserMessage: chatBotData = {
      role: "user",
      content: promptText.trim(),
    };

    const url = `${process.env.emailbox_api_url}/emailbox/getimprovedemailresponse`;

    const successCallback = (
      ResponseData: any,
      error: boolean,
      ResponseStatus: string
    ) => {
      if (ResponseStatus === "Success" && error === false) {
        setChatBotData(ResponseData.messages);
        setPromptText("");
        setLoading(false);
      } else {
        setChatBotData([]);
        setPromptText("");
        setLoading(false);
      }
    };

    callAPI(
      url,
      { messages: [...chatBotData, newUserMessage] },
      successCallback,
      "post"
    );
  };

  useEffect(() => {
    onOpen && getEmailType();
  }, [onOpen]);

  const handleClose = () => {
    setChatBotData([]);
    setPromptText("");
    onReset();
  };

  return (
    <div
      className={`fixed top-0 right-0 z-30 h-screen w-[650px] border border-lightSilver bg-pureWhite transform ${
        onOpen ? "translate-x-0" : "translate-x-full"
      } transition-transform duration-300 ease-in-out flex flex-col`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-100 border-b border-lightSilver">
        <div className="text-lg font-medium">Chat bot</div>
        <Tooltip title="Close" placement="top" arrow>
          <IconButton className="mr-[4px]" onClick={handleClose}>
            <Close />
          </IconButton>
        </Tooltip>
      </div>

      {/* Scrollable Chat Content */}
      <div className="flex-1 overflow-y-auto px-10 py-4 text-darkCharcoal space-y-4">
        {chatBotData.length > 0 &&
          chatBotData.slice(1).map((msg: chatBotData, index: number) => (
            <div
              key={`${msg.role}-${index}`}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative max-w-[70%] p-4 rounded-xl shadow-md transition-all duration-300 group ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                <pre className="whitespace-pre-wrap select-text">
                  {msg.content}
                </pre>
              </div>
            </div>
          ))}
        <div ref={bottomRef} />
      </div>

      {/* Prompt Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (promptText.trim()) {
            handleSend();
          }
        }}
        className="border-t border-lightSilver p-4 flex items-center gap-2"
      >
        <input
          type="text"
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
        />
        <button
          type="submit"
          disabled={!promptText.trim()}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            promptText.trim()
              ? "!bg-blue-500 !text-white !hover:bg-blue-600"
              : "!bg-gray-300 !text-gray-600 cursor-not-allowed"
          }`}
        >
          Send
        </button>
      </form>

      {/* Optional overlay when loading */}
      {loading && <OverLay className="!-top-[1px] !-left-[1px]" />}
    </div>
  );
};

export default ChatBotDrawer;
