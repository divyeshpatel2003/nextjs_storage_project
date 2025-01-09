import Sort from "@/components/Sort";
import { getFiles } from "@/lib/actions/file.actions";
import { getFileTypesParams } from "@/lib/utils";
import React from "react";

const Page = async ({ params }: SearchParamProps) => {
  const page = ((await params)?.page as string) || "";

  const types = getFileTypesParams(page)
  const files = await getFiles({types})

  console.log(files)
  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{page}</h1>
        <div className="total-size-section">
          <p className="body-1">
            Total : <span className="h5">0 MB</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort By:</p>
            <Sort/>
          </div>
        </div>
      </section>

      {/* Render the files */}

    </div>
  );
};

export default Page;
