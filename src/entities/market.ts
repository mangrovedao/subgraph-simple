import { Address, Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";

export class Market extends Entity {
  static computeId(outbound_tkn: Address, inbound_tkn: Address): string {
    return `${outbound_tkn.toHex()}-${inbound_tkn.toHex()}`;
  }

  constructor(outbound_tkn: Address, inbound_tkn: Address) {
    super();

    this.set("id", Value.fromString(Market.computeId(outbound_tkn, inbound_tkn)));
    this.set("outbound_tkn", Value.fromBytes(outbound_tkn));
    this.set("inbound_tkn", Value.fromBytes(inbound_tkn));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Market entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.STRING,
        `Entities of type Market must have an ID of type String but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Market", id.toString(), this);
    }
  }

  static loadInBlock(id: string): Market | null {
    return changetype<Market | null>(
      store.get_in_block("Market", id)
    );
  }

  static _load(id: string): Market | null {
    return changetype<Market | null>(
      store.get("Market", id)
    );
  }

  static load(outbound_tkn: Address, inbound_tkn: Address): Market | null {
    return Market._load(Market.computeId(outbound_tkn, inbound_tkn));
  }

  get id(): string {
    let value = this.get("id");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toString();
    }
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
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
