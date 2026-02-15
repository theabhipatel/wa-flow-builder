import mongoose from "mongoose";
import dotenv from "dotenv";
import Flow from "../models/Flow";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/whatsapp-flow-builder";

async function migrate() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Check if old default flow exists
    const oldFlow = await Flow.findOne({ name: "default" });

    if (oldFlow && !oldFlow.flowId) {
      console.log("Found old flow format, migrating...");

      // Update to new format
      await Flow.updateOne(
        { _id: oldFlow._id },
        {
          $set: {
            flowId: "main",
            type: "main",
            name: "Main Flow",
          },
        },
      );

      console.log("Migration completed successfully!");
    } else {
      console.log("No migration needed or already migrated");
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  }
}

migrate();
