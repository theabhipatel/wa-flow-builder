import mongoose, { Schema, Document } from "mongoose";

export interface IFlow extends Document {
  name: string;
  nodes: any[];
  edges: any[];
  updatedAt: Date;
}

const FlowSchema = new Schema({
  name: { type: String, required: true, default: "default" },
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFlow>("Flow", FlowSchema);
