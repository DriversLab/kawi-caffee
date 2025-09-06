"use client";

import { useState } from "react";
import { formatEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function Home() {
  const [stampBadgeId, setStampBadgeId] = useState(1);

  // Read contract data
  const { data: mintPrice } = useScaffoldReadContract({
    contractName: "StampBadgeNFT",
    functionName: "calculateMintPrice",
  });

  // Write contract functions
  const { writeContractAsync: addRecord } = useScaffoldWriteContract({
    contractName: "StampBadgeNFT",
  });

  const handleAddRecord = async () => {
    try {
      await addRecord({
        functionName: "addRecord",
        args: [stampBadgeId as number, [BigInt(Math.floor(Date.now() / 1000))]],
        value: mintPrice,
      });
    } catch (error) {
      console.error("Error adding record:", error);
    }
  };

  return (
    <div className="flex flex-col items-center pt-10">
      <h1 className="text-4xl font-bold">Stamp Badge NFT Collection</h1>

      {/* Add your UI components here */}
      <div className="mt-8">
        <p>Current mint price: {mintPrice ? formatEther(mintPrice) : "Loading..."} ETH</p>

        <div className="mt-4">
          <input
            type="number"
            min="1"
            max="9"
            value={stampBadgeId}
            onChange={e => setStampBadgeId(Number(e.target.value))}
            placeholder="Badge ID (1-9)"
            className="border p-2 mr-2"
          />
          <button onClick={handleAddRecord} className="bg-blue-500 text-white px-4 py-2 rounded">
            Mint NFT
          </button>
        </div>
      </div>
    </div>
  );
}
