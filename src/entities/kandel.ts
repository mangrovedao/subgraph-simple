import { Address, Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";

export class Kandel extends Entity {
  constructor(id: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save Kandel entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type Kandel must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("Kandel", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): Kandel | null {
    return changetype<Kandel | null>(
      store.get_in_block("Kandel", id.toHexString())
    );
  }

  static load(id: Bytes): Kandel | null {
    return changetype<Kandel | null>(
      store.get("Kandel", id.toHexString())
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

  get seeder(): Bytes {
    let value = this.get("seeder");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set seeder(seeder: Bytes) {
    this.set("seeder", Value.fromBytes(seeder));
  }

  get address(): Bytes {
    let value = this.get("address");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set address(address: Bytes) {
    this.set("address", Value.fromBytes(address));
  }

  get base(): Bytes {
    let value = this.get("base");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set base(base: Bytes) {
    this.set("base", Value.fromBytes(base));
  }

  get quote(): Bytes {
    let value = this.get("quote");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set quote(quote: Bytes) {
    this.set("quote", Value.fromBytes(quote));
  }

  get owner(): Address {
    let value = this.get("owner");
    if (!value || value.kind == ValueKind.NULL) {
      throw new Error("Cannot return null for a required field.");
    } else {
      return value.toBytes();
    }
  }

  set owner(owner: Address) {
    this.set("owner", Value.fromAddress(owner));
  }
}
