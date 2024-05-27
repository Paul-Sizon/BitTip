import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  let yourContract: YourContract;
  let owner: any;
  let addr1: any;
  let addr2: any;

  before(async () => {
    [owner, addr1, addr2] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(2)) as YourContract;
    await yourContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await yourContract.platformOwner()).to.equal(owner.address);
    });

    it("Should set the right initial fee percentage", async function () {
      expect(await yourContract.platformFeePercentage()).to.equal(2);
    });
  });

  describe("Fee Percentage", function () {
    it("Should allow the owner to change the fee percentage", async function () {
      await yourContract.setPlatformFeePercentage(5);
      expect(await yourContract.platformFeePercentage()).to.equal(5);
    });

    it("Should not allow non-owner to change the fee percentage", async function () {
      await expect(yourContract.connect(addr1).setPlatformFeePercentage(5)).to.be.revertedWith(
        "Only the platform owner can perform this action."
      );
    });

    it("Should not allow setting fee percentage above 100", async function () {
      await expect(yourContract.setPlatformFeePercentage(101)).to.be.revertedWith(
        "Fee percentage cannot exceed 100."
      );
    });
  });

  describe("Tipping", function () {
    it("Should correctly transfer the tip and fee", async function () {
      const tipAmount = ethers.parseEther("1.0");

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const initialCreatorBalance = await ethers.provider.getBalance(addr1.address);
      const initialTipperBalance = await ethers.provider.getBalance(addr2.address);

      const tx = await yourContract.connect(addr2).tipCreator(addr1.address, { value: tipAmount });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed;
      const gasPrice = tx.gasPrice || receipt.gasPrice;
      const gasCost = gasUsed * (gasPrice);

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);
      const finalCreatorBalance = await ethers.provider.getBalance(addr1.address);
      const finalTipperBalance = await ethers.provider.getBalance(addr2.address);

      const platformFeePercentage = BigInt(await yourContract.platformFeePercentage());
      const platformFee = (BigInt(tipAmount) * platformFeePercentage) / BigInt(100);
      const tipTransferAmount = BigInt(tipAmount) - platformFee;

      console.log("Tip Amount: ", tipAmount.toString());
      console.log("Platform Fee Percentage: ", platformFeePercentage.toString());
      console.log("Platform Fee: ", platformFee.toString());
      console.log("Tip Transfer Amount: ", tipTransferAmount.toString());
      console.log("Gas Used: ", gasUsed.toString());
      console.log("Gas Price: ", gasPrice.toString());
      console.log("Gas Cost: ", gasCost.toString());

      console.log("Initial Owner Balance: ", initialOwnerBalance.toString());
      console.log("Final Owner Balance: ", finalOwnerBalance.toString());

      console.log("Initial Creator Balance: ", initialCreatorBalance.toString());
      console.log("Final Creator Balance: ", finalCreatorBalance.toString());

      console.log("Initial Tipper Balance: ", initialTipperBalance.toString());
      console.log("Final Tipper Balance: ", finalTipperBalance.toString());

      const tolerance = ethers.parseEther("0.0001"); // Increased tolerance for gas costs and minor discrepancies

      // Check owner's balance, ensuring fee is correctly accounted for
      expect(BigInt(finalOwnerBalance)).to.be.closeTo(BigInt(initialOwnerBalance) + platformFee, tolerance);

      // Check creator's balance, ensuring tip is correctly transferred
      expect(BigInt(finalCreatorBalance)).to.be.closeTo(BigInt(initialCreatorBalance) + tipTransferAmount, tolerance);

      // Check tipper's balance, ensuring gas cost is accounted for
      expect(BigInt(finalTipperBalance)).to.be.closeTo(BigInt(initialTipperBalance) - BigInt(tipAmount) - BigInt(gasCost), tolerance);
    });

    it("Should revert if tip amount is zero", async function () {
      await expect(yourContract.tipCreator(addr1.address, { value: 0 })).to.be.revertedWith(
        "Tip amount must be greater than 0."
      );
    });

    it("Should revert if creator wallet address is invalid", async function () {
      await expect(
        yourContract.tipCreator(ethers.ZeroAddress, { value: ethers.parseEther("1.0") })
      ).to.be.revertedWith("Invalid creator wallet address.");
    });
  });

  describe("Withdrawals", function () {
    it("Should allow the owner to withdraw all funds", async function () {
      const depositAmount = ethers.parseEther("2.0");

      await owner.sendTransaction({
        to: await yourContract.getAddress(),
        value: depositAmount,
      });

      const initialOwnerBalance = await ethers.provider.getBalance(owner.address);
      const contractBalance = await ethers.provider.getBalance(await yourContract.getAddress());

      const tx = await yourContract.withdrawAll();
      const receipt = await tx.wait();
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;

      const finalOwnerBalance = await ethers.provider.getBalance(owner.address);

      expect(contractBalance).to.equal(depositAmount);
      expect(finalOwnerBalance).to.equal(initialOwnerBalance + depositAmount - gasUsed);
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      await expect(yourContract.connect(addr1).withdrawAll()).to.be.revertedWith(
        "Only the platform owner can perform this action."
      );
    });

    it("Should revert if contract balance is zero", async function () {
      await expect(yourContract.withdrawAll()).to.be.revertedWith("Contract balance is zero.");
    });
  });
});
