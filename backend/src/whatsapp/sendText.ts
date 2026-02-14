import axios from "axios";

export const sendTextMessage = async (phone: string, message: string) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Text sent to ${phone}: ${message}`);
  } catch (error: any) {
    console.error("Error sending text:", error.response?.data || error.message);
    throw error;
  }
};
