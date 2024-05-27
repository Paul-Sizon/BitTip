import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  // We define a fixture to reuse the same setup in every test.

  let yourContract: YourContract;
  before(async () => {
    const [owner] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy(2)) as YourContract;
    await yourContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await yourContract.platformOwner()).to.equal((await ethers.provider.getSigner()).address);
    });

    it("Should set the right initial fee percentage", async function () {
      expect(await yourContract.platformFeePercentage()).to.equal(2);
    });
  });
});
