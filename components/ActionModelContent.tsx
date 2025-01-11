import { Models } from "node-appwrite";
import Thumbnul from "./Thumbnul";
import FormatedDateTime from "./FormatedDateTime";
import { convertFileSize, formatDateTime } from "@/lib/utils";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";

const ImageThumbnil = ({ file }: { file: Models.Document }) => (
  <div className="file-details-thumbnail">
    <Thumbnul type={file.type} extension={file.extension} url={file.url} />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{file.name}</p>
      <FormatedDateTime date={file.$createdAt} className="caption" />
    </div>
  </div>
);

const DetailsRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

export const FileDetails = ({ file }: { file: Models.Document }) => (
  <>
    <ImageThumbnil file={file} />
    <div className="space-y-4 px-2 pt-2">
      <DetailsRow label="Formate:" value={file.extension} />
      <DetailsRow label="Size:" value={convertFileSize(file.size)} />
      <DetailsRow label="Owner:" value={file.owner.fullName} />
      <DetailsRow label="last edit:" value={formatDateTime(file.$updatedAt)} />
    </div>
  </>
);

interface Props {
  file: Models.Document;
  OnInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({ file, OnInputChange, onRemove }: Props) => (
  <>
    <ImageThumbnil file={file} />

    <div className="share-wrapper">
      <p className="subtitle-2 pl-1 text-light-100">
        Share file with the other users
      </p>
      <Input type="text" onChange={e => OnInputChange(e.target.value.trim().split(','))} className="share-input-field" />
      <div className="pt-4">
        <div className="flex justify-between">
          <p className="subtitle-2 text-light-100">Shared with</p>
          <p className="subtitle-2 text-light-200">{file.users.length} Users</p>
        </div>
      </div>

      <ul className="pt-2">
        {file.users.map((email: string) => (
          <li key={email} className="flex items-center justify-between gap-2">
            <p className="subtitle-2">{email}</p>
            <Button onClick={() => onRemove(email)} className="share-remove-user">
              <Image
                src="/assets/icons/remove.svg"
                alt="Remove"
                width={24}
                height={24}
                className="remove-icon"
              />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  </>
);
