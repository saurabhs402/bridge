const axios = require("axios");

const getSupportedTokens = async function (req, res, next) {
  const { chainId } = req.params;

  try {
    const response = await axios.get(
      `${process.env.XY_FINANCE_BASE_URL}/recommendedTokens`,
      {
        params: {
          chainId,
        },
      }
    );
    if (!response?.data?.recommendedTokens) {
      res.status(400).json({
        status: "fail",
        data: [],
      });
    }
    res.status(200).json({
      status: "success",
      data: {
        supportedTokens: response?.data?.recommendedTokens
          ? response.data.recommendedTokens
          : [],
      },
    });
  } catch (error) {
    console.log("Error getSupported Tokens:", error);
    res.status(400).json({
      status: "fail",
      data: [],
    });
  }
};

const getQuotes = async function (req, res, next) {
  console.log("Request Body:", req.body);
  const {
    srcChainId,
    srcQuoteTokenAddress,
    srcQuoteTokenAmount,
    dstChainId,
    dstQuoteTokenAddress,
  } = req.body;
  try {
    const response = await axios.get(
      `${process.env.XY_FINANCE_BASE_URL}/quote`,
      {
        params: {
          srcChainId,
          srcQuoteTokenAddress,
          srcQuoteTokenAmount,
          dstChainId,
          dstQuoteTokenAddress,
          slippage: 1,
        },
      }
    );

    console.log("Response:", response.data);

    if (!response?.data?.routes[0]?.dstQuoteTokenAmount) {
      res.status(200).json({
        status: "fail",
        data: {
          dstQuoteTokenUsdValue: 0,
          estimatedGas: "-",
        },
      });
      return;
    }
    const route = response?.data?.routes[0];
    const srcSwapProvider = route.srcSwapDescription?.provider
      ? route.srcSwapDescription?.provider
      : null;
    res.status(200).json({
      status: "success",
      data: {
        dstQuoteTokenUsdValue: route.dstQuoteTokenUsdValue,
        estimatedGas: route.estimatedGas,
        bridgeProvider: route.bridgeDescription?.provider
          ? route.bridgeDescription?.provider
          : null,
        srcBridgeTokenAddress: route.bridgeDescription?.srcBridgeTokenAddress
          ? route.bridgeDescription?.srcBridgeTokenAddress
          : null,
        dstBridgeTokenAddress: route.bridgeDescription?.dstBridgeTokenAddress
          ? route.bridgeDescription?.dstBridgeTokenAddress
          : null,
        srcSwapProvider,
        dstSwapProvider: route.dstSwapDescription?.provider
          ? route.dstSwapDescription?.provider
          : srcSwapProvider,
      },
    });
  } catch (error) {
    res.status(200).json({
      status: "fail",
      data: {
        dstQuoteTokenUsdValue: 0,
        estimatedGas: "-",
      },
    });
  }
};

const processTransaction = async function (req, res, next) {
  console.log("Request Body Process Transaction:", req.body);
  const {
    srcChainId,
    srcQuoteTokenAddress,
    srcQuoteTokenAmount,
    dstChainId,
    dstQuoteTokenAddress,
    receiver,
    bridgeProvider,
    srcBridgeTokenAddress,
    dstBridgeTokenAddress,
    srcSwapProvider,
    dstSwapProvider,
  } = req.body;
  try {
    const response = await axios.get(
      `${process.env.XY_FINANCE_BASE_URL}/buildTx`,
      {
        params: {
          srcChainId,
          srcQuoteTokenAddress,
          srcQuoteTokenAmount,
          dstChainId,
          dstQuoteTokenAddress,
          slippage: 1,
          receiver,
          bridgeProvider,
          srcBridgeTokenAddress,
          dstBridgeTokenAddress,
          srcSwapProvider,
          dstSwapProvider,
        },
      }
    );

    console.log("Response Process Transaction:", response.data);

    if (!response?.data?.tx?.to) {
      res.status(400).json({
        status: "fail",
        data: [],
      });
      return;
    }
    const tx = response?.data?.tx;

    res.status(200).json({
      status: "success",
      data: {
        to: tx.to,
      },
    });
  } catch (error) {
    console.log("Transaction error:", error);
    res.status(400).json({
      status: "fail",
      data: [],
    });
  }
};

module.exports = { getSupportedTokens, getQuotes, processTransaction };
