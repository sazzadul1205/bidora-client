import { useState, useRef } from "react";
import { Send, ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "../../utils/toast";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_BODY_CHARS = 2000;

export default function MessageComposer({ onSend, isSending, maxMessages = 100, currentCount = 0 }) {
  const [body, setBody] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef(null);

  const limitReached = currentCount >= maxMessages;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) { return; }
    if (!f.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (f.size > MAX_IMAGE_BYTES) {
      toast.error("Image must be 5 MB or less.");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const clearFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    if (fileRef.current) { fileRef.current.value = ""; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (limitReached) {
      toast.error(`Message limit reached (${maxMessages}).`);
      return;
    }
    const text = body.trim();
    if (!text && !file) { return; }
    if (text.length > MAX_BODY_CHARS) {
      toast.error(`Message must be ${MAX_BODY_CHARS} characters or fewer.`);
      return;
    }
    const success = await onSend(text, file);
    if (success) {
      setBody("");
      clearFile();
    }
  };

  const charsLeft = MAX_BODY_CHARS - body.length;

  return (
    <form onSubmit={handleSubmit} className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
      {preview && (
        <div className="relative inline-block mb-2">
          <img src={preview} className="h-16 rounded-md object-cover border" alt="preview" />
          <button type="button" onClick={clearFile} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={limitReached}
          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg shrink-0 disabled:opacity-50"
          title="Attach image (max 5 MB)"
        >
          <ImagePlus className="w-5 h-5" />
        </button>
        <input type="file" ref={fileRef} accept="image/*" className="hidden" onChange={handleFile} />

        <div className="flex-1">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value.slice(0, MAX_BODY_CHARS))}
            placeholder="Type your message here..."
            disabled={limitReached}
            className="w-full bg-white border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-10 min-h-10 max-h-32 disabled:bg-gray-100"
            rows={1}
          />
        </div>

        <button
          type="submit"
          disabled={isSending || limitReached || (!body.trim() && !file)}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 shrink-0"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex justify-between mt-1 text-[10px] text-gray-400 px-1">
        <span>Image max 5 MB</span>
        <span className={charsLeft < 100 ? "text-amber-600" : ""}>{body.length}/{MAX_BODY_CHARS}</span>
      </div>
    </form>
  );
}