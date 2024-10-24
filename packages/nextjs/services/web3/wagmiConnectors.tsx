import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  braveWallet,
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import * as chains from "viem/chains";
import { configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { publicProvider } from "wagmi/providers/public";
import scaffoldConfig from "~~/scaffold.config";
import { burnerWalletConfig } from "~~/services/web3/wagmi-burner/burnerWalletConfig";
import { getTargetNetworks } from "~~/utils/scaffold-eth";
import { useEffect, useMemo, useState } from "react";

import { ParticleNetwork } from '@particle-network/auth';
import { particleWallet } from '@particle-network/rainbowkit-ext';

const targetNetworks = getTargetNetworks();
const { onlyLocalBurnerWallet } = scaffoldConfig;

// We always want to have mainnet enabled (ENS resolution, ETH price, etc). But only once.
const enabledChains = targetNetworks.find(network => network.id === 1)
  ? targetNetworks
  : [...targetNetworks, chains.mainnet];

/**
 * Chains for the app
 */
export const appChains = configureChains(
  enabledChains,
  [
    alchemyProvider({
      apiKey: scaffoldConfig.alchemyApiKey,
    }),
    publicProvider(),
  ],
  {
    stallTimeout: 3_000,
    ...(targetNetworks.find(network => network.id !== chains.hardhat.id)
      ? {
          pollingInterval: scaffoldConfig.pollingInterval,
        }
      : {}),
  },
);

// Initialize ParticleNetwork with your credentials
const particle = new ParticleNetwork({
  projectId: scaffoldConfig.particleProjectId, // Replace with your Particle project ID
  clientKey: scaffoldConfig.particleClientKey, // Replace with your Particle client key
  appId: scaffoldConfig.particleAppId,         // Replace with your Particle app ID
  chainName: 'Optimism',
  chainId: 10,
  wallet: { displayWalletEntry: true },
});

const walletsOptions = { chains: appChains.chains, projectId: scaffoldConfig.walletConnectProjectId };

const popularWallets = {
  groupName: "Popular",
  wallets: [
    metaMaskWallet({ ...walletsOptions, shimDisconnect: true }),
    coinbaseWallet({ ...walletsOptions, appName: "scaffold-eth-2" }),
    rainbowWallet(walletsOptions),
    // Add Particle Wallet with different authentication types
    particleWallet({ chains: appChains.chains, authType: 'google' }),
    particleWallet({ chains: appChains.chains, authType: 'facebook' }),
    particleWallet({ chains: appChains.chains, authType: 'apple' }),
    particleWallet({ chains: appChains.chains }), // Default authentication
  ],
};

const otherWallets = {
  groupName: "Other",
  wallets: [
    walletConnectWallet(walletsOptions),
    ledgerWallet(walletsOptions),
    braveWallet(walletsOptions),
    safeWallet({ ...walletsOptions }),
    // Include burner wallet if conditions are met
    ...(!targetNetworks.some(network => network.id !== chains.hardhat.id) || !onlyLocalBurnerWallet
      ? [
          burnerWalletConfig({
            chains: appChains.chains.filter(chain => targetNetworks.map(({ id }) => id).includes(chain.id)),
          }),
        ]
      : []),
  ],
};

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets([
  popularWallets,
  otherWallets,
]);
