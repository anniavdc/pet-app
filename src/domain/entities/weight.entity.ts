import { uuidv7 } from 'uuidv7';
import { DomainError } from '@domain/errors';

export class Weight {
  constructor(
    private readonly _id: string,
    private readonly _petId: string,
    private _weight: number,
    private _date: Date
  ) {
    this.validate();
  }

  static create(petId: string, weight: number, date: Date): Weight {
    return new Weight(uuidv7(), petId, weight, date);
  }

  private validate(): void {
    if (this._weight <= 0) {
      throw new DomainError('Weight must be greater than 0');
    }
    if (this._weight > 1000) {
      throw new DomainError('Weight cannot exceed 1000 kg');
    }
    if (this._date > new Date()) {
      throw new DomainError('Weight date cannot be in the future');
    }
  }

  get id(): string {
    return this._id;
  }

  get petId(): string {
    return this._petId;
  }

  get weight(): number {
    return this._weight;
  }

  set weight(value: number) {
    this._weight = value;
    this.validate();
  }

  get date(): Date {
    return this._date;
  }

  set date(value: Date) {
    this._date = value;
    this.validate();
  }
}
