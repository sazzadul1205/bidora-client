// Centralized API error message extraction.
// Reads the standardized backend envelope { message, errors } and falls back gracefully.

export function getErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;

  if (data) {
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }
    if (Array.isArray(data.errors)) {
      if (data.errors.length > 0) {
        return data.errors.join(", ");
      }
    } else if (data.errors && typeof data.errors === "object") {
      const messages = Object.values(data.errors).flat();
      if (messages.length > 0) {
        return messages.join(" ");
      }
    }
  }

  if (error?.message === "Network Error") {
    return "Cannot reach the server. Please check your connection.";
  }

  return fallback;
}

export default getErrorMessage;