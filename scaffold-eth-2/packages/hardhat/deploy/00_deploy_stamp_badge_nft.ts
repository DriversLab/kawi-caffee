import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployStampBadgeNFT: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployer } = await hre.getNamedAccounts();
    const { deploy } = hre.deployments;

    const stampBadgeNFT = await deploy("StampBadgeNFT", {
        from: deployer,
        args: [],
        log: true,
        autoMine: true,
    });

    console.log("StampBadgeNFT deployed to:", stampBadgeNFT.address);
};

export default deployStampBadgeNFT;
deployStampBadgeNFT.tags = ["StampBadgeNFT"];
