import { Schema, model, Document } from 'mongoose';

export interface ICounter extends Document<string> {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<ICounter>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, default: 0 },
  },
  { _id: false, versionKey: false }
);

export const CounterModel = model<ICounter>('Counter', counterSchema);
