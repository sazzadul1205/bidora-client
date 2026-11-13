import PageTitle from "../../components/PageTitle";
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { formatCurrency as formatMoney } from "../../utils/currency";
import { formatDateTime } from "../../utils/date";
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
  Scale,
} from "lucide-react";
import { toast } from "../../utils/toast";
import { Skeleton } from "../../components/Skeleton";
import Pagination from "../../components/Pagination/Pagination";
import RefreshButton from "../../components/RefreshButton";

import {
  getMyWallet,
  requestDeposit,
  getWalletTransactions,
  getWalletReservations,
  getMyDepositRequests,
} from "../../services/buyerApi";

import OverviewTab from "./OverviewTab/OverviewTab";
import TransactionsTab from "./TransactionsTab/TransactionsTab";
import ReservationsTab from "./ReservationsTab/ReservationsTab";
import DepositRequestsTab from "./DepositRequestsTab/DepositRequestsTab";
import DisputesTab from "./DisputesTab/DisputesTab";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function ReceiptDropzone({ file, onFileChange }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const objectUrlRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const acceptFile = (selectedFile) => {
    if (!selectedFile) {
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(selectedFile.type)) {
      toast.error("Choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (selectedFile.size > MAX_IMAGE_SIZE) {
      toast.error("Receipt must be 5 MB or smaller.");
      return;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

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
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-text-main mb-2">
        Receipt Image <span className="text-danger-500">*</span>
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
            ? "border-primary-500 bg-primary-50"
            : "border-border-main bg-neutral-50 hover:border-primary-400 hover:bg-primary-50/50"
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
            <p className="mt-2 text-xs text-text-muted">{file.name}</p>
            <button
              type="button"
              onClick={clearFile}
              className="mt-2 inline-flex items-center gap-1 text-sm text-danger-600 hover:bg-danger-50 px-2 py-1 rounded"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
          </div>
        ) : (
          <>
            <UploadCloud className="mb-2 h-8 w-8 text-neutral-400" />
            <p className="text-sm font-medium text-text-main">
              Drag & drop or click to upload
            </p>
            <p className="text-xs text-text-muted mt-1">
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
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);

  const [transactions, setTransactions] = useState([]);
  const [txPage, setTxPage] = useState(1);
  const [txPageSize, setTxPageSize] = useState(20);
  const [txTotal, setTxTotal] = useState(0);
  const [txTypeFilter, setTxTypeFilter] = useState("All");
  const [txSearchTerm, setTxSearchTerm] = useState("");
  const [txDebouncedSearch, setTxDebouncedSearch] = useState("");

  const [reservations, setReservations] = useState([]);
  const [resPage, setResPage] = useState(1);
  const [resPageSize, setResPageSize] = useState(20);
  const [resTotal, setResTotal] = useState(0);
  const [resStatusFilter, setResStatusFilter] = useState("All");
  const [resSearchTerm, setResSearchTerm] = useState("");
  const [resDebouncedSearch, setResDebouncedSearch] = useState("");

  const [depositRequests, setDepositRequests] = useState([]);
  const [depPage, setDepPage] = useState(1);
  const [depPageSize, setDepPageSize] = useState(20);
  const [depTotal, setDepTotal] = useState(0);
  const [depStatusFilter, setDepStatusFilter] = useState("All");
  const [depSearchTerm, setDepSearchTerm] = useState("");
  const [depDebouncedSearch, setDepDebouncedSearch] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  // Debounce search inputs
  useEffect(() => {
    const t = setTimeout(() => setTxDebouncedSearch(txSearchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [txSearchTerm]);

  useEffect(() => {
    const t = setTimeout(
      () => setResDebouncedSearch(resSearchTerm.trim()),
      300,
    );
    return () => clearTimeout(t);
  }, [resSearchTerm]);

  useEffect(() => {
    const t = setTimeout(
      () => setDepDebouncedSearch(depSearchTerm.trim()),
      300,
    );
    return () => clearTimeout(t);
  }, [depSearchTerm]);

  // Fetch all data whenever any tab's query state changes
  const fetchWalletData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const [w, t, r, d] = await Promise.all([
        getMyWallet(),
        getWalletTransactions({
          page: txPage,
          pageSize: txPageSize,
          search: txDebouncedSearch || undefined,
          filter: txTypeFilter !== "All" ? txTypeFilter : undefined,
        }),
        getWalletReservations({
          page: resPage,
          pageSize: resPageSize,
          search: resDebouncedSearch || undefined,
          filter: resStatusFilter !== "All" ? resStatusFilter : undefined,
        }),
        getMyDepositRequests({
          page: depPage,
          pageSize: depPageSize,
          search: depDebouncedSearch || undefined,
          filter: depStatusFilter !== "All" ? depStatusFilter : undefined,
        }),
      ]);
      setWallet(w.data.data);
      setTransactions(t.data.data || []);
      setTxTotal(t.data.pagination?.totalCount || 0);
      setReservations(r.data.data || []);
      setResTotal(r.data.pagination?.totalCount || 0);
      setDepositRequests(d.data.data || []);
      setDepTotal(d.data.pagination?.totalCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load wallet data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [
    txPage, txPageSize, txDebouncedSearch, txTypeFilter,
    resPage, resPageSize, resDebouncedSearch, resStatusFilter,
    depPage, depPageSize, depDebouncedSearch, depStatusFilter,
  ]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const refreshDepositRequests = async () => {
    try {
      const d = await getMyDepositRequests({
        page: 1,
        pageSize: depPageSize,
        search: depDebouncedSearch || undefined,
        filter: depStatusFilter !== "All" ? depStatusFilter : undefined,
      });
      setDepositRequests(d.data.data || []);
      setDepTotal(d.data.pagination?.totalCount || 0);
    } catch (err) {
      console.error(err);
      toast.error("Failed to refresh deposit requests.");
    }
  };

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

      if (activeTab === "deposit-requests" && depPage === 1) {
        await refreshDepositRequests();
      } else {
        setDepPage(1);
      }
    } catch (err) {
      toast.errorFrom(err, "Failed to submit deposit request.");
    }
  };

  const formatDate = formatDateTime;

  // Memoized: only changes when `type` changes
  const getTxColor = useCallback((type) => {
    if (type === "Credit" || type === "Release") {
      return "text-success-600 bg-success-50";
    }
    if (type === "Debit" || type === "Penalty") {
      return "text-danger-600 bg-danger-50";
    }
    if (type === "Commission") {
      return "text-accent-600 bg-accent-50";
    }
    return "text-text-muted bg-neutral-50";
  }, []);

  // Memoized: only recomputes when `transactions` changes
  const disputeTransactions = useMemo(
    () =>
      transactions.filter((tx) =>
        tx.reference?.toLowerCase().includes("dispute"),
      ),
    [transactions],
  );

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

  const safeReservedBalance = Math.max(0, wallet?.reservedBalance || 0);
  const availableBalance = Math.max(
    0,
    (wallet?.balance || 0) - safeReservedBalance,
  );

  return (
    <>
      <PageTitle title="Wallet" />
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main">
              My Wallet
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Manage your funds, deposits, and history.
            </p>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <RefreshButton onClick={() => fetchWalletData(true)} loading={refreshing} />
            <button
              onClick={() => setShowDepositModal(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-text-inverse text-sm font-semibold rounded-lg transition-colors flex-1 sm:flex-none"
            >
              <ArrowDownToLine className="w-4 h-4" /> Deposit Funds
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-linear-to-br from-primary-600 to-primary-700 rounded-xl p-6 text-text-inverse shadow-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-primary-100">
                Available Balance
              </span>
              <WalletIcon className="w-5 h-5 text-primary-200" />
            </div>
            <p className="text-3xl font-bold">
              {formatMoney(availableBalance)}
            </p>
            <p className="text-xs text-primary-200 mt-1">Ready to spend</p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border-main shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted">Reserved Funds</span>
              <Lock className="w-5 h-5 text-warning-500" />
            </div>
            <p className="text-3xl font-bold text-text-main">
              {formatMoney(safeReservedBalance)}
            </p>
            <p className="text-xs text-text-muted mt-1">
              Locked in active bids
            </p>
          </div>

          <div className="bg-surface rounded-xl p-6 border border-border-main shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-text-muted">Total Balance</span>
              <ArrowUpRight className="w-5 h-5 text-success-500" />
            </div>
            <p className="text-3xl font-bold text-text-main">
              {formatMoney(wallet?.balance)}
            </p>
            <p className="text-xs text-text-muted mt-1">Available + Reserved</p>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="border-b border-border-main">
            <nav className="flex overflow-x-auto">
              {[
                { id: "overview", label: "Overview", icon: WalletIcon },
                {
                  id: "transactions",
                  label: `Transactions (${txTotal})`,
                  icon: History,
                },
                {
                  id: "reservations",
                  label: `Reservations (${resTotal})`,
                  icon: Lock,
                },
                {
                  id: "deposit-requests",
                  label: `Deposit Requests (${depTotal})`,
                  icon: ArrowDownToLine,
                },
                {
                  id: "disputes",
                  label: `Disputes (${disputeTransactions.length})`,
                  icon: Scale,
                },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 px-6 py-3.5 text-sm font-medium border-b-2 transition whitespace-nowrap ${
                    activeTab === id
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-text-muted hover:text-text-main"
                  }`}
                >
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 min-h-80">
            {activeTab === "overview" && (
              <OverviewTab
                depositRequests={depositRequests}
                transactions={transactions}
                reservations={reservations}
                onRequestDeposit={() => setShowDepositModal(true)}
                onViewAllDeposits={() => setActiveTab("deposit-requests")}
                onViewAllTransactions={() => setActiveTab("transactions")}
                onViewAllReservations={() => setActiveTab("reservations")}
                formatMoney={formatMoney}
                getTxColor={getTxColor}
              />
            )}

            {activeTab === "transactions" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <select
                    value={txTypeFilter}
                    onChange={(e) => {
                      setTxTypeFilter(e.target.value);
                      setTxPage(1);
                    }}
                    className="px-3 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="All">All Types</option>
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
                    <option value="Release">Release</option>
                    <option value="Penalty">Penalty</option>
                    <option value="Commission">Commission</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search all transactions..."
                    value={txSearchTerm}
                    onChange={(e) => {
                      setTxSearchTerm(e.target.value);
                      setTxPage(1);
                    }}
                    className="flex-1 px-3 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <TransactionsTab
                  transactions={transactions}
                  formatMoney={formatMoney}
                  formatDate={formatDate}
                  getTxColor={getTxColor}
                />
                <Pagination
                  page={txPage}
                  pageSize={txPageSize}
                  totalCount={txTotal}
                  onPageChange={setTxPage}
                  onPageSizeChange={(s) => {
                    setTxPageSize(s);
                    setTxPage(1);
                  }}
                  className="border-t border-border-main mt-4 rounded-b-xl"
                />
              </>
            )}

            {activeTab === "reservations" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <select
                    value={resStatusFilter}
                    onChange={(e) => {
                      setResStatusFilter(e.target.value);
                      setResPage(1);
                    }}
                    className="px-3 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Released">Released</option>
                    <option value="Forfeited">Forfeited</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search all reservations..."
                    value={resSearchTerm}
                    onChange={(e) => {
                      setResSearchTerm(e.target.value);
                      setResPage(1);
                    }}
                    className="flex-1 px-3 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <ReservationsTab
                  reservations={reservations}
                  formatMoney={formatMoney}
                />
                <Pagination
                  page={resPage}
                  pageSize={resPageSize}
                  totalCount={resTotal}
                  onPageChange={setResPage}
                  onPageSizeChange={(s) => {
                    setResPageSize(s);
                    setResPage(1);
                  }}
                  className="border-t border-border-main mt-4 rounded-b-xl"
                />
              </>
            )}

            {activeTab === "deposit-requests" && (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
                  <select
                    value={depStatusFilter}
                    onChange={(e) => {
                      setDepStatusFilter(e.target.value);
                      setDepPage(1);
                    }}
                    className="px-3 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="All">All Statuses</option>
                    <option value="PendingVerification">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search all deposit requests..."
                    value={depSearchTerm}
                    onChange={(e) => {
                      setDepSearchTerm(e.target.value);
                      setDepPage(1);
                    }}
                    className="flex-1 px-3 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                </div>
                <DepositRequestsTab
                  depositRequests={depositRequests}
                  onRequestDeposit={() => setShowDepositModal(true)}
                  formatMoney={formatMoney}
                  formatDate={formatDate}
                />
                <Pagination
                  page={depPage}
                  pageSize={depPageSize}
                  totalCount={depTotal}
                  onPageChange={setDepPage}
                  onPageSizeChange={(s) => {
                    setDepPageSize(s);
                    setDepPage(1);
                  }}
                  className="border-t border-border-main mt-4 rounded-b-xl"
                />
              </>
            )}

            {activeTab === "disputes" && (
              <DisputesTab
                disputeTransactions={disputeTransactions}
                formatMoney={formatMoney}
                formatDate={formatDate}
                getTxColor={getTxColor}
              />
            )}
          </div>
        </div>

        {showDepositModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-surface rounded-2xl w-full max-w-md shadow-2xl">
              <div className="border-b border-border-main px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-text-main">
                    Deposit Funds
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Funds will be added after admin approval.
                  </p>
                </div>
                <button
                  onClick={() => setShowDepositModal(false)}
                  className="p-2 text-neutral-400 hover:text-text-main hover:bg-neutral-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleSubmit(onSubmitDeposit)}
                className="p-6 space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">
                    Payment Method <span className="text-danger-500">*</span>
                  </label>
                  <select
                    {...register("method", { required: "Method is required" })}
                    className="w-full border border-border-main rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  >
                    <option value="">Select method...</option>
                    <option value="BankTransfer">Bank Transfer</option>
                    <option value="bKash">bKash</option>
                  </select>
                  {errors.method && (
                    <p className="text-xs text-danger-600 mt-1">
                      {errors.method.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">
                    Amount (BDT) <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    {...register("amount", {
                      required: "Amount is required",
                      min: { value: 1, message: "Minimum ৳1" },
                    })}
                    placeholder="100.00"
                    className="w-full border border-border-main rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {errors.amount && (
                    <p className="text-xs text-danger-600 mt-1">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-main mb-1.5">
                    Transaction Reference{" "}
                    <span className="text-danger-500">*</span>
                  </label>
                  <input
                    type="text"
                    {...register("transactionReference", {
                      required: "Reference is required",
                    })}
                    placeholder="e.g. TXN-9845-ABCD"
                    className="w-full border border-border-main rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
                  {errors.transactionReference && (
                    <p className="text-xs text-danger-600 mt-1">
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
                    className="px-4 py-2 text-sm font-medium text-text-main hover:bg-neutral-100 rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 px-5 py-2 bg-primary-600 hover:bg-primary-700 text-text-inverse text-sm font-semibold rounded-lg disabled:opacity-50"
                  >
                    {isSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {isSubmitting ? "Submitting..." : "Submit Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
