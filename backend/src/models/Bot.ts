import mongoose, { Schema, Document } from "mongoose";

export interface IBot extends Document {
  botId: string;
  name: string;
  description: string;
  whatsappToken?: string;
  whatsappPhoneNumberId?: string;
  whatsappPhoneNumber?: string;
  verifyToken?: string;
  isConnected: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BotSchema = new Schema({
  botId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  whatsappToken: { type: String },
  whatsappPhoneNumberId: { type: String, unique: true, sparse: true },
  whatsappPhoneNumber: { type: String },
  verifyToken: { type: String },
  isConnected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IBot>("Bot", BotSchema);
