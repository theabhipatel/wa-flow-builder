import mongoose, { Schema, Document } from "mongoose";

export interface IFlow extends Document {
  name: string;
  flowId: string;
  type: "main" | "subflow";
  botId: string;
  nodes: any[];
  edges: any[];
  createdAt: Date;
  updatedAt: Date;
}

const FlowSchema = new Schema({
  name: { type: String, required: true },
  flowId: { type: String, required: true, unique: true },
  type: { type: String, enum: ["main", "subflow"], required: true },
  botId: { type: String, required: true },
  nodes: { type: Array, required: true },
  edges: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFlow>("Flow", FlowSchema);
