import { createConfig, http } from 'wagmi'
import { embeddedWallet } from "@civic/auth-web3/wagmi";
import { arbitrumSepolia, arbitrum } from 'wagmi/chains'

export const wagmiConfig = createConfig({
    chains: [arbitrum, arbitrumSepolia],
    transports: {
        [arbitrum.id]: http(),
        [arbitrumSepolia.id]: http(),
    },
    connectors: [
        embeddedWallet(),
    ],
})
