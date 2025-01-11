"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { Models } from "node-appwrite";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { deleteFile, renameFiles, updateFileUser } from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "./ActionModelContent";

const ActionDropDown = ({ file }: { file: Models.Document }) => {
  const [isModelOpen, setIsModelOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [fileName, setFileName] = useState(file.name);
  const [isLoading, setIsLoading] = useState(false);
  const [userEmails,setUserEmails] = useState<string[]>([])
  const path = usePathname();

  const closeAllModel = () => {
    setIsModelOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setFileName(file.name);
  };

  const handleRemoveUser = async (email :string) => {
    const updatedEmails = userEmails.filter(e => e !== email)
    const success = await updateFileUser({fileId: file.$id, emails: userEmails,path})

    if(success)setUserEmails(updatedEmails)
    setIsLoading(false)
  }
  const handleAction = async () => {
    if (!action) return;
    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFiles({
          fileId: file.$id,
          name: fileName,
          extension: file.extension,
          path,
        }),
        share: () => updateFileUser({fileId: file.$id, emails: userEmails, path}) ,
      delete: () => deleteFile({fileId: file.$id, bucketFileId:file.bucketFileId,path })
    };

    success = await actions[action.value as keyof typeof actions]();
    if (success) closeAllModel();
    setIsLoading(false);
  };

  const renderDialogContent = () => {
    if (!action) return;
    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />
          )}
          {
            value === "details" && <FileDetails file={file}/>
          }
          {
            value === "delete" && (
              <p className="delete-confirmation">
                Are you sure you want to delete <span className="delete-file-name">{file.name}</span>
              </p>
            )
          }
          {
            value === "share" && (
              <ShareInput file={file} OnInputChange={setUserEmails} onRemove={handleRemoveUser} />
            )
          }
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModel} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  className="animate-spin"
                  alt="loading"
                  width={24}
                  height={24}
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };
  return (
    <Dialog open={isModelOpen} onOpenChange={setIsModelOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dropdown"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);
                if (
                  ["rename", "share", "details", "delete"].includes(
                    actionItem.value
                  )
                ) {
                  setIsModelOpen(true);
                }
              }}
            >
              {actionItem.label === "download" ? (
                <Link
                  href={constructDownloadUrl(file.bucketId)}
                  download={file.name}
                  className="flex items-center gap-2"
                >
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.value}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.value}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropDown;
