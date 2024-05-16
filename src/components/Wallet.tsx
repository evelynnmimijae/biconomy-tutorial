import { useEffect, useRef, useState, Fragment } from "react";
import SocialLogin from "@biconomy/web3-auth";
import { ethers, providers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { BiconomySmartAccountV2, BiconomySmartAccountV2Config } from "@biconomy/account";
import { bundler, paymaster } from "@/constants";

export default function Wallet() {
  const sdkRef = useRef<SocialLogin | null>(null);
  const [interval, enableInterval] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [, setProvider] = useState<providers.Web3Provider>();
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccountV2 | undefined>();

  async function login() {
    console.log("Login function called");
    try {
      if (!sdkRef.current) {
        console.log("Initializing Social Login SDK...");
        const socialLoginSDK = new SocialLogin();
        await socialLoginSDK.init({
          chainId: ethers.utils.hexValue(ChainId.POLYGON_MUMBAI).toString(),
          network: "testnet",
        });
        sdkRef.current = socialLoginSDK;
        console.log("Social Login SDK initialized");
      } else {
        console.log("Social Login SDK already initialized");
      }

      if (!sdkRef.current.provider) {
        console.error("Provider not available after SDK initialization");
        sdkRef.current.showWallet();
        return;
      }

      console.log("Provider is available, calling setupSmartAccount");
      await setupSmartAccount();
      console.log("setupSmartAccount called");
    } catch (error) {
      console.error("Error during login:", error);
    }
  }

  async function logOut() {
    try {
      await sdkRef.current?.logout();
      sdkRef.current?.hideWallet();
      setSmartAccount(undefined);
      enableInterval(false);
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  async function setupSmartAccount() {
    try {
      if (!sdkRef.current?.provider) {
        console.error("Provider not available in setupSmartAccount");
        return;
      }
      sdkRef.current.hideWallet();
      setLoading(true);

      let web3Provider = new ethers.providers.Web3Provider(sdkRef.current?.provider);
      setProvider(web3Provider);
      const config: BiconomySmartAccountV2Config = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.POLYGON_MUMBAI,
        bundler: bundler,
        paymaster: paymaster,
      };
      const smartAccountInstance = await BiconomySmartAccountV2.create(config);
      setSmartAccount(smartAccountInstance);
    } catch (e) {
      console.error("Error in setupSmartAccount:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let configureLogin: NodeJS.Timeout | undefined;
    if (interval) {
      configureLogin = setInterval(() => {
        if (!!sdkRef.current?.provider) {
          clearInterval(configureLogin);
        }
      }, 1000);
    }
    return () => clearInterval(configureLogin);
  }, [interval]);

  return (
    <Fragment>
      {smartAccount && (
        <button
          onClick={logOut}
          className="absolute right-0 m-3 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-all hover:from-green-500 hover:to-blue-600 "
        >
          Logout
        </button>
      )}

      <div className="m-auto flex h-screen flex-col items-center justify-center gap-10 bg-gray-950">
        <h1 className=" text-4xl text-gray-50 font-bold tracking-tight lg:text-5xl">
          Send ERC20 using ERC20
        </h1>

        {!smartAccount && !loading && (
          <button
            onClick={login}
            className="mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-colors hover:from-green-500 hover:to-blue-600"
          >
            Login
          </button>
        )}

        {loading && <p>Loading account details...</p>}

        {smartAccount && (
          <Fragment>
            <Transfer smartAccount={smartAccount} />
          </Fragment>
        )}

        {/* Button to explicitly show the wallet */}
        {!smartAccount && (
          <button
            onClick={() => sdkRef.current?.showWallet()}
            className="mt-10 rounded-lg bg-gradient-to-r from-green-400 to-blue-500 px-4 py-2 font-medium transition-colors hover:from-green-500 hover:to-blue-600"
          >
            Show Wallet
          </button>
        )}
      </div>
    </Fragment>
  );
}
