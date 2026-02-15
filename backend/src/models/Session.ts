import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  phone: string;
  botId: string;
  currentFlowId: string;
  currentNodeId: string | null;
  waitingForButton: boolean;
  waitingNodeId?: string;
  callStack: Array<{ flowId: string; nodeId: string }>;
  variables: Record<string, any>;
  updatedAt: Date;
}

const SessionSchema = new Schema({
  phone: { type: String, required: true },
  botId: { type: String, required: true },
  currentFlowId: { type: String, default: "main" },
  currentNodeId: { type: String, default: null },
  waitingForButton: { type: Boolean, default: false },
  waitingNodeId: { type: String },
  callStack: { type: Array, default: [] },
  variables: { type: Object, default: {} },
  updatedAt: { type: Date, default: Date.now },
});

SessionSchema.index({ phone: 1, botId: 1 }, { unique: true });

export default mongoose.model<ISession>("Session", SessionSchema);
