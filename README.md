<h1 align="center">BlockScout</h1>
<p align="center">Blockchain Explorer for inspecting and analyzing EVM Chains.</p>
<div align="center">

[![Blockscout](https://github.com/blockscout/blockscout/workflows/Blockscout/badge.svg?branch=master)](https://github.com/blockscout/blockscout/actions)
[![](https://dcbadge.vercel.app/api/server/blockscout?style=flat)](https://discord.gg/blockscout)

</div>


BlockScout provides a comprehensive, easy-to-use interface for users to view, confirm, and inspect transactions on EVM (Ethereum Virtual Machine) blockchains. This includes the POA Network, Gnosis Chain, Ethereum Classic and other **Ethereum testnets, private networks and sidechains**.

See our [project documentation](https://docs.blockscout.com/) for detailed information and setup instructions.

For questions, comments and feature requests see the [discussions section](https://github.com/blockscout/blockscout/discussions).

## Omni

This branch maintains the active development of Omni's blockscout fork. The master branch is left unchanged, and should be used to sync with upstream changes when necessary. This branch builds off the commit of some tagged blockscout release. Currently, this branch builds of off [blockscout v5.1.5](https://github.com/blockscout/blockscout/tree/v5.1.5-beta).

Changes from master should be merged into this branch when a new base blockscout release is selected to build off.

Required omni changes include:

- adding omni assets to the blockscout ui (favicon, logo)
- updating blockscout ui footer text
- replacing blockscout github with omni github workflows
- updating this readme

As these changes are simple, they are maintained within a single commit, to make merging upstream changes a bit easier. If / when omni requires more substantial changes to blockscout, this
branching strategy should be reconsidered.

### Omni Deployments

When this branch is ready for production, it should be tagged and released on github. This will trigger a new `omniops/blockscout` image be built and published to docker hub. To use this new image
in production, you will need update the `blockscout_docker_image` variable in each blockscout vpc instance in Omni's [blockscout-terraform](https://github.com/omni-network/blockscout-terraform/tree/omni).

## About BlockScout

BlockScout is an Elixir application that allows users to search transactions, view accounts and balances, and verify smart contracts on the Ethereum network including all forks and sidechains.

Currently available full-featured block explorers (Etherscan, Etherchain, Blockchair) are closed systems which are not independently verifiable.  As Ethereum sidechains continue to proliferate in both private and public settings, transparent, open-source tools are needed to analyze and validate transactions.

## Supported Projects

BlockScout supports a number of projects. Hosted instances include POA Network, Gnosis Chain, Ethereum Classic, Sokol & Kovan testnets, and other EVM chains.

- [List of hosted mainnets, testnets, and additional chains using BlockScout](https://docs.blockscout.com/for-projects/supported-projects)
- [Hosted instance versions](https://docs.blockscout.com/about/use-cases/hosted-blockscout)

## Getting Started

See the [project documentation](https://docs.blockscout.com/) for instructions:

- [Requirements](https://docs.blockscout.com/for-developers/information-and-settings/requirements)
- [Ansible deployment](https://docs.blockscout.com/for-developers/ansible-deployment)
- [Manual deployment](https://docs.blockscout.com/for-developers/manual-deployment)
- [ENV variables](https://docs.blockscout.com/for-developers/information-and-settings/env-variables)
- [Configuration options](https://docs.blockscout.com/for-developers/configuration-options)

## Acknowledgements

We would like to thank the [EthPrize foundation](http://ethprize.io/) for their funding support.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and pull request protocol. We expect contributors to follow our [code of conduct](CODE_OF_CONDUCT.md) when submitting code or comments.

## License

[![License: GPL v3.0](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

This project is licensed under the GNU General Public License v3.0. See the [LICENSE](LICENSE) file for details.
