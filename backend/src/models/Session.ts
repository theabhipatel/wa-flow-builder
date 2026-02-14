import mongoose, { Schema, Document } from "mongoose";

export interface ISession extends Document {
  phone: string;
  currentNodeId: string | null;
  waitingForButton: boolean;
  waitingNodeId?: string;
  updatedAt: Date;
}

const SessionSchema = new Schema({
  phone: { type: String, required: true, unique: true },
  currentNodeId: { type: String, default: null },
  waitingForButton: { type: Boolean, default: false },
  waitingNodeId: { type: String },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<ISession>("Session", SessionSchema);
