import { Bytes, Entity, Value, ValueKind, store } from "@graphprotocol/graph-ts";
import { ERC20 } from "../../generated/Mangrove/Mangrove";

export class TokenEntity extends Entity {
  constructor(id: Bytes, address: Bytes) {
    super();
    this.set("id", Value.fromBytes(id));
    this.set("address", Value.fromBytes(address));

    const contract = ERC20.bind(address);

    const decimals = contract.decimals();
    this.set("decimals", Value.fromI32(decimals));
  }

  save(): void {
    let id = this.get("id");
    assert(id != null, "Cannot save TokenEntity entity without an ID");
    if (id) {
      assert(
        id.kind == ValueKind.BYTES,
        `Entities of type TokenEntity must have an ID of type Bytes but the id '${id.displayData()}' is of type ${id.displayKind()}`
      );
      store.set("TokenEntity", id.toBytes().toHexString(), this);
    }
  }

  static loadInBlock(id: Bytes): TokenEntity | null {
    return changetype<TokenEntity | null>(
      store.get_in_block("TokenEntity", id.toHexString())
    );
  }

  static load(id: Bytes): TokenEntity | null {
    return changetype<TokenEntity | null>(
      store.get("TokenEntity", id.toHexString())
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
