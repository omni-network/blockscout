// local cache to re-use data
let txMap = {};

// default api url point to local server
let url = "http://localhost:8888";

const xchainMarker = () => {
  const div = document.createElement("div");
  div.style =
    "height: inherit;margin-left: 1vw;background-color: #8258cd;padding: 0 0.5vw;border-radius: 1vw;";
  div.innerHTML =
    '<img style="height: 1.5vw;display: inline-block;margin-top: -0.1vw" src="/images/favicon-32x32.png"> <div style="margin-top: 0.2vw;display: inline-block;font-weight: bolder;color: white;">X-Chain</div>';
  return div;
};

const customXChainDataView = (details) => {
  const div = document.createElement("div");
  div.style =
    "height: inherit;background-color: rgb(130, 88, 205);padding: 2.5vw 1.5vw 0vw 1.5vw;";
  div.innerHTML = `
  <div>
  <img style="height: 2vw; display: inline-block;margin-top: -0.3vw" src="/images/favicon-32x32.png"> 
  <div style="margin-top: 0.1vw;display: inline-block;font-weight: bolder;color: white;font-size: 1.2vw;padding-left: 0.5vw;">X-Chain Transaction Details</div></div>
  <pre style="font-size: 1vw;display: block;margin-top: 0.5vw;font-weight: bolder;color: white;padding-left: 1vw;">
  ${JSON.stringify(details, null, 4)}
  </pre>`;
  return div;
};

// expected return {txHash1:true, txHas2:true...}
const getXChainTxs = async (elements) => {
  try {
    const response = await fetch(url + "/checkOmniTxHashes", {
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
    const response = await fetch(url + `/omniTx/${omniTxHash}`);
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
    if (i.parentNode.childElementCount <= 2 && txMap[i.innerHTML] === true) {
      console.log("from cache " + i.innerHTML);
      i.parentNode.appendChild(xchainMarker());
    } else if (txMap[i.innerHTML] === undefined) {
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
      txMap[i.innerHTML] = true;
      console.log("from api " + i.innerHTML);
      i.parentNode.appendChild(xchainMarker());
    } else if (txMap[i.innerHTML] == undefined) {
      txMap[i.innerHTML] = false;
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
  // update api url depending on blockscouts deployed environment
  if (window.location.hostname.startsWith("testnet")) {
    url = "https://testnet-1-xapi.explorer.omni.network";
  } else if (window.location.hostname.startsWith("staging")) {
    url = "https://staging-xapi.explorer.omni.network";
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
