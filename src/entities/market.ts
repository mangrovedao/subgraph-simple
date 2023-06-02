import { Address, Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";
import { log } from "matchstick-as";

export class MarketEntity extends Entity {
  constructor(outbound_tkn: Address, inbound_tkn: Address) {
    super();
    const id = Bytes.fromUTF8(`${outbound_tkn.toHex()}-${inbound_tkn.toHex()}`);

    this.set("id", Value.fromBytes(id));
    this.set("outbound_tkn", Value.fromBytes(outbound_tkn));
    this.set("inbound_tkn", Value.fromBytes(inbound_tkn));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save MarketEntity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type MarketEntity must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("MarketEntity", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): MarketEntity | null {
    return changetype<MarketEntity | null>(
      store.get_in_block("MarketEntity", id.toHexString())
    );
  }

  static _load(id: Bytes): MarketEntity | null {
    return changetype<MarketEntity | null>(
      store.get("MarketEntity", id.toHexString())
    );
  }

  static load(outbound_tkn: Address, inbound_tkn: Address): MarketEntity | null {
    const id = Bytes.fromUTF8(`${outbound_tkn.toHex()}-${inbound_tkn.toHex()}`);
    return MarketEntity._load(id);
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

  get outbound_tkn(): Bytes {
    let value = this.get("outbound_tkn");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  get inbound_tkn(): Bytes {
    let value = this.get("inbound_tkn");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  get active(): bool {
    let value = this.get("active");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBoolean();
    }
  }

  set active(active: bool) {
    this.set("active", Value.fromBoolean(active));
  }
}
