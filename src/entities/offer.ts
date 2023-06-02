import { BigInt, Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";
import { AccountEntity } from "./account";
import { MarketEntity } from "./market";

export class OfferEntity extends Entity {
  constructor(id: Bytes, maker: AccountEntity, market: MarketEntity) {
    super();
    this.set("id", Value.fromBytes(id));
    this.set("maker", Value.fromBytes(maker.address));
    this.set("market", Value.fromBytes(market.id));
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

  static load(id: Bytes): OfferEntity | null {
    return changetype<OfferEntity | null>(
      store.get("OfferEntity", id.toHexString())
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
}
