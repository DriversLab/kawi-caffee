ETHWarsaw 2025
---
### Project Name: KawiCaffé
Is a one-of-a-kind Warsaw café where you can enjoy delicious coffee and support the cryptocurrency community.
It's the perfect place to learn about Web3, pay with the cryptocurrency, and mingle with a progressive community

[TaiKai](https://taikai.network/ethwarsaw/hackathons/ethwarsaw-2025/projects/cmf8p6vog01gb9gzuquszi3po/idea)

### Tech
**Chain**: Arbitrum

**DB**: GolemDB

**SmartContract** Scaffold-ETH framework used

**Auth** Civic for AA auth

**RedStone** on validate data from smart contract side

Client: Next Js + Typescipt
Backend ( for validate code and generation with role based middleware ): Nest Js
SmartContracts Solidity

# 🚀 Project Launch

## Backend

### Environment Setup

Navigate to the backend directory:
```bash
cd backend
```

Install dependencies:
```bash
pnpm install
```

### Configuration

Create a `.env` file based on `.env.example` and fill in the required variables.

### Service Launch

Make sure the local Redis server is running:
```bash
redis-server
```

Start the backend:
```bash
pnpm start
```

## 🧱 Frontend

### Project Setup

Navigate to the scaffold-eth-2 directory:
```bash
cd scaffold-eth-2
```

Install dependencies:
```bash
yarn install
```

### Next.js Application Setup

Navigate to the Next.js subproject:
```bash
cd packages/nextjs
```

Create `.env.local` (or `.env`) based on `.env.example` and fill in the variables.

### Application Launch

Start the frontend:
```bash
yarn start
```

