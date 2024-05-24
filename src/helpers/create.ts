import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { Account, Market, MarketActivity, MarketActivityPair, Token, TokenActivity } from "../../generated/schema";
import { saveAccount, saveMarketActivity, saveMarketActivityPair, saveToken, saveTokenActivity } from "./save";
import { getMarketActivityId, getMarketActivityPairId, getTokenActivityId } from "../helpers/ids";

export const getOrCreateToken = (address: Address, block: ethereum.Block): Token => {
  let token = Token.load(address);

  if (!token) {
    token = new Token(address);
    token.address = address;

    token.name = ethereum.call(new ethereum.SmartContractCall("ERC20", address, "name", "name():(string)", new Array()))![0].toString();
    token.symbol = ethereum.call(new ethereum.SmartContractCall("ERC20", address, "symbol", "symbol():(string)", new Array()))![0].toString();
    token.decimals = ethereum.call(new ethereum.SmartContractCall("ERC20", address, "decimals", "decimals():(uint8)", new Array()))![0].toBigInt();

    saveToken(token, block);
  }

  return token;
};

export const getOrCreateAccount = (address: Address, block: ethereum.Block, isAnInteraction: boolean): Account => {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address);
    account.address = address;
    account.proxyDeployed = false;
    account.isReferrer = false;
    saveAccount(account, block);
  }

  if (isAnInteraction) {
    saveAccount(account, block);
  }

  return account;
};

export const getOrCreateMarketActivityEntry = (user: Address, market: Market, block: ethereum.Block): MarketActivity => {
  const marketActivityId = getMarketActivityId(user, market);
  let activity = MarketActivity.load(marketActivityId);
  if (!activity) {
    const marketActivityId = getMarketActivityId(user, market);
    activity = new MarketActivity(marketActivityId);

    activity.account = user;
    activity.market = market.id;
    activity.inboundAmountGot = BigInt.fromI32(0);
    activity.inboundAmountGave = BigInt.fromI32(0);

    activity.outboundAmountGot = BigInt.fromI32(0);
    activity.outboundAmountGave = BigInt.fromI32(0);

    activity.inboundAmountGotDisplay = BigInt.fromI32(0).toBigDecimal();
    activity.inboundAmountGaveDisplay = BigInt.fromI32(0).toBigDecimal();

    activity.outboundAmountGotDisplay = BigInt.fromI32(0).toBigDecimal();
    activity.outboundAmountGaveDisplay = BigInt.fromI32(0).toBigDecimal();

    saveMarketActivity(activity, block);
    return activity;
  }
  return activity;
};

export const getOrCreateTokenActivityEntry = (user: Address, token: Token, block: ethereum.Block): TokenActivity => {
  const tokenActivityId = getTokenActivityId(user, token);
  let activity = TokenActivity.load(tokenActivityId);
  if (!activity) {
    const tokenActivityId = getTokenActivityId(user, token);
    activity = new TokenActivity(tokenActivityId);

    activity.account = user;
    activity.token = token.id;
    activity.amountSent = BigInt.fromI32(0);
    activity.amountReceived = BigInt.fromI32(0);
    activity.amountReceivedDisplay = BigInt.fromI32(0).toBigDecimal();
    activity.amountSentDisplay = BigInt.fromI32(0).toBigDecimal();
    saveTokenActivity(activity, block);
  }
  return activity;
};

export const getOrCreateMarketActivityPairEntry = (maker: Address, taker: Address, market: Market, block: ethereum.Block): MarketActivityPair => {
  const marketActivityPairId = getMarketActivityPairId(maker, taker, market);
  let activity = MarketActivityPair.load(marketActivityPairId);
  if (!activity) {
    const marketActivityPairId = getMarketActivityPairId(maker, taker, market);
    activity = new MarketActivityPair(marketActivityPairId);

    activity.maker = maker;
    activity.taker = taker;
    activity.market = market.id;

    activity.inboundAmount = BigInt.fromI32(0);
    activity.outboundAmount = BigInt.fromI32(0);
    activity.inboundAmountDisplay = BigInt.fromI32(0).toBigDecimal();
    activity.outboundAmountDisplay = BigInt.fromI32(0).toBigDecimal();
    saveMarketActivityPair(activity, block);
  }
  return activity;
};
