import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Account, KandelParameters, LimitOrder, Market, Offer, Token } from "../generated/schema";

export const getKandelParamsId = (txHash: Bytes, kandel: Address): string => {
  return `${txHash}-${kandel.toHex()}`;
};

export const getOfferId = (olKeyHash: Bytes, id: BigInt): string => {
  return `${olKeyHash.toHex()}-${id.toString()}`;
};

export const getMarketActivityId = (user: Address, market: Market): string => {
  return `${user.toHex()}-${market.id.toString()}`;
};

export const getMarketActivityPairId = (maker: Address, taker: Address, market: Market): string => {
  return `${maker.toHex()}-${taker.toHex()}-${market.id.toString()}`;
};

export const getTokenActivityId = (user: Address, token: Token): string => {
  return `${user.toHex()}-${token.address.toHex()}`;
};

export const getOrCreateAccount = (address: Address, currentDate: BigInt, isAnInteraction: boolean): Account => {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address);
    account.address = address;
    account.creationDate = currentDate;
    account.latestInteractionDate = currentDate;
    account.proxyDeployed = false;
    account.isReferrer = false;
    account.save();
  }

  if (isAnInteraction) {
    account.latestInteractionDate = currentDate;
    account.save();
  }

  return account;
};

export const getAccountVolumeByPairId = (account: Address, token0: Bytes, token1: Bytes, asMaker: boolean): string => {
  if (token0.toHex() > token1.toHex()) {
    const _token1 = token1;
    token1 = token0;
    token0 = _token1;
  }

  const suffix = asMaker ? "maker" : "taker";

  return `${account.toHex()}-${token0.toHex()}-${token1.toHex()}-${suffix}`;
};

export const getOrCreateKandelParameters = (txHash: Bytes, timestamp: BigInt, kandel: Address): KandelParameters => {
  let kandelParameters = KandelParameters.load(getKandelParamsId(txHash, kandel)); // TODO: use load in block

  if (kandelParameters === null) {
    kandelParameters = new KandelParameters(getKandelParamsId(txHash, kandel));
    kandelParameters.transactionHash = txHash;
    kandelParameters.creationDate = timestamp;
    kandelParameters.kandel = kandel;
    kandelParameters.save();
  }
  return kandelParameters;
};

export const getEventUniqueId = (event: ethereum.Event): string => {
  return `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;
};

export const createLimitOrder = (
  id: string,
  realTaker: Address,
  orderType: number,
  creationDate: BigInt,
  latestUpdateDate: BigInt,
  isOpen: boolean,
  offer: string
): LimitOrder => {
  let limitOrder = new LimitOrder(id);
  limitOrder.realTaker = realTaker;
  limitOrder.orderType = i32(orderType);
  limitOrder.creationDate = creationDate;
  limitOrder.latestUpdateDate = latestUpdateDate;
  limitOrder.isOpen = isOpen;
  limitOrder.offer = offer;
  limitOrder.order = "";
  limitOrder.fillVolume = BigInt.fromI32(0);
  limitOrder.fillWants = false;
  limitOrder.tick = BigInt.fromI32(0);
  limitOrder.inboundRoute = Address.zero();
  limitOrder.outboundRoute = Address.zero();
  limitOrder.save();
  return limitOrder;
};

export const createOffer = (
  offerId: BigInt,
  olKeyHash: Bytes,
  transactionHash: Bytes,
  logIndex: BigInt,
  tick: BigInt,
  gives: BigInt,
  gasprice: BigInt,
  gasreq: BigInt,
  gasBase: BigInt,
  isOpen: boolean,
  isFailed: boolean,
  isFilled: boolean,
  isRetracted: boolean,
  failedReason: Bytes | null,
  posthookFailReason: Bytes,
  deprovisioned: boolean,
  maker: Address,
  creationDate: BigInt,
  latestUpdateDate: BigInt,
  latestPenalty: BigInt,
  totalPenalty: BigInt,
  totalGot: BigInt,
  totalGave: BigInt
): Offer => {
  let id = getOfferId(olKeyHash, offerId);
  let offer = new Offer(id);
  offer.offerId = offerId;
  offer.latestTransactionHash = transactionHash;
  offer.latestLogIndex = logIndex;
  offer.tick = tick;
  offer.gives = gives;
  offer.gasPrice = gasprice;
  offer.gasReq = gasreq;
  offer.gasBase = gasBase;
  offer.isOpen = isOpen;
  offer.isFailed = isFailed;
  offer.isFilled = isFilled;
  offer.isRetracted = isRetracted;
  offer.failedReason = failedReason;
  offer.posthookFailReason = posthookFailReason;
  offer.deprovisioned = deprovisioned;
  offer.market = olKeyHash.toHex();
  offer.maker = maker;
  offer.creationDate = creationDate;
  offer.latestUpdateDate = latestUpdateDate;
  offer.latestPenalty = latestPenalty;
  offer.totalPenalty = totalPenalty;
  offer.totalGave = totalGave;
  offer.totalGot = totalGot;
  offer.save();
  return offer;
};

export const createDummyOffer = (offerNumber: BigInt, olKeyHash: Bytes): Offer => {
  return createOffer(
    offerNumber,
    olKeyHash,
    Bytes.fromHexString("0x00"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    false,
    false,
    false,
    false,
    Bytes.fromHexString("0x00"),
    Bytes.fromHexString("0x00"),
    false,
    Address.fromString("0x0000000000000000000000000000000100000004"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0)
  );
};

export const getOrCreateToken = (address: Address): Token => {
  let token = Token.load(address);

  if (!token) {
    token = new Token(address);
    token.address = address;

    token.name = ethereum.call(new ethereum.SmartContractCall("ERC20", address, "name", "name():(string)", new Array()))![0].toString();
    token.symbol = ethereum.call(new ethereum.SmartContractCall("ERC20", address, "symbol", "symbol():(string)", new Array()))![0].toString();
    token.decimals = ethereum.call(new ethereum.SmartContractCall("ERC20", address, "decimals", "decimals():(uint8)", new Array()))![0].toBigInt();

    token.save();
  }

  return token;
};
