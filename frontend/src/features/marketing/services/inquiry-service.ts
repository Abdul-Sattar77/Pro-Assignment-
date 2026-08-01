import { apiClient } from "@/lib/api-client";

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

interface InquiryResponse {
  data: { message: string };
}

/**
 * Submit a public landing-page enquiry. The route is unauthenticated, so this
 * works for logged-out visitors; the backend persists it and emails the studio.
 * Returns the friendly confirmation message from the API.
 */
export async function submitInquiry(payload: InquiryPayload): Promise<string> {
  const { data } = await apiClient.post<InquiryResponse>("/inquiries", payload);
  return data.data.message;
}
