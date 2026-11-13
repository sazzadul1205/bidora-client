import { useState, useEffect } from "react";
import authApi, { getAuthConfig } from "../services/authApi";
import { toast } from "../utils/toast";

export default function useDisputeMessages(disputeId, canSend) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!disputeId) {
      return;
    }

    let isMounted = true;

    //  Define the fetcher INSIDE the effect
    const loadMessages = async () => {
      try {
        const res = await authApi.get(
          `/dispute/${disputeId}/messages`,
          getAuthConfig(),
        );
        if (isMounted) {
          setMessages(res.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load messages", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMessages(); // Initial fetch

    if (!canSend) {
      return;
    }

    const interval = setInterval(() => {
      if (!document.hidden) {
        loadMessages();
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [disputeId, canSend]);

  const sendMessage = async (body, file) => {
    if (!body.trim() && !file) {
      return false;
    }
    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("Body", body.trim());
      if (file) {
        formData.append("Attachment", file);
      }

      await authApi.post(`/dispute/${disputeId}/messages`, formData, {
        headers: {
          ...getAuthConfig().headers,
          "Content-Type": "multipart/form-data",
        },
      });

      // Manually trigger a refetch by making a one-off request
      const res = await authApi.get(
        `/dispute/${disputeId}/messages`,
        getAuthConfig(),
      );
      setMessages(res.data.data || []);

      return true;
    } catch (err) {
      toast.errorFrom(err, "Failed to send message.");
      return false;
    } finally {
      setIsSending(false);
    }
  };

  return { messages, loading, isSending, sendMessage };
}
