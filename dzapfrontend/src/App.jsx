import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import ScrollListWithSearch from "./Components/ScrollListWithSearch";
import TransferUI from "./Components/TransferUI";
import { TokenChainContext } from "./Store/token-chain-store";

import { useState } from "react";

function App() {
  const [selectedToken1, setSelectedToken1] = useState(null);
  const [selectedChain1, setSelectedChain1] = useState(null);
  const [selectedToken2, setSelectedToken2] = useState(null);
  const [selectedChain2, setSelectedChain2] = useState(null);

  return (
    <TokenChainContext.Provider
      value={{
        selectedToken1,
        selectedToken2,
        selectedChain1,
        selectedChain2,
      }}
    >
      <Router>
        <Routes>
          <Route path="/" element={<TransferUI />} />
          <Route path="/select-currency" element={<ScrollListWithSearch />} />
        </Routes>
      </Router>
    </TokenChainContext.Provider>
  );
}

export default App;
