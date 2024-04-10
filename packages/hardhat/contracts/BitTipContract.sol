// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
contract BitTipContract {
	address payable public platformOwner;
	uint8 public platformFeePercentage;

	modifier onlyPlatformOwner() {
		require(
			msg.sender == platformOwner,
			"Only the platform owner can perform this action."
		);
		_;
	}

	bool private locked;
	modifier noReentrancy() {
		require(!locked, "No reentrancy allowed.");
		locked = true;
		_;
		locked = false;
	}

	constructor(uint8 _initialFeePercentage) {
		require(
			_initialFeePercentage < 100,
			"Initial fee percentage must be 100 or less."
		);
		platformOwner = payable(msg.sender);
		platformFeePercentage = _initialFeePercentage;
	}

	function setPlatformFeePercentage(
		uint8 _newFeePercentage
	) external onlyPlatformOwner {
		require(_newFeePercentage <= 100, "Fee percentage cannot exceed 100.");
		platformFeePercentage = _newFeePercentage;
	}

	function tipCreator(
		address payable _creatorWallet
	) external payable noReentrancy {
		require(msg.value > 0, "Tip amount must be greater than 0.");
		require(
			_creatorWallet != address(0),
			"Invalid creator wallet address."
		);

		uint256 platformFee = (msg.value * platformFeePercentage) / 100;
		uint256 tipAmount = msg.value - platformFee;

		platformOwner.transfer(platformFee); // Transfer the platform fee
		_creatorWallet.transfer(tipAmount); // Transfer tip to the creator
	}

	function withdrawAll() external onlyPlatformOwner noReentrancy {
		uint256 contractBalance = address(this).balance;
		require(contractBalance > 0, "Contract balance is zero.");

		platformOwner.transfer(contractBalance);
	}
}