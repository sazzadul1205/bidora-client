// Centralized API error message.
export function getErrorMessage(error, fallback = "Something went wrong.") {
  const data = error?.response?.data;

  if (data) {
    if (typeof data.message === "string" && data.message.trim()) {
      let msg = data.message;
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        msg += ": " + data.errors.join(", ");
      } else if (data.errors && typeof data.errors === "object") {
        const messages = Object.values(data.errors).flat();
        if (messages.length > 0) {
          msg += ": " + messages.join(" ");
        }
      }
      return msg;
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