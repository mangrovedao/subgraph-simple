import { Bytes, Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Market, Token } from "../../generated/schema";
import { sortTokens } from "../helpers";

export function getKandelParamsId(txHash: Bytes, kandel: Address): string {
  return `${txHash.toHex()}-${kandel.toHex()}`;
}

export function getOfferId(olKeyHash: Bytes, id: BigInt): string {
  return `${olKeyHash.toHex()}-${id.toString()}`;
}

export function getMarketActivityId(user: Address, market: Market): string {
  return `${user.toHex()}-${market.id.toString()}`;
}

export function getMarketActivityPairId(maker: Address, taker: Address, market: Market): string {
  return `${maker.toHex()}-${taker.toHex()}-${market.id.toString()}`;
}

export function getTokenActivityId(user: Address, token: Token): string {
  return `${user.toHex()}-${token.address.toHex()}`;
}
export function getAccountVolumeByPairId(account: Address, token0: Bytes, token1: Bytes, asMaker: boolean): string {
  if (token0.toHex() > token1.toHex()) {
    const _token1 = token1;
    token1 = token0;
    token0 = _token1;
  }

  const suffix = asMaker ? "maker" : "taker";

  return `${account.toHex()}-${token0.toHex()}-${token1.toHex()}-${suffix}`;
}

export function getEventUniqueId(event: ethereum.Event): string {
  return `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;
}

export function getMarketPairId(market: Market): string {
  const tokens = sortTokens(Address.fromBytes(market.inboundToken), Address.fromBytes(market.outboundToken));
  return `${tokens[0].toHex()}-${tokens[1].toHex()}-${market.tickSpacing.toString()}`;
}
