import React, { useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TokenChainContext } from "../Store/token-chain-store";
import toast, { Toaster } from "react-hot-toast";
import Web3Modal from "web3modal";
import axios from "axios";

const providerOptions = {
  // You can specify additional providers here if needed
};
const TransferUI = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [toValue, setToValue] = useState(0.0);
  const [address, setAddress] = useState(null);
  const [bridgeProvider, setBridgeProvider] = useState(null);
  const [srcBridgeTokenAddress, setSrcBridgeTokenAddress] = useState(null);
  const [dstBridgeTokenAddress, setDstBridgeTokenAddress] = useState(null);
  const [srcSwapProvider, setSrcSwapProvider] = useState(null);
  const [dstSwapProvider, setDstSwapProvider] = useState(null);
  const [estimatedGas, setEstimatedGas] = useState("-");

  const [quote, setQuote] = useState("-");

  const { selectedToken1, selectedChain1, selectedToken2, selectedChain2 } =
    useContext(TokenChainContext);

  const handleCurrencyClick = (order) => {
    console.log(order);
    navigate("/select-currency", {
      state: {
        order,
      },
    });
  };
  const connectWallet = async () => {
    try {
      const web3Modal = new Web3Modal({
        cacheProvider: false,
        providerOptions,
      });

      const web3ModalInstance = await web3Modal.connect();

      const accounts = await web3ModalInstance.request({
        method: "eth_requestAccounts",
      });
      console.log("Web3ModalInstance:", web3ModalInstance);
      console.log("Address:", accounts[0]);

      if (accounts) {
        setAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleQuote = async () => {
    setLoadingQuote(true);
    try {
      if (Number(toValue) === 0) return;
      const data = {
        srcChainId: selectedChain1.chainId,
        srcQuoteTokenAddress: selectedToken1.address,
        srcQuoteTokenAmount: Number(toValue) * 1e6,
        dstChainId: selectedChain2.chainId,
        dstQuoteTokenAddress: selectedToken2.address,
      };
      console.log("data:", data);

      setEstimatedGas("-");

      let response = await axios.post(
        `${process.env.REACT_APP_BASE_URL_BACKEND}/quotes`,
        data
      );
      response = response.data?.data;
      setEstimatedGas(response.estimatedGas);
      setBridgeProvider(response.bridgeProvider);
      setSrcBridgeTokenAddress(response.srcBridgeTokenAddress);
      setDstBridgeTokenAddress(response.dstBridgeTokenAddress);
      setSrcSwapProvider(response.srcSwapProvider);
      setDstSwapProvider(response.dstSwapProvider);

      let quoteString = response?.dstQuoteTokenUsdValue;
      let quoteAmount = quoteString;
      console.log("quoteString:", quoteString);
      if (Number(quoteString) / 1e6 > 1) {
        quoteAmount = (Number(quoteString) / 1e6).toFixed(2) + "*1e6";
      }
      if (Number(quoteString) / 1e18 > 1) {
        quoteAmount = (Number(quoteString) / 1e18).toFixed(2) + "*1e18";
      }
      setQuote(Number(quoteAmount).toFixed(3));
    } catch (error) {
      setQuote("-");
      setEstimatedGas("-");
      console.log("Error in Calculating Quotes:", error);
    } finally {
      setLoadingQuote(false);
    }
  };

  const handleTransfer = async () => {
    setLoading(true);
    try {
      const data = {
        srcChainId: selectedChain1.chainId,
        srcQuoteTokenAddress: selectedToken1.address,
        srcQuoteTokenAmount: Number(toValue) * 1e6,
        dstChainId: selectedChain2.chainId,
        dstQuoteTokenAddress: selectedToken2.address,
        receiver: address,
        bridgeProvider,
        srcBridgeTokenAddress,
        dstBridgeTokenAddress,
        srcSwapProvider,
        dstSwapProvider,
      };

      let response = await axios.post(
        `${process.env.REACT_APP_BASE_URL_BACKEND}/params`,
        data
      );
      response = response.data;
      console.log("response:", response);
      if (response.status === "success") {
        toast.success(`Transaction Successful to address ${response.data.to}`);
      } else if (response.status === "fail") {
        toast.error(`Transaction UnSuccessfull try again!!`);
      }
    } catch (error) {
      console.log("Error in Calculating Quotes:", error);
      toast.error(`Transaction UnSuccessfull try again!!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <h2 className="text-2xl font-bold font-serif leading-7 text-blue-100 sm:truncate sm:text-3xl sm:tracking-tight mb-10">
        XY Finance Integration
      </h2>

      <div className="max-w-md mx-auto p-4 bg-gray-900 text-white w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Transfer</h2>
          <div className="flex space-x-2">
            {address === null ? (
              <button
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-white text-gray-800 rounded-md border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-300 transition duration-150 ease-in-out"
                onClick={connectWallet}
              >
                <span className="font-medium">Connect</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </button>
            ) : (
              <div>
                {address.slice(0, 4) +
                  "..." +
                  address.slice(address.length - 3, address.length)}
              </div>
            )}
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1">From</label>
          <div className="flex items-center">
            <input
              type="number"
              value={toValue}
              onChange={(e) => setToValue(e.target.value)}
              className="bg-transparent w-1/2 border border-white rounded p-2"
            />
            <div
              className="flex items-center justify-between bg-gray-800 p-2 rounded cursor-pointer ml-auto"
              onClick={() => handleCurrencyClick(1)}
            >
              <div className="flex items-center">
                <img
                  src={selectedToken1?.logoURI}
                  alt={selectedToken1?.name}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">
                    {selectedToken1?.name ? selectedToken1?.name : "choose"}
                  </span>
                  <span className="text-sm align-text-bottom ml-1">
                    {selectedChain1?.name}
                  </span>
                </div>
                <span className="ml-1 text-xs">▼</span>
              </div>
            </div>
          </div>
        </div>

        {/* Second one */}

        <div className="mb-4">
          <label className="block mb-1">To (Quote)</label>
          <div className="flex items-center">
            {/* <input type="number" value="0.0" className="bg-transparent w-1/2" /> */}
            <div className="bg-transparent w-1/2  text-3xl">
              {loadingQuote ? (
                <div className="flex justify-center items-center">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                </div>
              ) : (
                "$ " + quote
              )}
            </div>
            <div
              className="flex justify-between items-center bg-gray-800 p-2 rounded cursor-pointer ml-auto"
              onClick={() => handleCurrencyClick(2)}
            >
              <div className="flex items-center">
                <img
                  src={selectedToken2?.logoURI}
                  alt={selectedToken2?.name}
                  className="w-10 h-10 rounded-full mr-4"
                />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-bold">
                    {" "}
                    {selectedToken2?.name ? selectedToken2?.name : "choose"}
                  </span>
                  <span className="text-sm align-text-bottom ml-1">
                    {" "}
                    {selectedChain2?.name}
                  </span>
                </div>
                <span className="ml-1 text-xs">▼</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Estimated Gas</label>
          <div>{estimatedGas}</div>
        </div>

        <button
          className={`font-bold py-3 px-6 rounded-full shadow-lg text-white mb-4 w-1/2 mx-auto block ${
            !selectedToken1 ||
            !selectedChain1 ||
            !selectedToken2 ||
            !Number(toValue) ||
            !selectedChain2
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600"
          }`}
          disabled={
            !selectedToken1 ||
            !selectedChain1 ||
            !selectedToken2 ||
            !selectedChain2
          }
          onClick={handleQuote}
        >
          Quote
        </button>
        <button
          className="hover:brightness-110 font-bold py-3 px-6 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 text-white w-full"
          onClick={handleTransfer}
        >
          {loading ? (
            <div className="flex justify-center items-center">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
            </div>
          ) : (
            "Transfer"
          )}
        </button>
        <div>
          <Toaster className="text-xl" />
        </div>
        {/* ... rest of your TransferUI component ... */}
      </div>
    </div>
  );
};

export default TransferUI;
