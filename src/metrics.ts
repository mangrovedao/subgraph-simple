import { Address, BigDecimal, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import { Market, MarketActivity, MarketActivityPair, MarketPair, Token, TokenActivity } from "../generated/schema";
import { scale, scaleByToken } from "./helpers";
import { getMarketPairId } from "./helpers/ids";
import { MgvReader, MgvReader__offerListInputOlKeyStruct, MgvReader__offerListResultValue2Struct } from "../generated/Mangrove/MgvReader";
import { getOrCreateAccount, getOrCreateMarketActivityEntry, getOrCreateMarketActivityPairEntry, getOrCreateTokenActivityEntry } from "./helpers/create";
import { saveMarketActivity, saveMarketActivityPair, saveMarketPair, saveTokenActivity } from "./helpers/save";

function setDisplayValuesAndSaveMarket(activity: MarketActivity, inbound: Token, outbound: Token, block: ethereum.Block): void {
  activity.inboundAmountGotDisplay = scale(activity.inboundAmountGot, inbound.decimals);
  activity.inboundAmountGaveDisplay = scale(activity.inboundAmountGave, inbound.decimals);
  activity.outboundAmountGotDisplay = scale(activity.outboundAmountGot, outbound.decimals);
  activity.outboundAmountGaveDisplay = scale(activity.outboundAmountGave, outbound.decimals);
  saveMarketActivity(activity, block);
}

function setDisplayValuesAndSaveMarketPair(activity: MarketActivityPair, inbound: Token, outbound: Token, block: ethereum.Block): void {
  activity.inboundAmountDisplay = scale(activity.inboundAmount, inbound.decimals);
  activity.outboundAmountDisplay = scale(activity.outboundAmount, outbound.decimals);
  saveMarketActivityPair(activity, block);
}

function setDisplayValuesAndSaveToken(activity: TokenActivity, token: Token, block: ethereum.Block): void {
  activity.amountReceivedDisplay = scale(activity.amountReceived, token.decimals);
  activity.amountSentDisplay = scale(activity.amountSent, token.decimals);
  saveTokenActivity(activity, block);
}

const zero = Address.fromBytes(Address.fromHexString("0x0000000000000000000000000000000000000000"));

export function sendAmount(
  taker: Address,
  maker: Address,
  market: Market,
  inbound: Token,
  outbound: Token,
  makerGot: BigInt,
  makerGave: BigInt,
  block: ethereum.Block
): void {
  getOrCreateAccount(zero, block, true);

  const marketActivityPair = getOrCreateMarketActivityPairEntry(maker, taker, market, block);

  const tokenActivityInboundTaker = getOrCreateTokenActivityEntry(taker, inbound, block);
  const tokenActivityOutboundTaker = getOrCreateTokenActivityEntry(taker, outbound, block);

  const tokenActivityInboundMaker = getOrCreateTokenActivityEntry(maker, inbound, block);
  const tokenActivityOutboundMaker = getOrCreateTokenActivityEntry(maker, outbound, block);

  const tokenActivityTotalInbound = getOrCreateTokenActivityEntry(zero, inbound, block);
  const tokenActivityTotalOutbound = getOrCreateTokenActivityEntry(zero, outbound, block);

  const marketActivityTaker = getOrCreateMarketActivityEntry(taker, market, block); // TODO: Should be "real taker"
  const marketActivityMaker = getOrCreateMarketActivityEntry(maker, market, block); // TODO: Should be "real maker"
  const marketActivityTotal = getOrCreateMarketActivityEntry(zero, market, block);

  // TODO: Review exactly what is being added here
  marketActivityMaker.outboundAmountGave = marketActivityMaker.outboundAmountGave.plus(makerGave);
  marketActivityMaker.inboundAmountGot = marketActivityMaker.inboundAmountGot.plus(makerGot);

  marketActivityTaker.inboundAmountGave = marketActivityTaker.inboundAmountGave.plus(makerGot);
  marketActivityTaker.outboundAmountGot = marketActivityTaker.outboundAmountGot.plus(makerGave);

  marketActivityTotal.inboundAmountGave = marketActivityTotal.inboundAmountGave.plus(makerGot);
  marketActivityTotal.inboundAmountGot = marketActivityTotal.inboundAmountGot.plus(makerGot);

  marketActivityTotal.outboundAmountGot = marketActivityTotal.outboundAmountGot.plus(makerGave);
  marketActivityTotal.outboundAmountGave = marketActivityTotal.outboundAmountGave.plus(makerGave);

  tokenActivityInboundTaker.amountSent = tokenActivityInboundTaker.amountSent.plus(makerGot);
  tokenActivityOutboundTaker.amountReceived = tokenActivityOutboundTaker.amountReceived.plus(makerGave);

  tokenActivityInboundMaker.amountReceived = tokenActivityInboundMaker.amountReceived.plus(makerGot);
  tokenActivityOutboundMaker.amountSent = tokenActivityOutboundMaker.amountSent.plus(makerGave);

  tokenActivityTotalInbound.amountReceived = tokenActivityTotalInbound.amountReceived.plus(makerGot);
  tokenActivityTotalOutbound.amountSent = tokenActivityTotalOutbound.amountSent.plus(makerGave);

  marketActivityPair.inboundAmount = marketActivityPair.inboundAmount.plus(makerGot);
  marketActivityPair.outboundAmount = marketActivityPair.outboundAmount.plus(makerGave);

  setDisplayValuesAndSaveMarket(marketActivityTaker, inbound, outbound, block);
  setDisplayValuesAndSaveMarket(marketActivityMaker, inbound, outbound, block);
  setDisplayValuesAndSaveMarket(marketActivityTotal, inbound, outbound, block);

  setDisplayValuesAndSaveToken(tokenActivityInboundTaker, inbound, block);
  setDisplayValuesAndSaveToken(tokenActivityOutboundTaker, outbound, block);

  setDisplayValuesAndSaveToken(tokenActivityInboundMaker, inbound, block);
  setDisplayValuesAndSaveToken(tokenActivityOutboundMaker, outbound, block);

  setDisplayValuesAndSaveToken(tokenActivityTotalInbound, inbound, block);
  setDisplayValuesAndSaveToken(tokenActivityTotalOutbound, outbound, block);

  setDisplayValuesAndSaveMarketPair(marketActivityPair, inbound, outbound, block);
}

const WETH = "0x4300000000000000000000000000000000000004";
const USDB = "0x4300000000000000000000000000000000000003";
const PUNKS20 = "0x9a50953716ba58e3d6719ea5c437452ac578705f";
const PUNKS40 = "0x999f220296b5843b2909cc5f8b4204aaca5341d8";

export const askOrBid = (inboundToken: string, outboundToken: string): string => {
  const pair = `${inboundToken}-${outboundToken}`;
  if (pair == `${WETH}-${USDB}`) return "bid";
  if (pair == `${USDB}-${WETH}`) return "ask";
  if (pair == `${PUNKS20}-${WETH}`) return "bid";
  if (pair == `${WETH}-${PUNKS20}`) return "ask";
  if (pair == `${PUNKS40}-${WETH}`) return "bid";
  if (pair == `${WETH}-${PUNKS40}`) return "ask";
  log.error("Unknown market {}", [pair]);
  throw new Error("Unknown market");
};

export const firstIsBase = (inboundToken: Address, outboundToken: Address): boolean => {
  return askOrBid(inboundToken.toHex(), outboundToken.toHex()) === "bid";
};

export function handleTPV(market: Market, block: ethereum.Block): void {
  log.info("{}", ["Attempting to handle TPV"]);
  const MGVReaderContract = MgvReader.bind(Address.fromString("0x26fD9643Baf1f8A44b752B28f0D90AEBd04AB3F8"));

  const marketSide = askOrBid(market.inboundToken.toHex(), market.outboundToken.toHex());

  const marketPairId = getMarketPairId(market);
  const marketPair = MarketPair.load(marketPairId)!;
  const token = Token.load(market.outboundToken)!;

  const numberOfOffers = BigInt.fromI32(100);
  let currentId = BigInt.fromI32(0);
  const olKey = new MgvReader__offerListInputOlKeyStruct();

  olKey[0] = ethereum.Value.fromAddress(Address.fromBytes(market.inboundToken));
  olKey[1] = ethereum.Value.fromAddress(Address.fromBytes(market.outboundToken));
  olKey[2] = ethereum.Value.fromUnsignedBigInt(market.tickSpacing);

  let allOffers: Array<MgvReader__offerListResultValue2Struct> = [];
  do {
    const result = MGVReaderContract.offerList(olKey, currentId, numberOfOffers);
    currentId = result.getValue0();
    const offers = result.getValue2();
    allOffers = allOffers.concat(offers);
  } while (!currentId.isZero());

  let tickForMarket = BigInt.fromI32(0);
  let totalVolumePromised = BigInt.fromI32(0);

  for (let i = 0; i < allOffers.length; i++) {
    totalVolumePromised = totalVolumePromised.plus(allOffers[i].gives);
    if (tickForMarket.isZero()) {
      tickForMarket = allOffers[i].tick;
    }
  }

  if (marketSide == "ask") {
    marketPair.asks = BigInt.fromI32(allOffers.length);
    marketPair.minAsk = tickForMarket.neg();
    marketPair.totalVolumePromisedQuote = totalVolumePromised;
    marketPair.totalVolumePromisedQuoteDisplay = scaleByToken(totalVolumePromised, token);
  } else {
    marketPair.bids = BigInt.fromI32(allOffers.length);
    marketPair.maxBid = tickForMarket;
    marketPair.totalVolumePromisedBase = totalVolumePromised;
    marketPair.totalVolumePromisedBaseDisplay = scaleByToken(totalVolumePromised, token);
  }

  const hasBid = marketPair.maxBid !== null && !marketPair.maxBid!.isZero();
  const hasAsk = marketPair.minAsk !== null && !marketPair.minAsk!.isZero();
  if (hasAsk && hasBid) {
    let minAskPrice = 1.0001 ** <f64>marketPair.minAsk!.toI64();
    let maxBidPrice = 1.0001 ** <f64>marketPair.maxBid!.toI64();
    marketPair.midPrice = BigDecimal.fromString(((minAskPrice + maxBidPrice) / 2).toString());
    marketPair.spread = BigDecimal.fromString(((maxBidPrice - minAskPrice) / maxBidPrice).toString());
  } else if (hasAsk && !hasBid) {
    let minAskPrice = 1.0001 ** <f64>marketPair.minAsk!.toI64();
    marketPair.midPrice = BigDecimal.fromString(minAskPrice.toString());
    marketPair.spread = null;
  } else if (hasBid && !hasAsk) {
    let maxBidPrice = 1.0001 ** <f64>marketPair.maxBid!.toI64();
    marketPair.midPrice = BigDecimal.fromString(maxBidPrice.toString());
    marketPair.spread = null;
  } else {
    marketPair.midPrice = null;
    marketPair.spread = null;
  }
  saveMarketPair(marketPair, block);
}