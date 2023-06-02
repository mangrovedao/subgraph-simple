import { Address, BigInt, Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";
import { AccountEntity } from "./account";
import { MarketEntity } from "./market";
import { log } from "matchstick-as";

export class OfferEntity extends Entity {
  static computeId(id: BigInt, outbound_tkn: Bytes, inbound_tkn: Bytes): Bytes {
    const idAsHexString = Bytes.fromByteArray(Bytes.fromBigInt(id)).toHexString();
    return Bytes.fromUTF8(`${outbound_tkn.toHex()}-${inbound_tkn.toHex()}-${idAsHexString}`);
  }

  constructor(id: BigInt, outbound_tkn: Address, inbound_tkn: Address) {
    super();
    this.set("id", Value.fromBytes(OfferEntity.computeId(id, outbound_tkn, inbound_tkn)));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save OfferEntity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type OfferEntity must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("OfferEntity", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): OfferEntity | null {
    return changetype<OfferEntity | null>(
      store.get_in_block("OfferEntity", id.toHexString())
    );
  }

  static _load(id: Bytes): OfferEntity | null {
    return changetype<OfferEntity | null>(
      store.get("OfferEntity", id.toHexString())
    );
  }

  static load(id: BigInt, outbound_tkn: Address, inbound_tkn: Address): OfferEntity | null {
    const _id = OfferEntity.computeId(id, outbound_tkn, inbound_tkn);
    return changetype<OfferEntity | null>(
      store.get("OfferEntity", _id.toHexString()),
    );
  }

  get id(): Bytes {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set id(value: Bytes) {
    this.set("id", Value.fromBytes(value));
  }

  getMarket(): MarketEntity {
    let value = this.get("market");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return MarketEntity._load(value.toBytes())!;
    }
  }

  setMarket(market: MarketEntity): void {
    this.set("market", Value.fromBytes(market.id));
  }

  getMaker(): AccountEntity {
    let value = this.get("maker");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return AccountEntity.load(value.toBytes())!;
    }
  }

  setMaker(acount: AccountEntity): void {
    this.set("maker", Value.fromBytes(acount.id));
  }

  get wants(): BigInt {
    let value = this.get("wants");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set wants(value: BigInt) {
    this.set('wants', Value.fromBigInt(value));
  }

  get initialWants(): BigInt {
    let value = this.get("initialWants");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set initialWants(value: BigInt) {
    this.set('initialWants', Value.fromBigInt(value));
  }

  get initialGives(): BigInt {
    let value = this.get("initialGives");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set initialGives(value: BigInt) {
    this.set('initialGives', Value.fromBigInt(value));
  }

  get gives(): BigInt {
    let value = this.get("gives");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set gives(value: BigInt) {
    this.set('gives', Value.fromBigInt(value));
  }

  get gasprice(): BigInt {
    let value = this.get("gasprice");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set gasprice(value: BigInt) {
    this.set('gasprice', Value.fromBigInt(value));
  }

  get gasreq(): BigInt {
    let value = this.get("gasreq");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set gasreq(value: BigInt) {
    this.set('gasreq', Value.fromBigInt(value));
  }

  get _id(): BigInt {
    let value = this.get("_id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set _id(value: BigInt) {
    this.set('_id', Value.fromBigInt(value));
  }

  get prev(): BigInt {
    let value = this.get("prev");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBigInt();
    }
  }

  set prev(value: BigInt) {
    this.set('prev', Value.fromBigInt(value));
  }

  get isOpen(): bool {
    let value = this.get("isOpen");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBoolean();
    }
  }

  set isOpen(value: bool) {
    this.set('isOpen', Value.fromBoolean(value));
  }

  get isFailed(): bool {
    let value = this.get("isFailed");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBoolean();
    }
  }

  set isFailed(value: bool) {
    this.set('isFailed', Value.fromBoolean(value));
  }

  get isFilled(): bool {
    let value = this.get("isFilled");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBoolean();
    }
  }

  set isFilled(value: bool) {
    this.set('isFilled', Value.fromBoolean(value));
  }

  get failedReason(): string {
    let value = this.get("failedReason");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set failedReason(value: string) {
    this.set('failedReason', Value.fromString(value));
  }
}
