import { ethereum } from "@graphprotocol/graph-ts";
import {
  Account,
  CleanOrder,
  Kandel,
  KandelDepositWithdraw,
  KandelParameters,
  KandelPopulateRetract,
  LimitOrder,
  Market,
  MarketActivity,
  MarketActivityPair,
  MarketPair,
  Offer,
  OfferFilled,
  Order,
  Token,
  TokenActivity
} from "../../generated/schema";

export function saveToken(token: Token, block: ethereum.Block): void {
  if (token.get("creationDate") == null) {
    token.creationDate = block.timestamp;
  }
  token.latestUpdateDate = block.timestamp;
  token.save();
}

export function saveAccount(account: Account, block: ethereum.Block): void {
  if (account.get("creationDate") == null) {
    account.creationDate = block.timestamp;
  }
  account.latestUpdateDate = block.timestamp;
  account.save();
}

export function saveKandel(kandel: Kandel, block: ethereum.Block): void {
  if (kandel.get("creationDate") == null) {
    kandel.creationDate = block.timestamp;
  }
  kandel.latestUpdateDate = block.timestamp;
  kandel.save();
}

export function saveKandelParameters(kandelParameters: KandelParameters, block: ethereum.Block): void {
  if (kandelParameters.get("creationDate") == null) {
    kandelParameters.creationDate = block.timestamp;
  }
  kandelParameters.latestUpdateDate = block.timestamp;
  kandelParameters.save();
}

export function saveKandelDepositWithdraw(kandelDepositWithdraw: KandelDepositWithdraw, block: ethereum.Block): void {
  if (kandelDepositWithdraw.get("creationDate") == null) {
    kandelDepositWithdraw.creationDate = block.timestamp;
  }
  kandelDepositWithdraw.latestUpdateDate = block.timestamp;
  kandelDepositWithdraw.save();
}

export function saveKandelPopulateRetract(kandelPopulateRetract: KandelPopulateRetract, block: ethereum.Block): void {
  if (kandelPopulateRetract.get("creationDate") == null) {
    kandelPopulateRetract.creationDate = block.timestamp;
  }
  kandelPopulateRetract.latestUpdateDate = block.timestamp;
  kandelPopulateRetract.save();
}
export function saveLimitOrder(limitOrder: LimitOrder, block: ethereum.Block): void {
  if (limitOrder.get("creationDate") == null) {
    limitOrder.creationDate = block.timestamp;
  }
  limitOrder.latestUpdateDate = block.timestamp;
  limitOrder.save();
}

export function saveMarket(market: Market, block: ethereum.Block): void {
  if (market.get("creationDate") == null) {
    market.creationDate = block.timestamp;
  }
  market.latestUpdateDate = block.timestamp;
  market.save();
}

export function saveOffer(offer: Offer, block: ethereum.Block): void {
  if (offer.get("creationDate") == null) {
    offer.creationDate = block.timestamp;
  }
  offer.latestUpdateDate = block.timestamp;
  offer.save();
}

export function saveOrder(order: Order, block: ethereum.Block): void {
  if (order.get("creationDate") == null) {
    order.creationDate = block.timestamp;
  }
  order.latestUpdateDate = block.timestamp;
  order.save();
}

export function saveCleanOrder(cleanOrder: CleanOrder, block: ethereum.Block): void {
  if (cleanOrder.get("creationDate") == null) {
    cleanOrder.creationDate = block.timestamp;
  }
  cleanOrder.latestUpdateDate = block.timestamp;
  cleanOrder.save();
}

export function saveOfferFilled(offerFilled: OfferFilled, block: ethereum.Block): void {
  if (offerFilled.get("creationDate") == null) {
    offerFilled.creationDate = block.timestamp;
  }
  offerFilled.latestUpdateDate = block.timestamp;
  offerFilled.save();
}

export function saveMarketPair(marketPair: MarketPair, block: ethereum.Block): void {
  if (marketPair.get("creationDate") == null) {
    marketPair.creationDate = block.timestamp;
  }
  marketPair.latestUpdateDate = block.timestamp;
  marketPair.save();
}

export function saveMarketActivity(marketActivity: MarketActivity, block: ethereum.Block): void {
  if (marketActivity.get("creationDate") == null) {
    marketActivity.creationDate = block.timestamp;
  }
  marketActivity.latestUpdateDate = block.timestamp;
  marketActivity.save();
}

export function saveMarketActivityPair(marketActivityPair: MarketActivityPair, block: ethereum.Block): void {
  if (marketActivityPair.get("creationDate") == null) {
    marketActivityPair.creationDate = block.timestamp;
  }
  marketActivityPair.latestUpdateDate = block.timestamp;
  marketActivityPair.save();
}

export function saveTokenActivity(tokenActivity: TokenActivity, block: ethereum.Block): void {
  if (tokenActivity.get("creationDate") == null) {
    tokenActivity.creationDate = block.timestamp;
  }
  tokenActivity.latestUpdateDate = block.timestamp;

  tokenActivity.save();
}
