"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { userHasWallet } from "@civic/auth-web3";
import { UserButton, useUser } from "@civic/auth-web3/react";
import type { NextPage } from "next";
import { useConnect } from "wagmi";

const Home: NextPage = () => {
  const userContext = useUser();
  const { connect, connectors } = useConnect();
  const navigation = useRouter();

  // A function to connect an existing civic embedded wallet
  const connectExistingWallet = () => {
    console.log("Connectors", connectors);
    return connect({
      connector: connectors?.[0],
    });
  };

  const createWallet = async () => {
    console.log("context", userHasWallet(userContext));
    if (userContext.user && !userHasWallet(userContext)) {
      try {
        // Once the wallet is created, we can connect it straight away
        await userContext.createWallet().then(connectExistingWallet);
      } catch (error) {
        console.error("Error creating wallet:", error);
      }
    }
  };

  useEffect(() => {
    createWallet();
  }, [userContext.user]);

  useEffect(() => {
    // Fixed: Don't return null, just return nothing (undefined)
    if (!userContext.user) {
      return; // This returns undefined, which is correct
    }

    if (userContext.user?.email === "kingdruid1962@gmail.com") {
      navigation.push("/admin");
    } else {
      navigation.push("/consumer");
    }
  }, [userContext.user, navigation]); // Added navigation to dependencies

  return (
    <>
      <div className="mainPhotoBG flex items-center justify-center max-h-screen min-h-screen bg-[url('/cafe-bg.jpg')] bg-cover bg-center text-white">
        <div className="bg-black bg-opacity-50 p-10 rounded-lg text-center shadow-lg">
          <h1 className="text-4xl font-bold mb-6 font-serif">Welcome to KawiCaffé</h1>
          <p className="mb-6 text-lg">A place where every cup is a work of art</p>
          <UserButton className="mx-auto bg-[#c49b66] hover:bg-[#a37a4f] transition-colors px-6 py-3 rounded-full text-white font-semibold" />
        </div>
      </div>
    </>
  );
};

export default Home;
