"use client";
import React, { useRef, useState, useEffect } from "react";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css"; // Theme CSS
import "primereact/resources/primereact.min.css"; // PrimeReact CSS
import "primeicons/primeicons.css"; // PrimeIcons CSS
import "quill/dist/quill.snow.css"; // Quill CSS
import TextBox from "@/assets/icons/TextBox";
import { getTextLength } from "@/utils/commonFunction";
import FileIcon from "@/assets/icons/worklogs/FileIcon";
import { callAPI } from "@/utils/API/callAPI";

const RichTextEditor = ({
  text,
  setText,
  textError,
  setTextError,
  height = "220px",
  addImage = false,
  handleImageChange,
  placeholders = [],
  ChangeValue = false,
  ticketId,
}: any) => {
  const [showPopup, setShowPopup] = useState(false);
  const editorRef: any = useRef(null);
  const popupRef: any = useRef(null);
  const buttonRef: any = useRef(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: { htmlValue: any }) => {
    setText(e.htmlValue || "");
    setTextError(false);
  };

  const fetchPlaceholderValue = async (
    placeholder: string
  ): Promise<string> => {
    return new Promise((resolve) => {
      const url = `${process.env.emailbox_api_url}/emailbox/getslugvalue`;

      const successCallback = (
        ResponseData: string,
        error: boolean,
        ResponseStatus: string
      ) => {
        if (ResponseStatus === "Success" && error === false) {
          resolve(ResponseData);
        } else {
          resolve(placeholder);
        }
      };

      callAPI(
        url,
        {
          SlugKey: placeholder,
          TicketId: ticketId,
        },
        successCallback,
        "post"
      );
    });
  };

  const handleInsertPlaceholder = async (placeholder: string) => {
    let valueToInsert = placeholder;

    if (ChangeValue) {
      valueToInsert = await fetchPlaceholderValue(placeholder);
    }

    if (editorRef.current) {
      const quill = editorRef.current.getQuill();
      const range = quill.getSelection();
      if (range) {
        quill.insertText(range.index, valueToInsert, "user");
        quill.setSelection(range.index + valueToInsert.length, 0);
      }
    }
    setShowPopup(false);
  };

  const handleOutsideClick = (e: any) => {
    if (
      popupRef.current &&
      !popupRef.current.contains(e.target) &&
      !buttonRef.current.contains(e.target)
    ) {
      setShowPopup(false);
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

  const renderHeader = () => {
    return (
      <span className="ql-formats">
        <select className="ql-header" defaultValue="">
          <option value="1">Heading 1</option>
          <option value="2">Heading 2</option>
          <option value="">Normal</option>
        </select>
        <button className="ql-bold" aria-label="Bold"></button>
        <button className="ql-italic" aria-label="Italic"></button>
        <button className="ql-underline" aria-label="Underline"></button>
        <button
          className="ql-list"
          value="ordered"
          aria-label="Ordered List"
        ></button>
        <button
          className="ql-list"
          value="bullet"
          aria-label="Bullet List"
        ></button>
        <select className="ql-color"></select>
        <select className="ql-background"></select>
        <button className="ql-clean" aria-label="Remove Style"></button>
        {placeholders.length > 0 && (
          <button
            onClick={() => setShowPopup((prev) => !prev)}
            ref={buttonRef}
            className="w-fit"
          >
            <TextBox />
          </button>
        )}
        {addImage && (
          <button>
            <span
              className="text-white cursor-pointer max-w-1 mt-6"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileIcon />
              <input
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
                ref={fileInputRef}
                className="input-field hidden"
                onChange={handleImageChange}
                multiple
              />
            </span>
          </button>
        )}
      </span>
    );
  };

  const header = renderHeader();

  return (
    <>
      <div
        className={`card ${textError ? "border !border-red-500" : ""}`}
        style={{ position: "relative" }}
      >
        <Editor
          value={text}
          onTextChange={handleTextChange}
          headerTemplate={header}
          style={{ height: height }}
          ref={editorRef}
        />
        {showPopup && (
          <div
            ref={popupRef}
            style={{
              position: "absolute",
              top: buttonRef.current?.offsetTop + 20 || 0,
              right: 0,
              background: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
              padding: "10px",
              zIndex: 10,
              width: "75%",
            }}
          >
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {placeholders.length > 0 &&
                placeholders.map(
                  (placeholder: { label: string; value: string }) => (
                    <li
                      key={placeholder.value}
                      style={{ flex: "0 0 calc(33% - 10px)" }}
                      className="hover:bg-gray-100 rounded-lg text-sm"
                    >
                      <Button
                        label={placeholder.label}
                        onClick={() =>
                          handleInsertPlaceholder(placeholder.value)
                        }
                        className="p-button-text"
                        style={{
                          padding: "5px",
                          fontSize: "14px",
                          background: "transparent",
                          textAlign: "start",
                          width: "100%",
                        }}
                      />
                    </li>
                  )
                )}
            </ul>
          </div>
        )}
      </div>
      {textError && getTextLength(text.trim()) > 5000 ? (
        <p className="text-red-500 mt-1">Text cannot exceed 5000 characters.</p>
      ) : (
        textError && (
          <p className="text-red-500 mt-1">This is a required field.</p>
        )
      )}
    </>
  );
};

export default RichTextEditor;
