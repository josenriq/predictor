import { Id, Entity, Storage } from '@predictor/domain';
import { Guard } from '@predictor/core';

export class Party extends Entity<Party> {
  constructor(
    public readonly id: Id,
    public readonly name: string,
    public readonly ownerId: Id,
    public readonly memberIds: Array<Id>,
  ) {
    super(id);
    Guard.nonempty(this.name, 'name');
    Guard.require(this.ownerId, 'ownerId');
    Guard.require(this.memberIds, 'memberIds');
  }

  addMember(userId: Id): Party {
    Guard.require(userId, 'userId');

    if (this.memberIds.includes(userId)) return this;
    return new Party(this.id, this.name, this.ownerId, [
      ...this.memberIds,
      userId,
    ]);
  }

  removeMember(userId: Id): Party {
    Guard.require(userId, 'userId');
    return new Party(
      this.id,
      this.name,
      this.ownerId,
      this.memberIds.filter(id => !id.equals(userId)),
    );
  }

  hasMembers(): boolean {
    return this.memberIds.length > 0;
  }

  toString(): string {
    return `[${this.id}] ${this.name}`;
  }

  static create(name: string, ownerId: Id): Party {
    Guard.nonempty(name, 'name');
    Guard.require(ownerId, 'ownerId');

    return new Party(Id.generate(), name, ownerId, [ownerId]);
  }
}

export type PartyStorage = Storage<Party> & {
  delete(id: Id): Promise<void>;
  listByMember(memberId: Id): Promise<Array<Party>>;
};
