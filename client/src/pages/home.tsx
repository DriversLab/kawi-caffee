import { useAccount, useConnect, useBalance } from "wagmi";
import { userHasWallet } from "@civic/auth-web3";
import { UserButton, useUser } from "@civic/auth-web3/react";

// Separate component for the app content that needs access to hooks
const HomePage = () => {
  const userContext = useUser();
  const { connect, connectors } = useConnect();
  const { isConnected } = useAccount();
  const balance = useBalance({
    address: userHasWallet(userContext)
      ? (userContext.ethereum.address as `0x${string}`)
      : undefined,
  });

  // A function to connect an existing civic embedded wallet
  const connectExistingWallet = () => {
    return connect({
      connector: connectors?.[0],
    });
  };

  // A function that creates the wallet if the user doesn't have one already
  const createWallet = () => {
    if (userContext.user && !userHasWallet(userContext)) {
      // Once the wallet is created, we can connect it straight away
      return userContext.createWallet().then(connectExistingWallet);
    }
  };

  return (
    <>
      <UserButton />
      {userContext.user && (
        <div>
          {!userHasWallet(userContext) && (
            <p>
              <button onClick={createWallet}>Create Wallet</button>
            </p>
          )}
          {userHasWallet(userContext) && (
            <>
              <p>Wallet address: {userContext.ethereum.address}</p>
              <p>
                Balance:{" "}
                {balance?.data
                  ? `${(
                      BigInt(balance.data.value) / BigInt(1e18)
                    ).toString()} ${balance.data.symbol}`
                  : "Loading..."}
              </p>
              {isConnected ? (
                <p>Wallet is connected</p>
              ) : (
                <button onClick={connectExistingWallet}>Connect Wallet</button>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default HomePage;
