"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useVerifyOtcMutation } from "../../hooks/query/use-verify-otc-mutation";
import { UserButton, useUser } from "@civic/auth-web3/react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";

interface UserRecord {
  tokenId: number;
  stampBadgeId: number;
  timestamps: number[];
  mintPrice: bigint;
}

const Consumer: NextPage = () => {
  const userContext = useUser();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [myRecord, setMyRecord] = useState<UserRecord | null>(null);
  const [hasRecord, setHasRecord] = useState(false);
  const { address } = useAccount();
  const { mutateAsync: verifyOtc } = useVerifyOtcMutation();

  // localStorage functions
  const getStorageKey = useCallback((address: string) => `stamp_record_${address}`, []);

  const loadRecordFromStorage = useCallback(
    (userAddress: string) => {
      if (typeof window === "undefined") return null;
      try {
        const stored = localStorage.getItem(getStorageKey(userAddress));
        return stored ? JSON.parse(stored) : null;
      } catch (error) {
        console.error("Error loading record from localStorage:", error);
        return null;
      }
    },
    [getStorageKey],
  );

  const saveRecordToStorage = useCallback(
    (userAddress: string, record: UserRecord) => {
      if (typeof window === "undefined") return;
      try {
        localStorage.setItem(getStorageKey(userAddress), JSON.stringify(record));
      } catch (error) {
        console.error("Error saving record to localStorage:", error);
      }
    },
    [getStorageKey],
  );

  const addRecordToStorage = useCallback(
    (userAddress: string, level: number) => {
      const newRecord: UserRecord = {
        tokenId: Date.now(), // Use timestamp as unique ID
        stampBadgeId: level,
        timestamps: [Math.floor(Date.now() / 1000)],
        mintPrice: BigInt(0), // No cost in localStorage version
      };
      saveRecordToStorage(userAddress, newRecord);
      return newRecord;
    },
    [saveRecordToStorage],
  );

  const updateRecordInStorage = useCallback(
    (userAddress: string, level: number) => {
      const existingRecord = loadRecordFromStorage(userAddress);

      if (!existingRecord) {
        console.warn("No existing record found, creating new one");
        return addRecordToStorage(userAddress, level);
      }

      const updatedRecord: UserRecord = {
        ...existingRecord,
        stampBadgeId: level,
        timestamps: [...existingRecord.timestamps, Math.floor(Date.now() / 1000)],
      };

      saveRecordToStorage(userAddress, updatedRecord);
      return updatedRecord;
    },
    [loadRecordFromStorage, saveRecordToStorage, addRecordToStorage],
  );

  // Load record on component mount and when address changes
  useEffect(() => {
    if (address) {
      const record = loadRecordFromStorage(address);
      setMyRecord(record);
      setHasRecord(!!record);
    }
  }, [address, loadRecordFromStorage]);

  // Properly type and handle the record data
  const typedRecord = myRecord;
  const currentLevel = typedRecord?.stampBadgeId || 0;
  const isMaxLevel = currentLevel >= 11;

  const getStampImage = (level: number) => {
    if (level >= 11) {
      return "/stamps/free.png";
    }
    return `/stamps/${level}.png`;
  };

  const verifyAndUpgrade = async () => {
    if (!code || code.length !== 6) {
      setMessage("Please, input 6-symbol code");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      const res = await verifyOtc(code);

      if (res.data?.success !== true) {
        throw new Error("Invalid code");
      }

      let updatedRecord: UserRecord;

      if (!hasRecord || !myRecord) {
        // Create new record
        updatedRecord = addRecordToStorage(address, 1);
        setMessage("Congratulations! Your first stamp has been created!");
      } else {
        // Update existing record
        const newLevel = Math.min(currentLevel + 1, 11);
        updatedRecord = updateRecordInStorage(address, newLevel);

        if (newLevel === 11) {
          setMessage("🎉 Congratulations! You reached the maximum level and got free coffee!");
        } else {
          setMessage(`Great! Your level has been upgraded to ${newLevel}`);
        }
      }

      // Обновляем состояние
      setMyRecord(updatedRecord);
      setHasRecord(true);
      setCode("");
    } catch (error: any) {
      console.error("Error:", error);
      setMessage(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mainPhotoBG flex items-center justify-center max-h-screen min-h-screen bg-[url('/cafe-bg.jpg')] bg-cover bg-center text-white">
      <div className="bg-black bg-opacity-50 p-10 rounded-lg text-center shadow-lg max-w-md">
        <h1 className="text-4xl font-bold mb-6 font-serif">Consumer Dashboard</h1>
        <UserButton className="mx-auto" />
        {/* {(userContext as any)?.ethereum?.address} */}
        {userContext.user && (
          <>
            {hasRecord && typedRecord && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">Your Current Stamp</h2>
                <div className="flex justify-center mb-4">
                  <Image
                    src={getStampImage(currentLevel)}
                    alt={`Stamp Level ${currentLevel}`}
                    width={200}
                    height={200}
                    className="rounded-lg"
                  />
                </div>
                <p className="text-lg">
                  Level: {currentLevel}
                  {isMaxLevel && <span className="text-yellow-400 ml-2">🌟 MAXIMUM!</span>}
                </p>
              </div>
            )}

            <div className="mb-6">
              <p className="mb-4 text-lg">
                {hasRecord
                  ? isMaxLevel
                    ? "You already got your free coffee!"
                    : "Enter code to upgrade your level"
                  : "Enter code to create your first stamp"}
              </p>

              {!isMaxLevel && (
                <>
                  <input
                    value={code}
                    type="text"
                    onChange={e => setCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    className="w-full p-3 mb-4 text-black rounded-lg text-center text-lg border border-white bg-white"
                    disabled={isLoading}
                  />
                  <button
                    onClick={verifyAndUpgrade}
                    disabled={isLoading || !code || code.length !== 6}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isLoading ? "Processing..." : hasRecord ? "Upgrade Level" : "Create Stamp"}
                  </button>
                </>
              )}
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg ${
                  message.includes("Congratulations") || message.includes("Great") ? "bg-green-600" : "bg-red-600"
                }`}
              >
                {message}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Consumer;
