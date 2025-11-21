export class WeightOutputDTO {
  constructor(
    public readonly id: string,
    public readonly petId: string,
    public readonly weight: number,
    public readonly date: string
  ) {}
}
