import { BlobServiceClient } from "@azure/storage-blob";

export const getFileFromBlob = async (fileName: string, originalName: any) => {
  const storageAccount = process.env.storageName;
  const containerName: any = process.env.attachment;
  const sasToken = process.env.sasToken;

  const blobServiceClient = new BlobServiceClient(
    `https://${storageAccount}.blob.core.windows.net?${sasToken}`
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blockBlobClient = containerClient.getBlockBlobClient(fileName);
  const downloadBlockBlobResponse = await blockBlobClient.download(0);

  if (downloadBlockBlobResponse.blobBody) {
    const url = URL.createObjectURL(await downloadBlockBlobResponse.blobBody);
    const a = document.createElement("a");
    a.href = url;
    a.download = originalName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } else {
    console.error("Blob body is undefined");
  }
};
