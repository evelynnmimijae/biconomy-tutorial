import { BiconomySmartAccountV2 } from "@biconomy/account";
import { useEffect, useState } from "react";

export default function Transfer({
  smartAccount,
}: {
  smartAccount: BiconomySmartAccountV2;
}) {
  const [smartContractAddress, setSmartContractAddress] = useState("");

  async function getSmartContractAddress() {
    const smartContractAddress = await smartAccount.getAccountAddress();
    setSmartContractAddress(smartContractAddress);
  }

  // Get the address of the smart account when the component loads
  useEffect(() => {
    getSmartContractAddress();
  }, []);
}