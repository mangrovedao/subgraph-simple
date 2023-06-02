import { Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";

export class AccountEntity extends Entity {
  constructor(id: Bytes, address:  Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
    this.set("address", Value.fromBytes(address));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save AccountEntity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type AccountEntity must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("AccountEntity", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): AccountEntity | null {
    return changetype<AccountEntity | null>(
      store.get_in_block("AccountEntity", id.toHexString())
    );
  }

  static load(id: Bytes): AccountEntity | null {
    return changetype<AccountEntity | null>(
      store.get("AccountEntity", id.toHexString())
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

  get address(): Bytes {
    let value = this.get("address");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }
}
