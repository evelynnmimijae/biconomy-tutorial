import { useEffect, useRef, useState } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";

export default function Wallet() {
  const sdkRef = useRef<SocialLogin | null>(null);
  const [interval, enableInterval] = useState<boolean>(false);

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