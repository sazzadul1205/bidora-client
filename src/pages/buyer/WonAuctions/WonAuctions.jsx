import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  getWonAuctions,
  payForSale,
  confirmReceipt,
  createDisputeImage,
} from "../../../services/buyerApi";
import {
  CreditCard,
  CheckCircle,
  Trophy,
  Search,
  Package,
  AlertCircle,
  Clock,
  Scale,
  Truck,
  X,
  Link as LinkIcon,
  ImagePlus,
  ArrowRight,
  RotateCcw,
  FileText,
  ShieldAlert,
  MessageSquare,
  Gavel,
} from "lucide-react";
import { toast, confirmDialog } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";
import { imageUrl, handleImageError } from "../../../utils/image";

export default function WonAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // Modal States
  const [disputeTarget, setDisputeTarget] = useState(null);
  const [confirmingTarget, setConfirmingTarget] = useState(null);
  const [selectedDispute, setSelectedDispute] = useState(null); // NEW: Read-only view
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // Form States
  const [complaint, setComplaint] = useState("");
  const [evidenceImage, setEvidenceImage] = useState(null);
  const [evidenceImagePreview, setEvidenceImagePreview] = useState(null);
  const [receiptProof, setReceiptProof] = useState("");
  const [receiptNotes, setReceiptNotes] = useState("");

  const fetchWonAuctions = async () => {
    try {
      const res = await getWonAuctions();
      setAuctions(res.data.data || []);
    } catch {
      toast.error("Failed to load won auctions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getWonAuctions();
        if (mounted) setAuctions(res.data.data || []);
      } catch {
        toast.error("Failed to load won auctions.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePay = async (saleId) => {
    const confirmed = await confirmDialog(
      "Confirm Payment?",
      "This will deduct the winning amount from your wallet and hold it in escrow.",
      "Pay Now",
    );
    if (!confirmed) return;

    try {
      await payForSale(saleId);
      toast.success("Payment successful! Funds are now in escrow.");
      fetchWonAuctions();
    } catch (err) {
      toast.error(
        "Payment failed: " + (err.response?.data?.message || err.message),
      );
    }
  };

  const handleRaiseDispute = async (saleId) => {
    if (!complaint.trim()) return toast.error("Please describe the issue.");
    if (complaint.trim().length < 20)
      return toast.error(
        "Please provide more detail (at least 20 characters).",
      );

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("SaleId", saleId);
      formData.append("Complaint", complaint.trim());
      if (evidenceImage) formData.append("EvidenceImage", evidenceImage);
      await createDisputeImage(formData);
      toast.success("Dispute submitted. Awaiting admin review.");
      setDisputeTarget(null);
      setComplaint("");
      setEvidenceImage(null);
      setEvidenceImagePreview(null);
      fetchWonAuctions();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit dispute.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmReceipt = async () => {
    if (!receiptProof.trim())
      return toast.error("Proof of receipt is required.");

    setIsSubmitting(true);
    try {
      await confirmReceipt(confirmingTarget.saleId, {
        receiptProofUrl: receiptProof.trim(),
        receiptNotes: receiptNotes.trim() || null,
      });
      toast.success("Receipt confirmed. Funds released to seller.");
      setConfirmingTarget(null);
      setReceiptProof("");
      setReceiptNotes("");
      fetchWonAuctions();
    } catch (err) {
      const detail =
        err.response?.data?.message || "Failed to confirm receipt.";
      toast.error(detail);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // --- STATS ---
  const pendingPaymentCount = auctions.filter(
    (a) =>
      a.paymentStatus === "AwaitingPayment" ||
      a.paymentStatus === "PaymentOverdue",
  ).length;

  const totalSpent = auctions
    .filter(
      (a) => a.paymentStatus === "Paid" || a.paymentStatus === "Completed",
    )
    .reduce((sum, a) => sum + (a.winningAmount || 0), 0);

  // --- FILTERING ---
  const filteredAuctions = auctions.filter((a) => {
    if (
      searchTerm &&
      !a.productTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;

    if (filterStatus === "AwaitingPayment")
      return (
        a.paymentStatus === "AwaitingPayment" ||
        a.paymentStatus === "PaymentOverdue"
      );
    if (filterStatus === "Action Required")
      return a.paymentStatus === "Dispatched" || a.paymentStatus === "Paid";
    if (filterStatus === "Completed") return a.paymentStatus === "Completed";
    if (filterStatus === "Disputed")
      return a.paymentStatus === "Disputed" || a.paymentStatus === "Refunded";
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">Product</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
              <SkeletonRow cols={4} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" /> Won Auctions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Complete payments, confirm receipt, and manage disputes.
          </p>
        </div>
        <Link
          to="/auctions"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          Browse Auctions <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-lg shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Won</p>
            <p className="text-2xl font-bold text-gray-900">
              {auctions.length}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div
            className={`p-3 rounded-lg shrink-0 ${pendingPaymentCount > 0 ? "bg-orange-50 text-orange-600" : "bg-gray-50 text-gray-400"}`}
          >
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Awaiting Payment
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {pendingPaymentCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Spent</p>
            <p className="text-2xl font-bold text-gray-900">
              $
              {totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {[
              "All",
              "AwaitingPayment",
              "Action Required",
              "Completed",
              "Disputed",
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterStatus(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${filterStatus === tab
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {tab === "AwaitingPayment" ? "Awaiting Payment" : tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search won items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-200">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium w-[35%]">Product</th>
                <th className="px-6 py-4 font-medium">Winning Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAuctions.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-16">
                    <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      No auctions found.
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      {searchTerm || filterStatus !== "All"
                        ? "Try adjusting your search or filters."
                        : "You haven't won any auctions yet."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAuctions.map((a) => (
                  <tr
                    key={a.auctionId}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    {/* Product Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                          {a.mainImageUrl ? (
                            <img
                              src={imageUrl(a.mainImageUrl)}
                              alt={a.productTitle}
                              onError={handleImageError}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 line-clamp-1 text-base">
                            {a.productTitle}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Auction #{a.auctionId}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900 text-lg">
                        $
                        {a.winningAmount?.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="px-6 py-4">
                      {a.paymentStatus === "AwaitingPayment" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          <Clock className="w-3.5 h-3.5" /> Awaiting Payment
                        </span>
                      )}
                      {a.paymentStatus === "PaymentOverdue" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle className="w-3.5 h-3.5" /> Payment Overdue
                        </span>
                      )}
                      {a.paymentStatus === "Paid" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <CreditCard className="w-3.5 h-3.5" /> Paid (In Escrow)
                        </span>
                      )}
                      {a.paymentStatus === "Dispatched" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <Truck className="w-3.5 h-3.5" /> Dispatched
                        </span>
                      )}
                      {a.paymentStatus === "Completed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Completed
                        </span>
                      )}
                      {a.paymentStatus === "Disputed" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <Scale className="w-3.5 h-3.5" /> Under Dispute
                        </span>
                      )}
                      {a.paymentStatus === "Refunded" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-300">
                          <RotateCcw className="w-3.5 h-3.5" /> Refunded
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">

                        {/* Primary Action */}
                        {(a.paymentStatus === "AwaitingPayment" ||
                          a.paymentStatus === "PaymentOverdue") && (
                            <button
                              onClick={() => handlePay(a.saleId)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center"
                            >
                              <CreditCard className="w-4 h-4" /> Pay Now
                            </button>
                          )}

                        {(a.paymentStatus === "Dispatched" ||
                          a.paymentStatus === "Paid") && (
                            <button
                              onClick={() => {
                                setConfirmingTarget(a);
                                setReceiptProof("");
                                setReceiptNotes("");
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center"
                            >
                              <CheckCircle className="w-4 h-4" /> Confirm Receipt
                            </button>
                          )}

                        {(a.paymentStatus === "Completed") && (
                          <span className="text-xs font-medium text-gray-400 flex items-center gap-1 justify-end">
                            <CheckCircle className="w-4 h-4 text-green-500" />{" "}
                            All done
                          </span>
                        )}

                        {/* View Dispute Action */}
                        {(a.paymentStatus === "Disputed" || a.paymentStatus === "Refunded") && a.dispute && (
                          <button
                            onClick={() => setSelectedDispute(a.dispute)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-lg transition-colors shadow-sm w-full justify-center"
                          >
                            <FileText className="w-4 h-4" /> View Dispute
                          </button>
                        )}

                        {/* Secondary Action (Dispute) */}
                        {(a.paymentStatus === "Paid" ||
                          a.paymentStatus === "Dispatched") && (
                            <button
                              onClick={() => {
                                setDisputeTarget(a);
                                setComplaint("");
                                setEvidenceImage(null);
                                setEvidenceImagePreview(null);
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 transition-colors mt-1"
                            >
                              <Scale className="w-3.5 h-3.5" /> Raise Dispute
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      {/* NEW: READ-ONLY DISPUTE DETAILS MODAL */}
      
      {selectedDispute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">

            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-gray-700" /> Dispute #{selectedDispute.id}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Opened on {formatDate(selectedDispute.createdAt)}
                </p>
              </div>
              <button
                onClick={() => setSelectedDispute(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">

              {/* Status Banner */}
              {selectedDispute.status === "UnderReview" || selectedDispute.status === "Open" ? (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold">Pending Admin Review</h3>
                    <p className="text-sm mt-1">An administrator is currently reviewing this dispute. You will be notified once a decision is made.</p>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
                  <Gavel className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold">Dispute Resolved</h3>
                    <p className="text-sm mt-1">The admin has reviewed this case and made a final decision.</p>
                  </div>
                </div>
              )}

              {/* Buyer's Complaint */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-gray-500" /> Your Complaint
                </h3>
                <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedDispute.complaint}
                </div>
              </div>

              {/* Evidence */}
              {selectedDispute.evidenceUrl && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <FileText className="w-4 h-4 text-gray-500" /> Submitted Evidence
                  </h3>
                  <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 inline-block">
                    <img
                      src={imageUrl(selectedDispute.evidenceUrl)}
                      alt="Dispute Evidence"
                      onError={handleImageError}
                      className="max-h-64 rounded-lg object-contain cursor-zoom-in hover:opacity-90 transition"
                      onClick={() => window.open(imageUrl(selectedDispute.evidenceUrl), "_blank")}
                    />
                    <p className="text-center text-xs text-gray-500 mt-2">Click to open full image</p>
                  </div>
                </div>
              )}

              {/* Admin Decision (If Resolved) */}
              {selectedDispute.status === "Resolved" && selectedDispute.adminDecision && (
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-red-600" /> Admin Decision
                  </h3>
                  <div className="bg-white border-2 border-red-200 p-4 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-900 leading-relaxed font-medium">
                      "{selectedDispute.adminDecision}"
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-between items-center sticky bottom-0 z-10 rounded-b-2xl">

              {/* Future-Proofing for Appeals */}
              <div>
                {selectedDispute.status === "Resolved" && (
                  <button
                    disabled
                    className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded border border-gray-200 cursor-not-allowed flex items-center gap-1.5"
                    title="Coming soon"
                  >
                    <Scale className="w-3 h-3" /> Challenge Decision
                  </button>
                )}
              </div>

              <button
                onClick={() => setSelectedDispute(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      
      {/* RAISE DISPUTE MODAL (Keep existing) */}
      
      {disputeTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setDisputeTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Scale className="w-5 h-5 text-red-600" /> Raise Dispute
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
                  {disputeTarget.productTitle}
                </p>
              </div>
              <button
                onClick={() => setDisputeTarget(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 text-red-800 p-3 rounded-lg border border-red-100 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Disputes are reviewed by an admin. Provide clear evidence.
                  False claims may result in penalties.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Describe the issue <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={complaint}
                  onChange={(e) => setComplaint(e.target.value)}
                  rows={4}
                  placeholder="e.g. The item arrived damaged, or the seller never dispatched it..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Photo (optional)
                </label>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (!file) return;
                    setEvidenceImage(file);
                    setEvidenceImagePreview(URL.createObjectURL(file));
                  }}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-red-400 hover:bg-red-50/30 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                  <p className="text-xs text-gray-500">
                    Drop a photo here or click to browse
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setEvidenceImage(file);
                      setEvidenceImagePreview(URL.createObjectURL(file));
                    }}
                  />
                </div>
                {evidenceImagePreview && (
                  <div className="relative mt-3">
                    <img
                      src={evidenceImagePreview}
                      alt="preview"
                      className="w-24 h-24 rounded-lg object-cover border border-gray-200 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEvidenceImage(null);
                        setEvidenceImagePreview(null);
                      }}
                      className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setDisputeTarget(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRaiseDispute(disputeTarget.saleId)}
                  disabled={isSubmitting || complaint.trim().length < 20}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  Submit Dispute
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
      {/* CONFIRM RECEIPT MODAL (Keep existing) */}
      
      {confirmingTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm"
          onClick={() => setConfirmingTarget(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-green-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" /> Confirm
                  Receipt
                </h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">
                  {confirmingTarget.productTitle}
                </p>
              </div>
              <button
                onClick={() => setConfirmingTarget(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-green-50 text-green-800 p-3 rounded-lg border border-green-100 text-sm flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>
                  Confirming receipt releases the escrow funds to the seller.
                  You must provide proof of delivery.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Proof of Receipt URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="url"
                    value={receiptProof}
                    onChange={(e) => setReceiptProof(e.target.value)}
                    placeholder="https://example.com/proof"
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (optional)
                </label>
                <textarea
                  value={receiptNotes}
                  onChange={(e) => setReceiptNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Item received in good condition..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => setConfirmingTarget(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReceipt}
                  disabled={isSubmitting || !receiptProof.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
                >
                  Confirm & Release Funds
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}