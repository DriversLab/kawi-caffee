import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CivicAuthProvider } from "@civic/auth-web3/react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./libs/wagmi";
import HomePage from "./pages/home";

const queryClient = new QueryClient();
const CLIENT_ID = import.meta.env.VITE_CIVIC_CLIENT_ID;
if (!CLIENT_ID) throw new Error("CLIENT_ID is required");

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <CivicAuthProvider clientId={CLIENT_ID}>
          <HomePage />
        </CivicAuthProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
}

export default App;
