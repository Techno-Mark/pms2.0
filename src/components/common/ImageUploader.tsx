/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useRef, useCallback } from "react";
import FileIcon from "@/assets/icons/worklogs/FileIcon";
import { BlobServiceClient, BlockBlobClient } from "@azure/storage-blob";
import { Tooltip, TooltipProps, tooltipClasses } from "@mui/material";
import styled from "@emotion/styled";

export default function ImageUploader({ getData, isDisable, className }: any) {
  const handleImageChange = async (event: any) => {
    const fileData = event.target.files[0];
    const uuidv4 = () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          const r = (Math.random() * 16) | 0,
            v = c == "x" ? r : (r & 0x3) | 0x8;

          return v.toString(16);
        }
      );
    };
    const fileName = uuidv4().slice(0, 32);
    getData(fileData.name, fileName);
    if (fileData) {
      await uploadFileToBlob(fileData, fileName);
    }
  };

  const uploadFileToBlob = useCallback(
    async (file: any | null, newFileName: string) => {
      const storageAccount = process.env.storageName;
      const containerName: any = process.env.attachment;
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const ColorToolTip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} arrow classes={{ popper: className }} />
  ))(() => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: "#0281B9",
    },
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "#0281B9",
    },
  }));

  return (
    <div className="flex gap-2">
      {isDisable ? (
        <span
          className={`text-white cursor-pointer max-w-1 mt-6 ${className}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <FileIcon />
          <input
            disabled={isDisable}
            type="file"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
            ref={fileInputRef}
            className="input-field hidden"
            onChange={handleImageChange}
          />
        </span>
      ) : (
        <ColorToolTip title="Attachment" placement="top" arrow>
          <span
            className={`text-white cursor-pointer max-w-1 mt-6 ${className}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileIcon />
            <input
              type="file"
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx"
              ref={fileInputRef}
              className="input-field hidden"
              onChange={handleImageChange}
            />
          </span>
        </ColorToolTip>
      )}
    </div>
  );
}
