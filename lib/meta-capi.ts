import crypto from "crypto";

interface CapiEventData {
  pixelId: string;
  accessToken: string;
  eventName: "Lead" | "Purchase" | "InitiateCheckout";
  eventTime?: number;
  eventSourceUrl?: string;
  userIp?: string;
  userAgent?: string;
  fbclid?: string;
  customData?: {
    currency?: string;
    value?: number;
    content_name?: string;
    order_id?: string;
  };
  eventId?: string;
}

export async function sendMetaCapiEvent(data: CapiEventData): Promise<{ success: boolean; error?: string }> {
  const {
    pixelId,
    accessToken,
    eventName,
    eventTime = Math.floor(Date.now() / 1000),
    eventSourceUrl,
    userIp,
    userAgent,
    fbclid,
    customData,
    eventId = crypto.randomUUID(),
  } = data;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        action_source: "website",
        user_data: {
          client_ip_address: userIp,
          client_user_agent: userAgent,
          fbc: fbclid ? `fb.1.${eventTime * 1000}.${fbclid}` : undefined,
        },
        custom_data: customData,
      },
    ],
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const json = await res.json();
    if (json.error) return { success: false, error: json.error.message };
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
