import { uuidv7 } from 'uuidv7';
import { DomainError } from '@domain/errors';

export class Pet {
  constructor(
    private readonly _id: string,
    private _name: string
  ) {
    this.validate();
  }

  static create(name: string): Pet {
    return new Pet(uuidv7(), name);
  }

  private validate(): void {
    if (!this._name || this._name.trim().length < 1) {
      throw new DomainError('Pet name is required');
    }
    if (this._name.length > 255) {
      throw new DomainError('Pet name cannot exceed 255 characters');
    }
  }

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this.validate();
  }
}
