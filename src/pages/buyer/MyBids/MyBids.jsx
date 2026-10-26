import { useEffect, useState } from "react";
import { getMyBids } from "../../../services/buyerApi";
import { Gavel } from "lucide-react";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchBids = async () => {
      try {
        const res = await getMyBids();
        if (mounted) setBids(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBids();
    return () => {
      mounted = false;
    };
  }, []);

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
                <th className="px-6 py-4 font-medium">My Bid</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">End Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SkeletonRow cols={4} />
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
        <Gavel className="w-6 h-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">My Bids</h1>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Product</th>
              <th className="px-6 py-4 font-medium">My Bid</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">End Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {bids.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  You haven't placed any bids yet.
                </td>
              </tr>
            ) : (
              bids.map((b) => (
                <tr key={b.bidId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {b.productTitle}
                  </td>
                  <td className="px-6 py-4 font-bold text-blue-600">
                    ${b.bidAmount?.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        b.auctionStatus === "Active"
                          ? "bg-green-100 text-green-700"
                          : b.auctionStatus === "Ended"
                          ? "bg-gray-100 text-gray-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {b.auctionStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {b.auctionEndTime
                      ? new Date(b.auctionEndTime).toLocaleString()
                      : "N/A"}
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
