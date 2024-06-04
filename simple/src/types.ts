import { BigInt, Bytes } from "@graphprotocol/graph-ts";
import { OfferWrite } from "../generated/Mangrove/Mangrove";

export class PartialOfferWrite {
  static PARAMETERS_COUNT: u32 = 10;

  constructor(
    public timestamp: BigInt,
    public logIndex: BigInt,
    public transactionHash: Bytes,
    public olKeyHash: Bytes,
    public maker: Bytes,
    public tick: BigInt,
    public gives: BigInt,
    public gasprice: BigInt,
    public gasreq: BigInt,
    public id: BigInt
  ) {}

  static fromEncodedArray(encoded: Array<string>): PartialOfferWrite {
    if (encoded.length != PartialOfferWrite.PARAMETERS_COUNT) {
      throw new Error("Invalid encoded array length");
    }

    return new PartialOfferWrite(
      BigInt.fromString(encoded.at(0)),
      BigInt.fromString(encoded.at(1)),
      Bytes.fromHexString(encoded.at(2)),
      Bytes.fromHexString(encoded.at(3)),
      Bytes.fromHexString(encoded.at(4)),
      BigInt.fromString(encoded.at(5)),
      BigInt.fromString(encoded.at(6)),
      BigInt.fromString(encoded.at(7)),
      BigInt.fromString(encoded.at(8)),
      BigInt.fromString(encoded.at(9))
    );
  }

  static fromOfferWrite(event: OfferWrite): PartialOfferWrite {
    return new PartialOfferWrite(
      event.block.timestamp,
      event.logIndex,
      event.transaction.hash,
      event.params.olKeyHash,
      event.params.maker,
      event.params.tick,
      event.params.gives,
      event.params.gasprice,
      event.params.gasreq,
      event.params.id
    );
  }
}
