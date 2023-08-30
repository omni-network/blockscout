// local cache to re-use data
const txMapCache = {}

const explorerByChain = {
  'scroll-sepolia': 'https://sepolia-blockscout.scroll.io/tx/',
  'arbitrum-goerli': 'https://goerli.arbiscan.io/tx/',
  'optimism-goerli': 'https://goerli-optimism.etherscan.io/tx/',
  'linea-goerli': 'https://explorer.goerli.linea.build/tx/',
}

const chainDisplayName = chain =>
  chain
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

// default api indexerUrl point to local server
// let indexerUrl = 'http://localhost:8888'
// in dev, use testnet explorer
let indexerUrl = 'https://testnet-xapi.explorer.omni.network'

const xchainMarker = () => {
  const div = document.createElement('div')

  div.className = 'xchain-marker'
  div.innerHTML = `
    <img class="xchain-marker__logo" src="/images/omni_logo.svg" />
    <p class="xchain-marker__label">X-Rollup</p>
  `
  return div
}

const infoIcon = `<i class="xchain-data__detail-icon fa-solid fa-circle-info"></i>`
const successIcon = `<i style="color: #20b760;" class="fa-regular fa-circle-check"></i>`
const errorIcon = `<i style="color: #dc3545;" class="fa-solid fa-circle-exclamation"></i>`

const xchainDetail = (label, value) => `
  <div class="xchain-data__detail">
    ${infoIcon}
    <p class="xchain-data__detail-label">
      ${label}
    </p>
    <p class="xchain-data__detail-value">
      ${value}
    </p>
  </div>
`

const xchainDetailLink = (label, value, link) => `
  <div class="xchain-data__detail">
    ${infoIcon}
    <p class="xchain-data__detail-label">
      ${label}
    </p>
    <a
      class="xchain-data__detail-value"
      href="${link}"
      target="_blank"
      rel="noopener noreferrer"
    >
      ${value}
    </a>
  </div>
`

const xchainSuccess = `<span class="success">${successIcon} Success</span>`
const xchainError = `<span class="error">${errorIcon} Error</span>`

const xchainDetails = details => {
  const div = document.createElement('div')

  const {
    SourceChain,
    DestinationChain,
    OmniTxHash,
    ChainTxHash,
    ChainTxStatus,
    SourceNonce,
    ChainBlockNumber,
    ExternalChainDisplayName,
    ExternalTxLink,
  } = details

  div.className = 'xchain-data__details'

  div.innerHTML += xchainDetail('Source Chain', chainDisplayName(SourceChain))
  div.innerHTML += xchainDetail(
    'Destination Chain',
    chainDisplayName(DestinationChain),
  )
  div.innerHTML += xchainDetail('Omni Tx Hash', OmniTxHash)

  const extTxHashLabel = ExternalChainDisplayName + ' Tx Hash'
  div.innerHTML +=
    ExternalTxLink == null
      ? xchainDetail(extTxHashLabel, ChainTxHash)
      : xchainDetailLink(extTxHashLabel, ChainTxHash, ExternalTxLink)

  div.innerHTML += xchainDetail(
    ExternalChainDisplayName + ' Tx Status',
    ChainTxStatus === 'success' ? xchainSuccess : xchainError,
  )

  div.innerHTML += xchainDetail('Source Nonce', SourceNonce)
  div.innerHTML += xchainDetail('Chain Block Number', ChainBlockNumber)

  return div
}

/**
 * Add ExternalChain, ExternalChainDisplayName, ExternalTxLink to xchain
 *  tx details in place.
 */
const withExternalChainData = details => {
  const sourceChain = details.SourceChain
  const destinationChain = details.DestinationChain
  const externalChain = sourceChain !== 'omni' ? sourceChain : destinationChain

  const externalChainExplorer =
    explorerByChain[externalChain] !== undefined
      ? explorerByChain[externalChain]
      : null

  details.ExternalChain = externalChain
  details.ExternalChainDisplayName = chainDisplayName(externalChain)

  if (externalChainExplorer !== null) {
    details.ExternalTxLink = externalChainExplorer + details.ChainTxHash
  }

  return details
}

const customXChainDataView = details => {
  const div = document.createElement('div')

  div.className = 'xchain-data'
  div.innerHTML = `
    <div class="xchain-data__header">
      <img class="xchain-data__header-logo" src="/images/omni_logo.svg" />
      <div class="xchain-data__header-label">X-Rollup Transaction Details</div>
      <div class="xchain-data__header-txcount">
        ${
          details.length > 1
            ? details.length + ' transactions'
            : '1 transaction'
        }
      </div>
    </div>
  `

  for (const d of details) {
    div.appendChild(xchainDetails(withExternalChainData(d)))
  }

  return div
}

// expected return {txHash1:true, txHas2:true...}
const getXChainTxs = async elements => {
  try {
    const response = await fetch(indexerUrl + '/checkOmniTxHashes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ txHashes: elements }),
    })
    if (response.status === 400) {
      await response.json().then(console.error)
      return undefined
    }
    return response.json()
  } catch (err) {
    console.error('error getting xchain txs: ', err)
    return undefined
  }
}

const getTxDetails = async omniTxHash => {
  try {
    const response = await fetch(indexerUrl + `/omniTx/${omniTxHash}`)
    const data = await response.json()
    if (data.length === 0) {
      return undefined
    }
    return data
  } catch (err) {
    console.error('error getting xchain tx details: ', omniTxHash, ' ', err)
    return undefined
  }
}

const getAllTxHashElements = () => {
  return document.querySelectorAll('[data-test="transaction_hash_link"]')
}

const addXChainMarket = e => {
  const marker = xchainMarker()
  e.appendChild(marker)

  // im sorry
  // this colors the whole tx block
  marker.parentElement.parentElement.parentElement.parentElement.parentElement.style.backgroundColor =
    '#F5F7FE'
}

const handletxHashLinks = async () => {
  const elements = getAllTxHashElements()
  if (elements.length === 0) {
    return
  }
  // check local cache
  const unknownTxList = []
  for (const i of elements) {
    if (
      i.parentNode.childElementCount <= 2 &&
      txMapCache[i.innerHTML] === true
    ) {
      addXChainMarket(i.parentNode)
    } else if (txMapCache[i.innerHTML] === undefined) {
      unknownTxList.push(i.innerHTML)
    }
  }

  if (unknownTxList.length === 0) {
    return
  }

  const xChainTxs = await getXChainTxs(unknownTxList)

  if (xChainTxs === undefined) {
    return
  }

  for (const i of elements) {
    if (xChainTxs[i.innerHTML] === true) {
      txMapCache[i.innerHTML] = true
      addXChainMarket(i.parentNode)
    } else if (txMapCache[i.innerHTML] == null) {
      txMapCache[i.innerHTML] = false
    }
  }
}

const displayTxDetails = async txHash => {
  const elements = document.querySelectorAll(
    '[class="card js-ad-dependant-mb-3"]',
  )
  if (elements.length !== 1) {
    console.log('could not find unique tx view element')
    return
  }
  const container = elements[0]

  const details = await getTxDetails(txHash)

  console.log(details)

  if (details === undefined) return

  // sorry again
  const card = container.children[0]
  const firstRow = card.children[1]

  card.insertBefore(customXChainDataView(details), firstRow)
}

// sets next repeat only after the function call completes
const repeatLoop = async timeMS => {
  try {
    await handletxHashLinks()
  } catch (err) {
    console.log(err)
  } finally {
    setTimeout(repeatLoop, timeMS)
  }
}

const watch = async () => {
  // update api indexerUrl depending on blockscouts deployed environment
  if (window.location.hostname.startsWith('testnet')) {
    indexerUrl = 'https://testnet-xapi.explorer.omni.network'
  } else if (window.location.hostname.startsWith('staging')) {
    indexerUrl = 'https://staging-xapi.explorer.omni.network'
  }

  // handle for homepage
  if (window.location.pathname === '/') {
    repeatLoop(1500)
  } else if (window.location.pathname.startsWith('/address/')) {
    // every 2 second because there can be too many updates
    repeatLoop(2000)
  } else if (
    window.location.pathname.match(/\/token(.*)\/token-transfers/g) != null &&
    window.location.pathname.match(/\/token(.*)\/token-transfers/g).length !== 0
  ) {
    // every 2 second because there can be too many updates
    repeatLoop(2000)
  } else if (window.location.pathname === '/txs') {
    // every 2 second because there can be too many updates
    repeatLoop(2000)
  } else if (
    window.location.pathname.match(/\/block(.*)\/transactions/g) != null &&
    window.location.pathname.match(/\/block(.*)\/transactions/g).length !== 0
  ) {
    repeatLoop(1000)
  } else if (window.location.pathname.startsWith('/tx/')) {
    // get txHash
    const omniTxHash = window.location.pathname.split('/')[2]
    if (omniTxHash === undefined || !omniTxHash.startsWith('0x')) {
      console.log('cannot parse txHash on tx details page')
      return
    }

    displayTxDetails(omniTxHash)
  }
}

watch()
