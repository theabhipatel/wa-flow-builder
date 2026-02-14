import axios from "axios";

export const sendButtonMessage = async (
  phone: string,
  message: string,
  buttons: { id: string; title: string }[]
) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const buttonPayload = buttons.slice(0, 3).map((btn) => ({
    type: "reply",
    reply: {
      id: btn.id,
      title: btn.title,
    },
  }));

  try {
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: message },
          action: { buttons: buttonPayload },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`Buttons sent to ${phone}`);
  } catch (error: any) {
    console.error(
      "Error sending buttons:",
      error.response?.data || error.message
    );
    throw error;
  }
};
