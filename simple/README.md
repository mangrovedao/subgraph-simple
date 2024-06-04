# Mangrove Indexer

This repo contains the indexer code for Mangrove, MangroveOrder and Kandel. It is written using [the graph](https://thegraph.com/docs/en/).

The contracts that is being indexed can be found in these 2 repos. [mangrove-core](https://github.com/mangrovedao/mangrove-core) and [mangrove-strats](https://github.com/mangrovedao/mangrove-strats)

# Documentation

If you are looking for the Mangrove developer documentation, the main site to go to is [docs.mangrove.exchange](https://docs.mangrove.exchange).

# Usage

The following sections describe the most common use cases in this repo.

## Initial setup

After first cloning the repo, you should run `yarn install` in the root folder.

```shell
$ yarn install
```

## Codegen

The codegen script will generate the event types and the entities from the schema.graphql file.

```shell
$ yarn codegen
```

## Build

The build script will compile the subgraph to the build folder.

```shell
$ yarn build
```

## Deploy

In order to deploy the subgraph, you need a The graph node provider, like chainstack, satsuma, etc. You can find how to deploy at your the graph node provider.

## Test

The test script will run the tests in the test folder. We use the framework [matchstick](https://github.com/LimeChain/matchstick) to run our tests.

```shell
$ yarn test
```
