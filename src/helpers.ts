import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { Account, AccountVolumeByPair, KandelParameters, MangroveOrder, Offer, Token } from "../generated/schema";

export const getKandelParamsId = (txHash: Bytes, kandel:Address): string => {
  return `${txHash}-${kandel.toHex()}`;
}


export const getOfferId = (olKeyHash: Bytes, id: BigInt): string => {
  return `${olKeyHash.toHexString()}-${id.toString()}`;
};

export const getOrCreateAccount = (address: Address, currentDate: BigInt, isAnInteraction: boolean): Account => {
  let account = Account.load(address);

  if (!account) {
    account = new Account(address);
    account.address = address;
    account.creationDate = currentDate;
    account.latestInteractionDate = currentDate;
    account.proxyDeployed = false;
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

  const suffix = asMaker ? 'maker' : 'taker';

  return `${account.toHex()}-${token0.toHex()}-${token1.toHex()}-${suffix}`;
};

export const getOrCreateAccountVolumeByPair = (account: Address, token0: Bytes, token1: Bytes, currentDate: BigInt, asMaker: boolean): AccountVolumeByPair => {
  if (token0.toHex() > token1.toHex()) {
    const _token1 = token1;
    token1 = token0;
    token0 = _token1;
  }

  const id = getAccountVolumeByPairId(account, token0, token1, asMaker);

  let volume = AccountVolumeByPair.load(id);
  if (!volume) {
    volume = new AccountVolumeByPair(id);
    volume.account = account;
    volume.token0 = token0;
    volume.token1 = token1;
    volume.token0Sent = BigInt.fromI32(0);
    volume.token0Received = BigInt.fromI32(0);
    volume.token1Sent = BigInt.fromI32(0);
    volume.token1Received = BigInt.fromI32(0);
    volume.updatedDate = currentDate;
    volume.asMaker = asMaker;
    volume.save();
  }
  volume.updatedDate = currentDate;

  return volume;
};

export const increaseAccountVolume = (
  volume: AccountVolumeByPair, 
  token0: Bytes, 
  volumeToken0: BigInt, 
  volumeToken1: BigInt, 
  receivedToken0: boolean,
): void => {
  if (volume.token0 != token0) {
    const _volumeToken0 = volumeToken0;
    volumeToken0 = volumeToken1;
    volumeToken1 = _volumeToken0;
    receivedToken0 = !receivedToken0;
  }

  if (receivedToken0) {
    volume.token0Received = volume.token0Received.plus(volumeToken0);
    volume.token1Sent = volume.token1Sent.plus(volumeToken1);
  } else {
    volume.token0Sent = volume.token0Sent.plus(volumeToken0);
    volume.token1Received = volume.token1Received.plus(volumeToken1);
  }

  volume.save();
};

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
};




export const getEventUniqueId = (event: ethereum.Event): string => {
  return `${event.transaction.hash.toHex()}-${event.logIndex.toHex()}`;
};

export const createMangroveOrder = (
  id: string,
  realTaker: Address,
  orderType: number,
  creationDate: BigInt,
  latestUpdateDate: BigInt,
  isOpen: boolean,
  offer: string
): MangroveOrder => {
  let mangroveOrder = new MangroveOrder(id);
  mangroveOrder.realTaker = realTaker;
  mangroveOrder.orderType = i32(orderType);
  mangroveOrder.creationDate = creationDate;
  mangroveOrder.latestUpdateDate = latestUpdateDate;
  mangroveOrder.isOpen = isOpen;
  mangroveOrder.offer = offer;
  mangroveOrder.order = "";
  mangroveOrder.save();
  return mangroveOrder;
}

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
  let id= getOfferId(olKeyHash, offerId)
  let offer = new Offer(id);
  offer.offerId = offerId;
  offer.latestTransactionHash = transactionHash;
  offer.latestLogIndex = logIndex;
  offer.tick = tick;
  offer.gives = gives;
  offer.gasprice = gasprice;
  offer.gasreq = gasreq;
  offer.gasBase = gasBase;
  offer.isOpen = isOpen;
  offer.isFailed = isFailed;
  offer.isFilled = isFilled;
  offer.isRetracted = isRetracted;
  offer.failedReason = failedReason;
  offer.posthookFailReason = posthookFailReason;
  offer.deprovisioned = deprovisioned;
  offer.market = olKeyHash.toHex() ;
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

export const createDummyOffer = (
  offerNumber: BigInt,
  olKeyHash: Bytes,
): Offer => {
  return createOffer(
    offerNumber,
    olKeyHash,
    Bytes.fromHexString('0x00'),
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
    BigInt.fromI32(0),
    BigInt.fromI32(0),
    BigInt.fromI32(0)
  )
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
