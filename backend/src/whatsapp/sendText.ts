import axios, { AxiosError } from "axios";

export const sendTextMessage = async (
  phone: string,
  message: string,
  token: string,
  phoneNumberId: string,
) => {
  const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

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
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`Text sent to ${phone}: ${message}`);
  } catch (error: any) {
    if (error instanceof AxiosError) {
      console.error("📍Error sending text👉 :", error.response?.data);
    } else {
      console.error("Error sending text:", error.message);
      throw error;
    }
  }
};
