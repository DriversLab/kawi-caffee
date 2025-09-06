"use client";

import { UserButton, useUser } from "@civic/auth-web3/react";
import type { NextPage } from "next";
import { useCreateOtcQuery } from "~~/hooks/query/use-create-otc-query";

const Admin: NextPage = () => {
  const { data, refetch } = useCreateOtcQuery();
  const userContext = useUser();

  return (
    <div className="mainPhotoBG flex items-center justify-center max-h-screen min-h-screen bg-[url('/cafe-bg.jpg')] bg-cover bg-center text-white">
      <div className="bg-black bg-opacity-50 p-10 rounded-lg text-center shadow-lg max-w-md">
        <UserButton className="mx-auto" />
        {userContext.user && (
          <>
            <h1 className="text-4xl font-bold mt-10 font-serif">Admin Panel</h1>
            <p className="mb-6 text-lg">Manage your coffee empire here!</p>
            <span className="text-3xl font-white block">{data?.code}</span>
            <button
              className="mt-5 border px-5 py-1 border-white rounded-xl transition-all hover:bg-white hover:text-black cursor-pointer"
              onClick={() => refetch()}
            >
              Refetch
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Admin;
