import ActionDropDown from "@/components/ActionDropDown";
import Chart from "@/components/Chart";
import FormatedDateTime from "@/components/FormatedDateTime";
import Thumbnul from "@/components/Thumbnul";
import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { Models } from "node-appwrite";

export default async function Dashboard() {
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);
  // summary
  const usageSummary = getUsageSummary(totalSpace);
  return (
    <div className="dashboard-container"> 
      <section>
        <Chart used={totalSpace.used} />

        {/* Uploaded file type summaries */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => (
            <Link
              key={summary.title}
              href={summary.url}
              className="dashboard-summary-card"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="summary-type-icon"
                  />
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>
                <h5 className="summary-type-title">{summary.title}</h5>
                <Separator className="bg-light-400" />
                <FormatedDateTime
                  date={summary.latestDate}
                  className="text-center"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      {/* Recent files uploaded */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
        {files.documents.length > 0 ? (
          files.documents.map((file: Models.Document) => (
            <Link
              href={file.url}
              target="_blank"
              key={file.$id}
              className="flex items-center gap-3"
            >
              <Thumbnul
                type={file.type}
                extension={file.extension}
                url={file.url}
              />

              <div className="recent-file-details">
                <div className="flex flex-col gap-1">
                  <p className="recent-file-name">{file.name}</p>
                  <FormatedDateTime
                    date={file.$createdAt}
                    className="caption"
                  />
                </div>
                <ActionDropDown file={file}/>
              </div>
            </Link>
          ))
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
}
