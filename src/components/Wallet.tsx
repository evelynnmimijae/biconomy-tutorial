import { useEffect, useRef, useState } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ethers, providers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { BiconomySmartAccount, BiconomySmartAccountConfig } from "@biconomy/account";
import { bundler, paymaster } from "@/constants";

export default function Wallet() {
  const sdkRef = useRef<SocialLogin | null>(null);
  const [interval, enableInterval] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [, setProvider] = useState<providers.Web3Provider>();
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount>();
  
  // login() function
  // setupSmartAccount() function

  async function login() {
    // If the SDK has not been initialized yet, initialize it
    if (!sdkRef.current) {
      const socialLoginSDK = new SocialLogin();
      await socialLoginSDK.init({
        chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
        network: "testnet",
      });
      sdkRef.current = socialLoginSDK;
    }
  
    // If the SDK is set up, but the provider is not set, start the timer to set up a smart account
    if (!sdkRef.current.provider) {
      sdkRef.current.showWallet();
      enableInterval(true);
    } else {
      console.log("hello");
      //   setupSmartAccount();
    }
  }

  async function setupSmartAccount() {
    try {
      // If the SDK hasn't fully initialized, return early
      if (!sdkRef.current?.provider) return;
  
      // Hide the wallet if currently open
      sdkRef.current.hideWallet();
  
      // Start the loading indicator
      setLoading(true);
  
      // Initialize the smart account
      let web3Provider = new ethers.providers.Web3Provider(
        sdkRef.current?.provider
      );
      setProvider(web3Provider);
      const config: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster,
      };
      const smartAccount = new BiconomySmartAccount(config);
      await smartAccount.init();
  
      // Save the smart account to a state variable
      setSmartAccount(smartAccount);
    } catch (e) {
      console.error(e);
    }
  
    setLoading(false);
  }

  useEffect(() => {
    let configureLogin: NodeJS.Timeout | undefined;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          // setupSmartAccount();
          clearInterval(configureLogin);
        }
      }, 1000);
    }
  }, [interval]);
}