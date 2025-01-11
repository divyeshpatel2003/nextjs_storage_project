import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { convertFileSize, getFileTypesParams, getUsageSummary } from "@/lib/utils";
import { Models } from "node-appwrite";
import React from "react";

const Page = async ({ params,searchParams }: SearchParamProps) => {
  const page = ((await params)?.page as string) || "";
  // sorting url
  const sort = ((await searchParams)?.sort as string) || "";

  const types = getFileTypesParams(page) as FileType[]
  const files = await getFiles({types,sort})
  const totalSpaceUsed = await getTotalSpaceUsed()
  const usageSummary = getUsageSummary(totalSpaceUsed)
  const totalSpace = usageSummary.find((item) => item.url === `/${page}`);
    
  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{page}</h1>
        <div className="total-size-section">
          <p className="body-1">
            Total : <span className="h5">{convertFileSize(totalSpace?.size)}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort By:</p>
            <Sort/>
          </div>
        </div>
      </section>

      {/* Render the files */}
      {files.total > 0 ? (
        <section className="file-list">
          {files.documents.map((file: Models.Document) => (
              <Card key={file.$id} file={file} />
          ))}
        </section>
      ): (
        <p className="empty-list">No Files Uploaded</p>
      )}
    </div>
  );
};

export default Page;
