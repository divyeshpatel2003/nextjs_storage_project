import React from "react";
import Search from "./Search";
import FileUploader from "./FileUploader";
import { Button } from "./ui/button";
import Image from "next/image";
import { signOutUser } from "@/lib/actions/user.action";

interface Props {
  accountId : string,
  $id: string
}

const Header = ({accountId,$id} : Props) => {
  return (
    <header className="header">
      <Search />

      <div className="header-wrapper">
        <FileUploader ownerId={$id} accountId={accountId}/>
        <Button type="submit" className="sign-out-button" onClick={async () =>{
          "use server"
            await signOutUser()
        }}>
          <Image
            src="/assets/icons/logout.svg"
            alt="logo"
            width={24}
            height={24}
            className="w-6"
          />
        </Button>
      </div>
    </header>
  );
};

export default Header;
