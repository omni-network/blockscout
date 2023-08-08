// local cache to re-use data
let txMapCache = {};

const explorerMap = {
  "scroll-sepolia": "https://sepolia-blockscout.scroll.io/tx/",
  "arbitrum-goerli": "https://goerli.arbiscan.io/tx/",
  "optimism-goerli": "https://goerli-optimism.etherscan.io/tx/",
  "linea-goerli": "https://explorer.goerli.linea.build/tx/",

  // for local test chains
  "chain-a": "https://chain-a.etherscan.io/tx/",
  "chain-b": "https://chain-b.etherscan.io/tx/",
};

// default api indexerUrl point to local server
let indexerUrl = "http://localhost:8888";

const xchainMarker = () => {
  const div = document.createElement("div");
  div.style =
    "height: inherit;margin-left: 1rem;background-color: #8258cd;padding: 0 0.5rem;border-radius: 1rem;";
  div.innerHTML =
    '<img style="height: 1.5rem;display: inline-block;margin-top: -0.1rem" src="/images/favicon-32x32.png"> <div style="margin-top: 0.2rem;display: inline-block;font-weight: bolder;color: white;">X-Rollup</div>';
  return div;
};

const customXChainDataView = (details) => {
  for (let i = 0; i < details.length; i++) {
    let externalChain = "";
    if (details[i]["SourceChain"] != "omni") {
      externalChain = details[i]["SourceChain"];
    } else if (details[i]["DestinationChain"] != "omni") {
      externalChain = details[i]["DestinationChain"];
    }
    let externalChainExplorer = "";
    if (explorerMap[externalChain] !== undefined) {
      externalChainExplorer = explorerMap[externalChain];
    }
    details[i]["ChainTxHash"] =
      externalChainExplorer + details[i]["ChainTxHash"];
  }
  const div = document.createElement("div");
  div.style =
    "height: inherit;background-color: rgb(130, 88, 205);padding: 2.5rem 1.5rem 0rem 1.5rem;";
  div.innerHTML = `
  <div>
  <img style="height: 2rem; display: inline-block;margin-top: -0.3rem" src="/images/favicon-32x32.png"> 
  <div style="margin-top: 0.1rem;display: inline-block;font-weight: bolder;color: white;font-size: 1.2rem;padding-left: 0.5rem;">X-Rollup Transaction Details</div></div>
  <pre style="font-size: 0.9rem;display: block;margin-top: 0.5rem;font-weight: bolder;color: white;padding-left: 1rem;">
  ${JSON.stringify(details, null, 4)}
  </pre>`;
  return div;
};

// expected return {txHash1:true, txHas2:true...}
const getXChainTxs = async (elements) => {
  try {
    const response = await fetch(indexerUrl + "/checkOmniTxHashes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        txHashes: elements,
      }),
    });
    if (response.status == 400) {
      await response.json().then(console.error);
      return undefined;
    }
    return response.json();
  } catch (err) {
    console.error("error getting xchain txs: ", err);
    return undefined;
  }
};

const getTxDetails = async (omniTxHash) => {
  try {
    const response = await fetch(indexerUrl + `/omniTx/${omniTxHash}`);
    const data = await response.json();
    if (data.length === 0) {
      return undefined;
    }
    return data;
  } catch (err) {
    console.error("error getting xchain tx details: ", omniTxHash, " ", err);
    return undefined;
  }
};

const getAllTxHashElements = () => {
  return document.querySelectorAll('[data-test="transaction_hash_link"]');
};

const handletxHashLinks = async () => {
  const elements = getAllTxHashElements();
  if (elements.length == 0) {
    return;
  }
  // check local cache
  const unknownTxList = [];
  for (let i of elements) {
    if (
      i.parentNode.childElementCount <= 2 &&
      txMapCache[i.innerHTML] === true
    ) {
      console.log("from cache " + i.innerHTML);
      i.parentNode.appendChild(xchainMarker());
    } else if (txMapCache[i.innerHTML] === undefined) {
      unknownTxList.push(i.innerHTML);
    }
  }
  if (unknownTxList.length == 0) {
    return;
  }
  const xChainTxs = await getXChainTxs(unknownTxList);
  if (xChainTxs === undefined) {
    return;
  }
  for (let i of elements) {
    if (xChainTxs[i.innerHTML] === true) {
      txMapCache[i.innerHTML] = true;
      console.log("from api " + i.innerHTML);
      i.parentNode.appendChild(xchainMarker());
    } else if (txMapCache[i.innerHTML] == undefined) {
      txMapCache[i.innerHTML] = false;
    }
  }
};

const displayTxDetails = async (txHash) => {
  const elements = document.querySelectorAll(
    '[class="card js-ad-dependant-mb-3"]'
  );
  if (elements.length != 1) {
    console.log("could not find unique tx view element");
    return;
  }

  const details = await getTxDetails(txHash);
  if (details === undefined) return;

  // if tx has cross chain data display
  elements[0].appendChild(customXChainDataView(details));
};

// sets next repeat only after the function call completes
const repeatLoop = async (timeMS) => {
  try {
    await handletxHashLinks();
  } catch (err) {
    console.log(err);
  } finally {
    setTimeout(repeatLoop, timeMS);
  }
};

const watch = async () => {
  // update api indexerUrl depending on blockscouts deployed environment
  if (window.location.hostname.startsWith("testnet")) {
    indexerUrl = "https://testnet-1-xapi.explorer.omni.network";
  } else if (window.location.hostname.startsWith("staging")) {
    indexerUrl = "https://staging-xapi.explorer.omni.network";
  }

  // handle for homepage
  if (window.location.pathname === "/") {
    repeatLoop(1500);
  } else if (window.location.pathname.startsWith("/address/")) {
    // every 2 second because there can be too many updates
    repeatLoop(2000);
  } else if (
    window.location.pathname.match(/\/token(.*)\/token-transfers/g) != null &&
    window.location.pathname.match(/\/token(.*)\/token-transfers/g).length != 0
  ) {
    // every 2 second because there can be too many updates
    repeatLoop(2000);
  } else if (window.location.pathname === "/txs") {
    // every 2 second because there can be too many updates
    repeatLoop(2000);
  } else if (
    window.location.pathname.match(/\/block(.*)\/transactions/g) != null &&
    window.location.pathname.match(/\/block(.*)\/transactions/g).length != 0
  ) {
    repeatLoop(1000);
  } else if (window.location.pathname.startsWith("/tx/")) {
    // get txHash
    const omniTxHash = window.location.pathname.split("/")[2];
    if (omniTxHash === undefined || !omniTxHash.startsWith("0x")) {
      console.log("cannot parse txHash on tx details page");
      return;
    }

    displayTxDetails(omniTxHash);
  }
};

watch();
