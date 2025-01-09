"use server";

import { createAdminClient } from "../appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "../appwrite/config";
import { ID, Models, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "../utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "./user.action";

const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  const { storage, databases } = await createAdminClient();
  try {
    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile
    );

    const fileDocuments = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };
    const newFiles = await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      ID.unique(),
      fileDocuments,
    ).catch(async (error : unknown) => {
      await storage.deleteFile(appwriteConfig.databaseId,bucketFile.$id)
      handleError(error,"Failed to create file document")
    });
    revalidatePath(path);
    return parseStringify(newFiles);
  } catch (error) {
    handleError(error, "Failed to upload File");
  }
};

const createQueries = (currentUser: Models.Document,types: string[]) => {
  const queries = [
    Query.or([
      Query.equal("owner",currentUser.$id),
      Query.contains("users",currentUser.email)
    ])
  ]
  return queries;
}

export const getFiles = async ({types}: GetFilesProps) => {
  const {databases} = await createAdminClient()
  try {
    const currentUser = await getCurrentUser()
    if(!currentUser)throw new Error("User not Found")

    const queries = createQueries(currentUser,types)

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      queries
    )
    
    return parseStringify(files)
  } catch (error) {
    handleError(error, "Failed to get Files")
  }
}
