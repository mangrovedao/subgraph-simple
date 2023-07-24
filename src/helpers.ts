import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Account, OrderStack, Offer, Order, KandelParameters } from "../generated/schema";

export const getKandelParamsId = (txHash: Bytes, kandel:Address): string => {
  return `${txHash}-${kandel.toHex()}`;
}

export const getMarketId = (outbound_tkn: Address, inbound_tkn: Address): string  => {
  return `${outbound_tkn.toHex()}-${inbound_tkn.toHex()}`;
};

export const getOfferId = (outbound_tkn: Address, inbound_tkn: Address, id: BigInt): string => {
  return `${outbound_tkn.toHex()}-${inbound_tkn.toHex()}-${id.toHex()}`;
};

export const getOrCreateAccount = (address: Address): Account => {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address);
    account.address = address;
    account.save();
  }

  return account;
}

export const getOrCreateKandelParameters = (txHash: Bytes, timestamp: BigInt, kandel:Address): KandelParameters => {
  let kandelParameters = KandelParameters.load(getKandelParamsId(txHash, kandel)); // TODO: use load in block

  if (kandelParameters === null) {
    kandelParameters = new KandelParameters(getKandelParamsId(txHash, kandel));
    kandelParameters.transactionHash = txHash;
    kandelParameters.creationDate = timestamp;
    kandelParameters.kandel = kandel;
    kandelParameters.save();
  }
  return kandelParameters;
}


export const getOrderStack = (): OrderStack => {
  let orderStack = OrderStack.load('orderStack');
  if (orderStack === null) {
    orderStack = new OrderStack('orderStack');
    orderStack.ids = ``;

    orderStack.save();
  }

  return orderStack;
}

export const addOrderToStack = (order: Order): void => {
  const orderStack = getOrderStack();

  orderStack.ids = `${orderStack.ids}|${order.id}`

  orderStack.save();
}

export const getOrderFromStack = (): Order => {
  const orderStack = getOrderStack();
  const ids = orderStack.ids;

  const idsArray = ids.split('|');
  const order = Order.load(idsArray[idsArray.length - 1])!;

  return order;
}


export const removeOrderFromStack = (): void => {
  const orderStack = getOrderStack();

  const ids = orderStack.ids;
  for (let i = ids.length - 1 ; i >= 0 ; --i) {
    if (ids.at(i) == '|' || i == 0) {
      orderStack.ids = ids.slice(0, i);
      orderStack.last = ids.slice(i + 1);
      break;
    }
  }

  orderStack.save();
}

export const getLastOrder = (): Order => {
  const orderStack = getOrderStack();

  const order = Order.load(orderStack.last!)!;
  return order;
}

export const getEventUniqueId = (event: ethereum.Event): string => {
  return `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;
}

export const createOffer = (
  offerId: BigInt,
  inbound_tkn: Address,
  outbound_tkn: Address,
  transactionHash: Bytes,
  logIndex: BigInt,
  wants: BigInt,
  gives: BigInt,
  gasprice: BigInt,
  gasreq: BigInt,
  gasBase: BigInt,
  prev: BigInt,
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
  totalGot: BigInt,
  totalGave: BigInt
): Offer => {
  let id= getOfferId(outbound_tkn, inbound_tkn, offerId)
  let offer = new Offer(id);
  offer.offerId = offerId;
  offer.latestTransactionHash = transactionHash;
  offer.latestLogIndex = logIndex;
  offer.wants = wants;
  offer.gives = gives;
  offer.gasprice = gasprice;
  offer.gasreq = gasreq;
  offer.gasBase = gasBase;
  offer.prev = prev;
  offer.isOpen = isOpen;
  offer.isFailed = isFailed;
  offer.isFilled = isFilled;
  offer.isRetracted = isRetracted;
  offer.failedReason = failedReason;
  offer.posthookFailReason = posthookFailReason;
  offer.deprovisioned = deprovisioned;
  offer.market = getMarketId(outbound_tkn, inbound_tkn);
  offer.maker = maker;
  offer.creationDate = creationDate;
  offer.latestUpdateDate = latestUpdateDate;
  offer.totalGave = totalGave;
  offer.totalGot = totalGot;
  offer.save();
  return offer;
}

export const createDummyOffer = (
  offerNumber: BigInt,
  inbound_tkn: Address,
  outbound_tkn: Address
): Offer => {
  return createOffer(
    offerNumber,
    inbound_tkn,
    outbound_tkn,
    Bytes.fromHexString('0x00'),
    BigInt.fromI32(0),
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
    Bytes.fromHexString('0x00'),
    Bytes.fromHexString('0x00'),
    false,
    Address.fromString("0x0000000000000000000000000000000100000004"),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0)
  )
}
