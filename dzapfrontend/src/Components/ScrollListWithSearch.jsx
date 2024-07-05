import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { TokenChainContext } from "../Store/token-chain-store";

const ScrollListWithSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [gridItems, setGridItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [mainList, setMainList] = useState([]);
  const [chain, setChain] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const tokenChain = useContext(TokenChainContext);

  const logos = [
    {
      name: "ETHEREUM",
      icon: "https://www.logo.wine/a/logo/Ethereum/Ethereum-Logo.wine.svg",
    },
    {
      name: "BSC",
      icon: "https://logowik.com/content/uploads/images/t_binance-coin-bnb5057.jpg",
    },
    {
      name: "POLYGON",
      icon: "https://logowik.com/content/uploads/images/t_polygon-matic-icon3725.logowik.com.webp",
    },
    {
      name: "FANTOM",
      icon: "https://logowik.com/content/uploads/images/t_fantom-opera499.logowik.com.webp",
    },
    {
      name: "CRONOS",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRA9YKr4syBOjEY2jQ9fhTHtD46r3EpDspGyg&s",
    },
    {
      name: "THUNDER_CORE",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROatRC6jwFz--Q3cUhk-G12JS0CF8yhROjPw&s",
    },
    {
      name: "AVALANCHE",
      icon: "https://upload.wikimedia.org/wikipedia/en/0/03/Avalanche_logo_without_text.png",
    },
    {
      name: "KUCOIN_CHAIN",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/2087.png",
    },
    {
      name: "ARBITRUM",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6mQ1pwxVT3lqCTZWhuUZzKTOqT0ZmYh2oeg&s",
    },
    {
      name: "OPTIMISM",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqidBq62tBzMjwxpb9WljM3BuKe6oEHzbJ6Q&s",
    },
    {
      name: "ASTAR",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLEM3tmQL1eJFBRIMiH6tWNbASABxJbJgOgw&s",
    },
    {
      name: "MOONRIVER",
      icon: "https://logowik.com/content/uploads/images/1940-moonriver-movr.webp",
    },
    {
      name: "KLAYTN",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlSbIxk9kOZrtHDjON8scDmcAJSqDfo6g8oQ&s",
    },
    {
      name: "WEMIX",
      icon: "https://altcoinsbox.com/wp-content/uploads/2023/04/wemix-logo.png",
    },
    {
      name: "ZKSYNC",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/24091.png",
    },
    {
      name: "ZKEVM",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuWuZ6QYer9uDL5zNWlbWW5u6aDJ3kOAmJMw&s",
    },
    {
      name: "LINEA",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR2_zBQJJrOcA26smPPZr3b7O2LPOORIdvfqg&s",
    },
    {
      name: "BASE",
      icon: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4",
    },
    {
      name: "MANTLE",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT8NpMfUyVGsyIx4nUsYDwy7OrEDr4Z_2xYog&s",
    },
    {
      name: "NUMBERS",
      icon: "https://s2.coinmarketcap.com/static/img/coins/200x200/13521.png",
    },
    {
      name: "SCROLL",
      icon: "https://pbs.twimg.com/profile_images/1696531511519150080/Fq5O0LeN_400x400.jpg",
    },
    {
      name: "BLAST",
      icon: "https://blastscan.io/assets/blast/images/svg/logos/chain-dim.svg?v=24.6.2.0",
    },
    {
      name: "X_LAYER",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDFuBLItuuMyPDYSMVca49t3yplXOODyu7LQ&s",
    },
    {
      name: "TAIKO",
      icon: "https://pbs.twimg.com/profile_images/1664696448808615937/LQhJeOO__400x400.jpg",
    },
    {
      name: "OX",
      icon: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR1H9igH8K69KHbE-RuUvx7xqg2c6u6XHHQMw&s",
    },
    // Add more items as needed
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://aggregator-api.xy.finance/v1/supportedChains"
        );

        let chains = response.data?.supportedChains;
        chains = chains.map((value) => {
          let logo = logos.find((logo) => logo.name == value.name);

          return {
            chainId: value.chainId,
            name: value.name,
            logoURI: logo ? logo.icon : "",
          };
        });

        setGridItems(chains);
        await handleGridItemClick(chains[0]);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const handleGridItemClick = async (item) => {
    try {
      setChain(item);
      const response = await axios.get(
        `${process.env.REACT_APP_LOCAL_BACKEND_URL}/tokens/${item.chainId}` // Update with your actual API endpoint
      );
      const updatedItem = response?.data?.data?.supportedTokens;
      console.log("updatedItem:", updatedItem);

      setMainList(updatedItem);
      setFilteredItems(updatedItem);
      console.log("filteredItems:", filteredItems);
    } catch (error) {
      console.error("Error fetching item data:", error);
    }
  };

  const handleTokenItemClick = (item) => {
    const order = location?.state?.order;
    console.log("order inside scroll:", order);
    console.log("Inside handleTokenItemClick");

    if (order === 1) {
      tokenChain.selectedToken1 = item;
      tokenChain.selectedChain1 = chain;
    } else if (order === 2) {
      tokenChain.selectedToken2 = item;
      tokenChain.selectedChain2 = chain;
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className=" w-1/2 mx-auto p-4 bg-gray-900 rounded my-5 ">
        <div className="text-white text-2xl font-bold my-2">
          {" "}
          Select a Token
        </div>
        <input
          type="text"
          placeholder="Search..."
          className="w-full p-2 mb-4 border rounded bg-transparent text-white"
          onChange={(e) => {
            const newSearchTerm = e.target.value;

            console.log("searchItem:", newSearchTerm);
            const newFilteredList = mainList.filter(({ name }) =>
              name.toLowerCase().includes(newSearchTerm.toLowerCase())
            );
            console.log("filteredList:", newFilteredList);
            setFilteredItems(newFilteredList);
          }}
        />

        <div className="grid grid-cols-5 gap-4 mb-4">
          {gridItems.length > 0 &&
            gridItems.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center justify-center p-2 border rounded hover:bg-gray-100 cursor-pointer text-white"
                onClick={() => handleGridItemClick(item)}
              >
                <img
                  src={item.logoURI}
                  alt={item.name}
                  className="w-10 h-10 rounded-full mb-2"
                />
                <div className="text-sm text-center truncate w-full">
                  {item.name}
                </div>
              </div>
            ))}
        </div>

        <div className="h-64 overflow-y-auto border rounded my-10">
          {filteredItems.map((item, index) => (
            <div
              key={index}
              className="p-2 flex items-center hover:bg-gray-100 cursor-pointer text-white"
              onClick={() => handleTokenItemClick(item)}
            >
              <img
                src={item.logoURI}
                alt={item.name}
                className="w-10 h-10 rounded-full mr-4"
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollListWithSearch;
