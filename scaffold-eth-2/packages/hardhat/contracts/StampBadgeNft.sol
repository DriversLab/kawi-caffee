// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@redstone-finance/evm-connector/contracts/core/ProxyConnector.sol";

contract StampBadgeNFT is ERC721, Ownable, ProxyConnector {
    // Simple counter instead of Counters.Counter
    uint256 private _tokenIds;

    struct UserRecord {
        address userAddress;
        uint8 stampBadgeId; // 1-9
        uint256[] timestamps;
        uint256 mintPrice; // Price in wei when minted
        bool exists;
    }

    // Mapping from token ID to user record
    mapping(uint256 => UserRecord) public userRecords;

    // Mapping from user address to token ID
    mapping(address => uint256) public addressToTokenId;

    // Events
    event RecordAdded(uint256 indexed tokenId, address indexed user, uint8 stampBadgeId);
    event RecordUpdated(uint256 indexed tokenId, uint8 newStampBadgeId, uint256 timestamp);
    event RecordRemoved(uint256 indexed tokenId, address indexed user);
    event PriceUpdated(uint256 newPrice);

    // Minimum time between badge updates (1 hour)
    uint256 public constant MIN_UPDATE_INTERVAL = 1 hours;

    constructor() ERC721("StampBadgeCollection", "SBC") Ownable(msg.sender) {}

    /**
     * @dev Get ETH price in USD from RedStone oracle
     * Returns price with 8 decimals
     */
    function getEthPrice() public view returns (uint256) {
        // Temporary hardcoded price for testing - replace with actual oracle call
        return 2000 * 10 ** 8; // $2000 with 8 decimals
    }

    /**
     * @dev Calculate mint price based on current ETH price
     * Fixed price: $10 USD worth of ETH
     */
    function calculateMintPrice() public view returns (uint256) {
        uint256 ethPriceUSD = getEthPrice(); // Price in USD with 8 decimals
        uint256 targetPriceUSD = 10 * 10 ** 8; // $10 with 8 decimals

        // Calculate ETH amount needed: (targetPrice * 10^18) / ethPrice
        return (targetPriceUSD * 10 ** 18) / ethPriceUSD;
    }

    /**
     * @dev Validate timestamp using RedStone oracle time
     */
    function isValidTimestamp(uint256 timestamp) public view returns (bool) {
        // Temporary validation - replace with actual oracle time
        uint256 currentTime = block.timestamp;

        // Timestamp should not be in the future and not older than 30 days
        return timestamp <= currentTime && timestamp >= (currentTime - 30 days);
    }

    /**
     * @dev Add new user record and mint NFT
     */
    function addRecord(uint8 _stampBadgeId, uint256[] memory _timestamps) external payable returns (uint256) {
        require(_stampBadgeId >= 1 && _stampBadgeId <= 9, "Invalid stamp badge ID");
        require(_timestamps.length > 0, "Must provide at least one timestamp");
        require(addressToTokenId[msg.sender] == 0, "User already has a record");

        // Validate all timestamps
        for (uint i = 0; i < _timestamps.length; i++) {
            require(isValidTimestamp(_timestamps[i]), "Invalid timestamp");
        }

        // Calculate and check payment
        uint256 mintPrice = calculateMintPrice();
        require(msg.value >= mintPrice, "Insufficient payment");

        // Mint NFT - increment counter and mint
        _tokenIds++;
        uint256 newTokenId = _tokenIds;
        _mint(msg.sender, newTokenId);

        // Store user record
        userRecords[newTokenId] = UserRecord({
            userAddress: msg.sender,
            stampBadgeId: _stampBadgeId,
            timestamps: _timestamps,
            mintPrice: mintPrice,
            exists: true
        });

        addressToTokenId[msg.sender] = newTokenId;

        // Refund excess payment
        if (msg.value > mintPrice) {
            payable(msg.sender).transfer(msg.value - mintPrice);
        }

        emit RecordAdded(newTokenId, msg.sender, _stampBadgeId);
        return newTokenId;
    }

    /**
     * @dev Update existing user record
     */
    function editRecord(uint8 _newStampBadgeId, uint256 _newTimestamp) external {
        uint256 tokenId = addressToTokenId[msg.sender];
        require(tokenId != 0, "No record found for user");
        require(_newStampBadgeId >= 1 && _newStampBadgeId <= 9, "Invalid stamp badge ID");
        require(isValidTimestamp(_newTimestamp), "Invalid timestamp");

        UserRecord storage record = userRecords[tokenId];

        // Check minimum interval since last update
        if (record.timestamps.length > 0) {
            uint256 lastTimestamp = record.timestamps[record.timestamps.length - 1];
            require(_newTimestamp >= lastTimestamp + MIN_UPDATE_INTERVAL, "Update too frequent");
        }

        record.stampBadgeId = _newStampBadgeId;
        record.timestamps.push(_newTimestamp);

        emit RecordUpdated(tokenId, _newStampBadgeId, _newTimestamp);
    }

    /**
     * @dev Remove user record and burn NFT
     */
    function removeRecord() external {
        uint256 tokenId = addressToTokenId[msg.sender];
        require(tokenId != 0, "No record found for user");

        address userAddress = msg.sender;

        // Clean up mappings
        delete userRecords[tokenId];
        delete addressToTokenId[msg.sender];

        // Burn NFT
        _burn(tokenId);

        emit RecordRemoved(tokenId, userAddress);
    }

    /**
     * @dev Get user record by token ID
     */
    function getRecord(
        uint256 tokenId
    ) external view returns (address userAddress, uint8 stampBadgeId, uint256[] memory timestamps, uint256 mintPrice) {
        require(userRecords[tokenId].exists, "Record does not exist");
        UserRecord memory record = userRecords[tokenId];

        return (record.userAddress, record.stampBadgeId, record.timestamps, record.mintPrice);
    }

    /**
     * @dev Get user's own record
     */
    function getMyRecord()
        external
        view
        returns (uint256 tokenId, uint8 stampBadgeId, uint256[] memory timestamps, uint256 mintPrice)
    {
        tokenId = addressToTokenId[msg.sender];
        require(tokenId != 0, "No record found for user");

        UserRecord memory record = userRecords[tokenId];
        return (tokenId, record.stampBadgeId, record.timestamps, record.mintPrice);
    }

    /**
     * @dev Check if user has a record
     */
    function hasRecord(address user) external view returns (bool) {
        return addressToTokenId[user] != 0;
    }

    /**
     * @dev Get total supply of minted NFTs
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIds;
    }

    /**
     * @dev Withdraw contract balance (owner only)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }

    /**
     * @dev Override tokenURI to provide metadata
     */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "URI query for nonexistent token");

        UserRecord memory record = userRecords[tokenId];

        // Simple JSON metadata
        return
            string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(
                        bytes(
                            string(
                                abi.encodePacked(
                                    '{"name":"Stamp Badge Collection #',
                                    Strings.toString(tokenId),
                                    '","description":"Achievement collection with badge level ',
                                    Strings.toString(record.stampBadgeId),
                                    '","attributes":[{"trait_type":"Badge Level","value":"',
                                    Strings.toString(record.stampBadgeId),
                                    '"},{"trait_type":"Timestamps Count","value":"',
                                    Strings.toString(record.timestamps.length),
                                    '"}]}'
                                )
                            )
                        )
                    )
                )
            );
    }
}

// Base64 encoding library
library Base64 {
    bytes internal constant TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        uint256 encodedLen = 4 * ((len + 2) / 3);

        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF))
                out := shl(8, out)
                out := add(out, and(mload(add(tablePtr, and(input, 0x3F))), 0xFF))
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}
