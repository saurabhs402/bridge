import { expect, use } from "chai";
import chaiHttp from "chai-http";
import { app } from "../app.js"; // Adjust the path to your app.js as necessary
import chai from "chai";
// const chai = use(chaiHttp)

chai.use(chaiHttp);

describe("Finance API Endpoints", () => {
  // Test the GET /tokens/:chainId endpoint
  describe("GET /tokens/:chainId", () => {
    it("should return supported tokens for a valid chainId", function (done) {
      this.timeout(10000);
      chai
        .request(app)
        .get("/api/tokens/1") // Change '1' to a valid chainId as per your setup
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status", "success");
          expect(res.body.data)
            .to.have.property("supportedTokens")
            .that.is.an("array");
          done();
        });
    });

    it("should return 404 if no tokens are found", (done) => {
      chai
        .request(app)
        .get("/api/tokens/9999") // Use an invalid chainId to simulate a 404
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status", "fail");
          expect(res.body.data).to.be.an("array").that.is.empty;
          done();
        });
    });
  });

  // Test the POST /quotes endpoint
  describe("POST /quotes", () => {
    it("should return a quote for valid input", function (done) {
      this.timeout(10000);
      const requestBody = {
        srcChainId: 43114,
        srcQuoteTokenAddress: "0x50b7545627a5162F82A992c33b87aDc75187B218",
        srcQuoteTokenAmount: 1000000,
        dstChainId: 321,
        dstQuoteTokenAddress: "0x0039f574eE5cC39bdD162E9A88e3EB1f111bAF48",
      };
      chai
        .request(app)
        .post("/api/quotes")
        .send(requestBody)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status", "success");
          expect(res.body.data)
            .to.have.property("dstQuoteTokenUsdValue")
            .that.is.a("string");
          const expectedValue = parseFloat(res.body.data.dstQuoteTokenUsdValue);
          expect(expectedValue).to.be.a("number");
          expect(res.body.data)
            .to.have.property("estimatedGas")
            .that.is.a("string");
          const expectedGas = parseFloat(res.body.data.estimatedGas);
          expect(expectedGas).to.be.a("number");
          done();
        });
    });

    it("should return 404 if no quote is found", (done) => {
      const requestBody = {
        srcChainId: 1,
        srcQuoteTokenAddress: "0xInvalidTokenAddress",
        srcQuoteTokenAmount: "1000",
        dstChainId: 2,
        dstQuoteTokenAddress: "0xTokenAddress2",
      };
      chai
        .request(app)
        .post("/api/quotes")
        .send(requestBody)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status", "fail");
          expect(res.body.data).to.have.property("dstQuoteTokenUsdValue", 0);
          expect(res.body.data).to.have.property("estimatedGas", "-");
          done();
        });
    });
  });

  // Test the POST /params endpoint
  describe("POST /params", () => {
    it("should process a transaction for valid input", function (done) {
      this.timeout(10000);
      const requestBody = {
        srcChainId: 10,
        srcQuoteTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        srcQuoteTokenAmount: 1000000000000000,
        dstChainId: 56,
        dstQuoteTokenAddress: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        receiver: "0xb6EFA1C3679f1943f8aC4Fc9463Cc492435c6C92",
        bridgeProvider: "yBridge",
        srcBridgeTokenAddress: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
        dstBridgeTokenAddress: "0x55d398326f99059fF775485246999027B3197955",
        srcSwapProvider: "OKX DEX",
        dstSwapProvider: "OKX DEX",
      };
      chai
        .request(app)
        .post("/api/params")
        .send(requestBody)
        .end((err, res) => {
          console.log("params transaction response:", res);
          expect(res).to.have.status(200);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status", "success");
          expect(res.body.data).to.have.property("to").that.is.a("string");
          done();
        });
    });

    it("should return 400 if the transaction fails", (done) => {
      const requestBody = {
        srcChainId: 1,
        srcQuoteTokenAddress: "0xInvalidTokenAddress",
        srcQuoteTokenAmount: "1000",
        dstChainId: 2,
        dstQuoteTokenAddress: "0xTokenAddress2",
        receiver: "0xReceiverAddress",
        bridgeProvider: "BridgeProvider",
        srcBridgeTokenAddress: "0xSrcBridgeTokenAddress",
        dstBridgeTokenAddress: "0xDstBridgeTokenAddress",
        srcSwapProvider: "SrcSwapProvider",
        dstSwapProvider: "DstSwapProvider",
      };
      chai
        .request(app)
        .post("/api/params")
        .send(requestBody)
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body).to.be.an("object");
          expect(res.body).to.have.property("status", "fail");
          expect(res.body.data).to.be.an("array").that.is.empty;
          done();
        });
    });
  });
});
