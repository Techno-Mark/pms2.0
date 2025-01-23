import { BlobServiceClient } from "@azure/storage-blob";

export const getFileFromBlob = async (
  fileName: string,
  originalName: any,
  isEmail: boolean = false
) => {
  const storageAccount = process.env.storageName;
  const containerName: any = isEmail
    ? process.env.emailAttachment
    : process.env.attachment;
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

export const getFileFromBlobForZip = async (
  fileName: string
): Promise<Blob | null> => {
  try {
    const storageAccount = process.env.storageName;
    const containerName: any = process.env.emailAttachment;
    const sasToken = process.env.sasToken;

    const blobServiceClient = new BlobServiceClient(
      `https://${storageAccount}.blob.core.windows.net?${sasToken}`
    );
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);
    const downloadBlockBlobResponse = await blockBlobClient.download(0);

    if (downloadBlockBlobResponse.blobBody) {
      return await downloadBlockBlobResponse.blobBody;
    } else {
      console.error("Blob body is undefined for:", fileName);
      return null;
    }
  } catch (err) {
    console.error(`Error downloading blob: ${fileName}`, err);
    return null;
  }
};
