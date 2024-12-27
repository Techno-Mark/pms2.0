"use client";
import React, { useRef, useState, useEffect } from "react";
import { Editor } from "primereact/editor";
import { Button } from "primereact/button";
import "primereact/resources/themes/saga-blue/theme.css"; // Theme CSS
import "primereact/resources/primereact.min.css"; // PrimeReact CSS
import "primeicons/primeicons.css"; // PrimeIcons CSS
import "quill/dist/quill.snow.css"; // Quill CSS
import TextBox from "@/assets/icons/TextBox";

const RicheTextEditor = ({ text, setText, textError, setTextError }: any) => {
  const [showPopup, setShowPopup] = useState(false);
  const editorRef: any = useRef(null);
  const popupRef: any = useRef(null);
  const buttonRef: any = useRef(null);

  const placeholders = [
    { label: "Ticket ID", value: "{{TicketID}}" },
    { label: "Subject", value: "{{Subject}}" },
    { label: "Description", value: "{{Description}}" },
    { label: "Ticket URL", value: "{{TicketURL}}" },
    { label: "Tag", value: "{{Tag}}" },
    { label: "Group name", value: "{{GroupName}}" },
    { label: "Assignee Name", value: "{{AssigneeName}}" },
    { label: "Assignee Email", value: "{{AssigneeEmail}}" },
    { label: "Status", value: "{{Status}}" },
    { label: "Priority", value: "{{Priority}}" },
    { label: "Ticket Type", value: "{{TicketType}}" },
    { label: "Due by Time", value: "{{DueByTime}}" },
    { label: "Client Email", value: "{{ClientEmail}}" },
    { label: "Client Name", value: "{{ClientName}}" },
  ];

  const handleTextChange = (e: { htmlValue: any }) => {
    setText(e.htmlValue || "");
    setTextError(false);
  };

  const handleInsertPlaceholder = (placeholder: string | any[]) => {
    if (editorRef.current) {
      const quill = editorRef.current.getQuill();
      const range = quill.getSelection();
      if (range) {
        // Insert placeholder at the current cursor position
        quill.insertText(range.index, placeholder, "user");
        // Move cursor immediately after the inserted placeholder
        quill.setSelection(range.index + placeholder.length, 0);
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
        <button className="ql-image" aria-label="Insert Image"></button>
        <select className="ql-color"></select>
        <select className="ql-background"></select>
        <button className="ql-clean" aria-label="Remove Style"></button>
        <button onClick={() => setShowPopup((prev) => !prev)} ref={buttonRef}>
          <TextBox />
        </button>
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
          style={{ height: "220px" }}
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
              width: "60%",
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
              {placeholders.map((placeholder) => (
                <li
                  key={placeholder.value}
                  style={{ flex: "0 0 calc(33% - 10px)" }}
                  className="hover:bg-gray-100 rounded-lg text-sm"
                >
                  <Button
                    label={placeholder.label}
                    onClick={() => handleInsertPlaceholder(placeholder.value)}
                    className="p-button-text"
                    style={{
                      padding: "5px",
                      fontSize: "14px",
                      background: "transparent",
                      textAlign: "center",
                      width: "100%",
                    }}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      {textError && text.trim().length > 2000 ? (
        <p className="text-red-500 mt-1">Text cannot exceed 2000 characters.</p>
      ) : (
        textError && (
          <p className="text-red-500 mt-1">This is a required field.</p>
        )
      )}
    </>
  );
};

export default RicheTextEditor;
