import { Address, BigDecimal, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { KandelParameters, LimitOrder, Offer, Token } from "../generated/schema";
import { saveKandelParameters, saveLimitOrder, saveOffer } from "./helpers/save";
import { getKandelParamsId, getOfferId } from "./helpers/ids";

export function getOrCreateKandelParameters(txHash: Bytes, timestamp: BigInt, kandel: Address, block: ethereum.Block): KandelParameters {
  let kandelParameters = KandelParameters.load(getKandelParamsId(txHash, kandel)); // TODO: use load in block

  if (kandelParameters === null) {
    kandelParameters = new KandelParameters(getKandelParamsId(txHash, kandel));
    kandelParameters.transactionHash = txHash;
    kandelParameters.kandel = kandel;
    saveKandelParameters(kandelParameters, block);
  }
  return kandelParameters;
}

export const createLimitOrder = (id: string, realTaker: Address, orderType: number, isOpen: boolean, offer: string, block: ethereum.Block): LimitOrder => {
  let limitOrder = new LimitOrder(id);
  limitOrder.realTaker = realTaker;
  limitOrder.orderType = i32(orderType);
  limitOrder.isOpen = isOpen;
  limitOrder.offer = offer;
  limitOrder.order = "";
  limitOrder.fillVolume = BigInt.fromI32(0);
  limitOrder.fillWants = false;
  limitOrder.tick = BigInt.fromI32(0);
  limitOrder.inboundRoute = Address.zero();
  limitOrder.outboundRoute = Address.zero();
  saveLimitOrder(limitOrder, block);
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
  totalGave: BigInt,
  block: ethereum.Block
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
  offer.realMaker = maker;
  offer.latestPenalty = latestPenalty;
  offer.totalPenalty = totalPenalty;
  offer.totalGave = totalGave;
  offer.totalGot = totalGot;
  saveOffer(offer, block);
  return offer;
};

export const createDummyOffer = (offerNumber: BigInt, olKeyHash: Bytes, block: ethereum.Block): Offer => {
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
    BigInt.fromI32(0),
    block
  );
};

export function scale(amount: BigInt, decimals: BigInt): BigDecimal {
  return amount.toBigDecimal().div(
    BigInt.fromU32(10)
      .pow(<u8>decimals.toU32())
      .toBigDecimal()
  );
}

export function scaleByToken(amount: BigInt, token: Token): BigDecimal {
  return amount.toBigDecimal().div(
    BigInt.fromU32(10)
      .pow(<u8>token.decimals.toU32())
      .toBigDecimal()
  );
}

export function sortTokens(token0: Address, token1: Address): Array<Address> {
  if (token0.toHex() <= token1.toHex()) {
    return [token0, token1];
  }
  return [token1, token0];
}
