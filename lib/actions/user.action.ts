"use server"
import { ID, Query } from "node-appwrite"
import { createAdminClient } from "../appwrite"
import { appwriteConfig } from "../appwrite/config"
import { parseStringyfy } from "../utils"
import { cookies } from "next/headers"

export const getUserByMail = async (email: string) => {
    const {databases} = await createAdminClient()
    const result = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.userCollectionId,
        [Query.equal("email",[email])]
    )

    return result.total > 0 ? result.documents[0] : null
}

const handleError = async (error:unknown, message:unknown) => {
    console.log(error, message)
    throw error
}

export const sendEmailOTP = async (email : string) => {
    const {account} = await createAdminClient()

    try {
        const session = await account.createEmailToken(ID.unique(), email)
        return session.userId;
    } catch (error) {
        handleError(error, "failed to send email OTP")
    }
}

export const createAccount = async ({email,fullName}: {email:string, fullName: string}) => {
    const existingUser = await getUserByMail(email)
    
    const accountId = await sendEmailOTP(email)

    if(!accountId) throw new Error("Failed to send Email OTP")
    
    if(!existingUser){
        const {databases} = await createAdminClient()

        await databases.createDocument(
            appwriteConfig.databaseId,
            appwriteConfig.userCollectionId,
            ID.unique(),
            {
                fullName,
                email,
                avatar: "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg",
                accountId
            }
        )
    }
    return parseStringyfy({accountId})
}

export const verifySecret = async ({accountId, password}: {accountId: string, password: string}) => {
    try {
        const {account} = await createAdminClient();
        const session = await account.createSession(accountId,password);
        (await cookies()).set("appwrite-session",session.secret,{
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true
        })
        return parseStringyfy({sessionId: session.$id})
    } catch (error) {
        handleError(error, "Failed to verify the OTP")
    }
}