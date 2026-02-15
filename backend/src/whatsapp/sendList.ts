import axios, { AxiosError } from "axios";

export interface ListItem {
  id: string;
  title: string;
  description?: string;
}

export const sendListMessage = async (
  phone: string,
  message: string,
  buttonText: string,
  listItems: ListItem[],
) => {
  const url = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  // WhatsApp API supports up to 10 items in a single section
  const rows = listItems.slice(0, 10).map((item) => ({
    id: item.id,
    title: item.title.slice(0, 24), // Max 24 characters for title
    description: item.description ? item.description.slice(0, 72) : undefined, // Max 72 characters for description
  }));

  try {
    await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "interactive",
        interactive: {
          type: "list",
          body: { text: message },
          action: {
            button: buttonText.slice(0, 20), // Max 20 characters for button text
            sections: [
              {
                title: "Options",
                rows: rows,
              },
            ],
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json",
        },
      },
    );
    console.log(`List message sent to ${phone}`);
  } catch (error: any) {
    if (error instanceof AxiosError) {
      console.error("📍Error sending list messages 👉 :", error.response?.data);
    } else {
      console.error("📍Error sending list messages 👉 :", error.message);
      throw error;
    }
  }
};
