"use server";

import { createAdminClient, createSessionClient } from "../appwrite";
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
    const newFiles = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.fileCollectionId,
        ID.unique(),
        fileDocuments
      )
      .catch(async (error: unknown) => {
        await storage.deleteFile(appwriteConfig.databaseId, bucketFile.$id);
        handleError(error, "Failed to create file document");
      });
    revalidatePath(path);
    return parseStringify(newFiles);
  } catch (error) {
    handleError(error, "Failed to upload File");
  }
};

const createQueries = (currentUser: Models.Document, types: string[], sort: string,searchText: string,limit?: number) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if(searchText) queries.push(Query.contains("name", searchText))
  if(limit)queries.push(Query.limit(limit))
  if(sort){
    const [sortBy,orderBy] = sort.split('-')

    queries.push(orderBy === "asc" ? Query.orderAsc(sortBy): Query.orderDesc(sortBy))
  }
  return queries;
};

export const getFiles = async ({ types = [] ,sort = "$createdAt-desc", searchText="",limit}: GetFilesProps) => {
  const { databases } = await createAdminClient();
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User not Found");

    const queries = createQueries(currentUser, types,sort,searchText, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      queries
    );

    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get Files");
  }
};

export const renameFiles = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  const { databases } = await createAdminClient();

  try {
    const newName = `${name}.${extension}`;
    const updateFile = databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      fileId,
      {
        name: newName,
      }
    );

    revalidatePath(path);
    return parseStringify(updateFile);
  } catch (error) {
    handleError(error, "Failed to rename File");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  const { databases ,storage} = await createAdminClient();

  try {
    
    const deleteFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      fileId,
    );

    if(deleteFile){
      await storage.deleteFile(appwriteConfig.bucketId,bucketFileId)
    }
    revalidatePath(path);
    return parseStringify({status : "success"});
  } catch (error) {
    handleError(error, "Failed to delete the File");
  }
};

export const updateFileUser = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  const { databases  } = await createAdminClient();

  try {
    const updatedUsers = databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      fileId,
      {
        users: emails
      }
    );
    console.log(updatedUsers)

    revalidatePath(path);
    return parseStringify(updatedUsers);
  } catch (error) {
    handleError(error, "Failed to Updated the file users");
  }
};


export const getTotalSpaceUsed = async () => {
  try {
    const {databases} = await createSessionClient()

    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error("User is not authenticated");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.fileCollectionId,
      [Query.equal("owner",[currentUser.$id])]     
    )

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      media: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file: Models.Document) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if(!totalSpace[fileType].latestDate || new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)){
        totalSpace[fileType].latestDate = file.$updatedAt
      }

    });
    return parseStringify(totalSpace)
  } catch (error) {
    handleError(error, "Failed to calculate the total space used");
  }
}