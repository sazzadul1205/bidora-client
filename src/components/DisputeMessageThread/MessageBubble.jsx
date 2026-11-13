import { imageUrl, handleImageError } from "../../utils/image";
import { formatDateTime } from "../../utils/date";
import { ShieldAlert, User, Store } from "lucide-react";

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const payload = JSON.parse(atob(padded));
    return (
      payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
      payload.nameid ||
      payload.sub ||
      null
    );
  } catch {
    return null;
  }
}

export default function MessageBubble({ msg }) {
  const isSystem = msg.senderRole === "System";
  const isAdmin = msg.senderRole === "Admin" || msg.senderRole === "Super Admin";
  const myId = getCurrentUserId();
  const isMine = myId && msg.senderId && String(msg.senderId).toLowerCase() === String(myId).toLowerCase();

  if (isSystem) {
    return (
      <div className="flex justify-center my-3">
        <span className="text-[11px] font-medium text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-full border border-neutral-200">
          {msg.body}
        </span>
      </div>
    );
  }

  const roleLabel = msg.senderRole || "User";
  const Icon = isAdmin ? ShieldAlert : msg.senderRole === "Seller" ? Store : User;

  const bubbleTone = isAdmin
    ? "bg-purple-50 border-purple-300"
    : isMine
      ? "bg-blue-600 border-blue-600 text-white"
      : "bg-white border-gray-200";

  const metaTone = isAdmin
    ? "text-purple-700"
    : isMine
      ? "text-blue-100"
      : "text-gray-500";

  return (
    <div className={`flex mb-3 ${isMine ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] border rounded-2xl p-3 shadow-sm ${bubbleTone} ${isMine ? "rounded-br-md" : "rounded-bl-md"}`}>
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <div className="flex items-center gap-2 min-w-0">
            <div className={`p-1 rounded-md shrink-0 ${isAdmin ? "bg-purple-200 text-purple-800" : isMine ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            <span className={`text-xs font-bold uppercase tracking-wide truncate ${isMine && !isAdmin ? "text-white" : "text-gray-900"}`}>
              {roleLabel}
            </span>
            {isAdmin && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-purple-200 text-purple-800 border border-purple-300">Admin</span>
            )}
          </div>
          <span className={`text-[10px] whitespace-nowrap ${metaTone}`}>{formatDateTime(msg.createdAt)}</span>
        </div>

        {msg.body && (
          <p className={`text-sm whitespace-pre-wrap break-words ${isMine && !isAdmin ? "text-white" : "text-gray-800"}`}>{msg.body}</p>
        )}

        {msg.attachmentUrl && (
          <div className="mt-2">
            <img
              src={imageUrl(msg.attachmentUrl)}
              alt="Attachment"
              onError={handleImageError}
              className="max-h-40 rounded-lg object-contain border border-black/10 cursor-pointer hover:opacity-90"
              onClick={() => window.open(imageUrl(msg.attachmentUrl), "_blank")}
            />
          </div>
        )}
      </div>
    </div>
  );
}