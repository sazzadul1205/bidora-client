import { useEffect, useState } from "react";
import { getWonAuctions, payForSale, confirmReceipt } from "../../../services/buyerApi";
import { Loader2, CreditCard, CheckCircle, Trophy } from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function WonAuctions() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWonAuctions = async () => {
    try {
      const res = await getWonAuctions();
      setAuctions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      try {
        const res = await getWonAuctions();
        if (mounted) setAuctions(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  const handlePay = async (saleId) => {
    if (!window.confirm("Confirm payment from your wallet?")) return;
    try {
      await payForSale(saleId);
      toast.success("Payment successful!");
      fetchWonAuctions();
    } catch (err) {
      toast.error("Payment failed: " + (err.response?.data?.message || err.message));
    }
  };

  const handleConfirmReceipt = async (saleId) => {
    if (!window.confirm("Confirm you have received the item?")) return;
    try {
      await confirmReceipt(saleId);
      toast.success("Receipt confirmed. Funds released to seller.");
      fetchWonAuctions();
    } catch (err) {
      toast.error("Failed to confirm receipt.");
    }
  };

  if (loading)
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-7 w-40" />
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
              <SkeletonRow cols={4} />
            </tbody>
          </table>
        </div>
      </div>
    );

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-yellow-600" />
        <h1 className="text-2xl font-bold text-gray-900">Won Auctions</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
            {auctions.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  You haven't won any auctions yet.
                </td>
              </tr>
            ) : (
              auctions.map((a) => (
                <tr key={a.auctionId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {a.productTitle}
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    ${a.winningAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        a.paymentStatus === "Paid" || a.paymentStatus === "Completed"
                          ? "bg-blue-100 text-blue-700"
                          : a.paymentStatus === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {a.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    {a.paymentStatus === "AwaitingPayment" && (
                      <button
                        onClick={() => handlePay(a.saleId)}
                        className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1"
                      >
                        <CreditCard className="w-4 h-4" /> Pay Now
                      </button>
                    )}
                    {a.paymentStatus === "Paid" && (
                      <button
                        onClick={() => handleConfirmReceipt(a.saleId)}
                        className="text-green-600 hover:text-green-800 font-medium inline-flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" /> Confirm Receipt
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
