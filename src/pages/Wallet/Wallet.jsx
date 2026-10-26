import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpRight,
  Lock,
  UploadCloud,
  X,
  Loader2,
  History,
} from "lucide-react";
import { toast } from "../../utils/toast";
import { Skeleton } from "../../components/Skeleton";

// Import from your EXISTING buyerApi (or sellerApi — they are identical for wallet)
import {
  getMyWallet,
  requestDeposit,
  getWalletTransactions,
  getWalletReservations,
} from "../../services/buyerApi";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

// Receipt Dropzone
function ReceiptDropzone({ file, onFileChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const objectUrlRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const acceptFile = (selectedFile) => {
    if (!selectedFile) return;
    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error("Choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (selectedFile.size > MAX_IMAGE_SIZE) {
      toast.error("Receipt must be 5 MB or smaller.");
      return;
    }
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

    const objectUrl = URL.createObjectURL(selectedFile);
    objectUrlRef.current = objectUrl;
    setPreviewUrl(objectUrl);
    onFileChange(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    acceptFile(e.dataTransfer.files?.[0]);
  };

  const clearFile = (e) => {
    e.stopPropagation();
    onFileChange(null);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setPreviewUrl("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Receipt Image <span className="text-red-500">*</span>
      </label>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragActive(false);
        }}
        onDrop={handleDrop}
        className={`relative flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            acceptFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        {previewUrl ? (
          <div className="w-full">
            <img
              src={previewUrl}
              alt="Receipt"
              className="mx-auto max-h-32 rounded-lg object-contain"
            />
            <p className="mt-2 text-xs text-gray-600">{file.name}</p>
            <button
              type="button"
              onClick={clearFile}
              className="mt-2 inline-flex items-center gap-1 text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="mb-2 h-8 w-8 text-gray-400" />
            <p className="text-sm font-medium text-gray-700">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPG, PNG, WEBP · Max 5 MB
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function Wallet() {
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const fetchWalletData = async () => {
    try {
      const [walletRes, txRes, resRes] = await Promise.all([
        getMyWallet(),
        getWalletTransactions(),
        getWalletReservations(),
      ]);
      setWallet(walletRes.data.data);
      setTransactions(txRes.data.data || []);
      setReservations(resRes.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
    }
  };

  // Initial load only. The async body is inlined inside the effect so the
  // React compiler can statically see every setState() call happens after an
  // await — never synchronously — avoiding cascading renders.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [walletRes, txRes, resRes] = await Promise.all([
          getMyWallet(),
          getWalletTransactions(),
          getWalletReservations(),
        ]);
        if (!mounted) return;
        setWallet(walletRes.data.data);
        setTransactions(txRes.data.data || []);
        setReservations(resRes.data.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load wallet data.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const onSubmitDeposit = async (data) => {
    if (!receiptFile) {
      toast.error("Please upload a receipt image.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Method", data.method);
      formData.append("Amount", parseFloat(data.amount));
      formData.append("TransactionReference", data.transactionReference);
      formData.append("ReceiptImage", receiptFile);

      await requestDeposit(formData);
      toast.success("Deposit request submitted for review!");
      setShowDepositModal(false);
      reset();
      setReceiptFile(null);
      fetchWalletData();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to submit deposit request.",
      );
    }
  };

  const formatMoney = (num) =>
    `$${Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getTxColor = (type) => {
    if (type === "Credit" || type === "Release")
      return "text-green-600 bg-green-50";
    if (type === "Debit" || type === "Penalty") return "text-red-600 bg-red-50";
    if (type === "Commission") return "text-purple-600 bg-purple-50";
    return "text-gray-600 bg-gray-50";
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  const availableBalance =
    (wallet?.balance || 0) - (wallet?.reservedBalance || 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Wallet</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your funds, deposits, and history.
          </p>
        </div>
        <button
          onClick={() => setShowDepositModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
        >
          <ArrowDownToLine className="w-4 h-4" /> Deposit Funds
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-linear-to-br from-blue-600 to-blue-700 rounded-xl p-6 text-white shadow-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-blue-100">Available Balance</span>
            <WalletIcon className="w-5 h-5 text-blue-200" />
          </div>
          <p className="text-3xl font-bold">{formatMoney(availableBalance)}</p>
          <p className="text-xs text-blue-200 mt-1">Ready to spend</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Reserved Funds</span>
            <Lock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatMoney(wallet?.reservedBalance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Locked in active bids</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-gray-500">Total Balance</span>
            <ArrowUpRight className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {formatMoney(wallet?.balance)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Available + Reserved</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition ${
                activeTab === "overview"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <WalletIcon className="w-4 h-4" /> Overview
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition ${
                activeTab === "transactions"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <History className="w-4 h-4" /> Transactions (
              {transactions.length})
            </button>
            <button
              onClick={() => setActiveTab("reservations")}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition ${
                activeTab === "reservations"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              <Lock className="w-4 h-4" /> Reservations ({reservations.length})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="text-center py-12">
              <WalletIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">
                Welcome to your wallet
              </h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
                Deposit funds to start bidding on auctions. Your money is safe
                and you can request a deposit at any time.
              </p>
              <button
                onClick={() => setShowDepositModal(true)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg"
              >
                <ArrowDownToLine className="w-4 h-4" /> Make First Deposit
              </button>
            </div>
          )}

          {activeTab === "transactions" && (
            <div>
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No transactions yet.</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg ${getTxColor(tx.type)}`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {tx.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {tx.reference || "—"}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {formatDate(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-sm font-bold ${tx.type === "Debit" || tx.type === "Penalty" ? "text-red-600" : "text-green-600"}`}
                        >
                          {tx.type === "Debit" || tx.type === "Penalty"
                            ? "-"
                            : "+"}
                          {formatMoney(tx.amount)}
                        </p>
                        <p className="text-xs text-gray-400">
                          Bal: {formatMoney(tx.balanceAfter)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === "reservations" && (
            <div>
              {reservations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Lock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="font-medium">No active reservations.</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Funds are locked when you bid or list a product.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {reservations.map((r) => (
                    <li
                      key={r.id}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-50 text-orange-600">
                          <Lock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">
                            {r.type}
                          </p>
                          <p className="text-xs text-gray-500">
                            {r.productTitle || `Reservation #${r.id}`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-600">
                          {formatMoney(r.amount)}
                        </p>
                        <span
                          className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                            r.status === "Reserved"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {r.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Deposit Funds
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Funds will be added after admin approval.
                </p>
              </div>
              <button
                onClick={() => setShowDepositModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmitDeposit)}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Payment Method <span className="text-red-500">*</span>
                </label>
                <select
                  {...register("method", { required: "Method is required" })}
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select method...</option>
                  <option value="BankTransfer">Bank Transfer</option>
                  <option value="bKash">bKash</option>
                </select>
                {errors.method && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.method.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Amount (USD) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  {...register("amount", {
                    required: "Amount is required",
                    min: { value: 1, message: "Minimum $1" },
                  })}
                  placeholder="100.00"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.amount && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Transaction Reference <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("transactionReference", {
                    required: "Reference is required",
                  })}
                  placeholder="e.g. TXN-9845-ABCD"
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
                {errors.transactionReference && (
                  <p className="text-xs text-red-600 mt-1">
                    {errors.transactionReference.message}
                  </p>
                )}
              </div>

              <ReceiptDropzone
                file={receiptFile}
                onFileChange={setReceiptFile}
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDepositModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
