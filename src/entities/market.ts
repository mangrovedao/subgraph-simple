import { Address, Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";
import { log } from "matchstick-as";

export class Market extends Entity {
  constructor(outbound_tkn: Address, inbound_tkn: Address) {
    super();
    const id = Bytes.fromUTF8(`${outbound_tkn.toHex()}-${inbound_tkn.toHex()}`);

    this.set("id", Value.fromBytes(id));
    this.set("outbound_tkn", Value.fromBytes(outbound_tkn));
    this.set("inbound_tkn", Value.fromBytes(inbound_tkn));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Market entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Market must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Market", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): Market | null {
    return changetype<Market | null>(
      store.get_in_block("Market", id.toHexString())
    );
  }

  static _load(id: Bytes): Market | null {
    return changetype<Market | null>(
      store.get("Market", id.toHexString())
    );
  }

  static load(outbound_tkn: Address, inbound_tkn: Address): Market | null {
    const id = Bytes.fromUTF8(`${outbound_tkn.toHex()}-${inbound_tkn.toHex()}`);
    return Market._load(id);
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
