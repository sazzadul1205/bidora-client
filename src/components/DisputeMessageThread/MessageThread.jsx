import { useEffect, useRef } from "react";
import { MessageSquare } from "lucide-react";
import useDisputeMessages from "../../hooks/useDisputeMessages";
import MessageBubble from "./MessageBubble";
import MessageComposer from "./MessageComposer";
import { Skeleton } from "../Skeleton";

const MAX_MESSAGES = 100;

function MessageSkeleton() {
  return (
    <div className="space-y-3 p-2">
      <div className="flex justify-start">
        <div className="w-[70%] space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-end">
        <div className="w-[65%] space-y-2">
          <Skeleton className="h-3 w-16 ml-auto rounded" />
          <Skeleton className="h-14 w-full rounded-2xl" />
        </div>
      </div>
      <div className="flex justify-start">
        <div className="w-[60%] space-y-2">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-12 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function MessageThread({ disputeId, canSend, status }) {
  const { messages, loading, isSending, sendMessage } = useDisputeMessages(disputeId, canSend);
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages.length]);

  const count = messages.length;
  const limitReached = count >= MAX_MESSAGES;

  return (
    <div className="flex flex-col h-full mt-4 border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          Conversation
          {!loading && (
            <span className={`inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 rounded-full text-[11px] font-bold ${limitReached ? "bg-red-600 text-white" : "bg-blue-600 text-white"}`}>
              {count}
            </span>
          )}
        </h3>
        {!loading && (
          <span className={`text-[11px] ${limitReached ? "text-red-600 font-semibold" : "text-gray-500"}`}>
            {count}/{MAX_MESSAGES} messages
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto max-h-80 pr-2 bg-gray-50/50 rounded-lg border border-gray-100 p-2">
        {loading ? (
          <MessageSkeleton />
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
            {messages.length === 0 && (
              <p className="text-xs text-gray-400 text-center italic py-6">No messages yet.</p>
            )}
            <div ref={endRef} />
          </>
        )}
      </div>

      {canSend ? (
        limitReached ? (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-center border border-amber-200">
            <p className="text-xs font-medium text-amber-700">Message limit reached ({MAX_MESSAGES}). No new messages can be sent.</p>
          </div>
        ) : (
          <MessageComposer onSend={sendMessage} isSending={isSending} maxMessages={MAX_MESSAGES} currentCount={count} />
        )
      ) : (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center border border-gray-200">
          <p className="text-xs font-medium text-gray-500">
            {status === "Open"
              ? "Messaging unlocks once an Admin starts review."
              : "This dispute is closed. Messages are read-only."}
          </p>
        </div>
      )}
    </div>
  );
}