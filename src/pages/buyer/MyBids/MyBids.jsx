import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyBids } from "../../../services/buyerApi";
import {
  Gavel,
  Search,
  Clock,
  ArrowRight,
  Package,
  Trophy,
} from "lucide-react";
import { SkeletonRow } from "../../../components/Skeleton";
import { imageUrl, handleImageError } from "../../../utils/image";
import { formatDateTime } from "../../../utils/date";
import Pagination from "../../../components/Pagination/Pagination";

export default function MyBids() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);
  const [totalBidsCount, setTotalBidsCount] = useState(0);
  const [serverActiveBids, setServerActiveBids] = useState(0);
  const [serverHighestBids, setServerHighestBids] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getMyBids({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          filter: activeTab !== "All" ? activeTab : undefined,
        });
        if (cancelled) {
          return;
        }
        setBids(res.data.data?.items || []);
        setTotalCount(res.data.data?.totalCount || 0);
        setTotalBidsCount(res.data.data?.totalBidsCount || 0);
        setServerActiveBids(res.data.data?.activeBidsCount || 0);
        setServerHighestBids(res.data.data?.highestBidsCount || 0);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, activeTab]);

  const goToPage = (p) => {
    if (p === page) {
      return;
    }
    setLoading(true);
    setPage(p);
  };
  const changePageSize = (s) => {
    if (s === pageSize) {
      return;
    }
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };
  const handleTabChange = (tab) => {
    if (tab === activeTab) {
      return;
    }
    setActiveTab(tab);
    setPage(1);
    setLoading(true);
  };

  return (
    <>
      <PageTitle title="My Bids" />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-main flex items-center gap-2">
              <Gavel className="w-6 h-6 text-primary-600" /> My Bids
            </h1>
            <p className="text-sm text-text-muted mt-1">
              Track your active bids and review your auction history.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-text-inverse text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              Browse Auctions <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success-50 text-success-600 rounded-lg shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Active Bids</p>
              <p className="text-2xl font-bold text-text-main">
                {serverActiveBids}
              </p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-border-main shadow-sm flex items-center gap-4">
            <div className="p-3 bg-primary-50 text-primary-600 rounded-lg shrink-0">
              <Gavel className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Total Bids</p>
              <p className="text-2xl font-bold text-text-main">
                {totalBidsCount}
              </p>
            </div>
          </div>
          <div className="bg-surface p-5 rounded-xl border border-success-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-success-100 text-success-700 rounded-lg shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-text-muted">Winning</p>
              <p className="text-2xl font-bold text-success-700">
                {serverHighestBids}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-xl border border-border-main shadow-sm overflow-hidden">
          <div className="border-b border-border-main bg-neutral-50/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {["All", "Live", "Ended"].map((tab) => {
                const backendValue =
                  tab === "Live" ? "Active" : tab === "Ended" ? "Ended" : "All";
                return (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(backendValue)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
                      activeTab === backendValue
                        ? "bg-primary-600 text-text-inverse shadow-sm"
                        : "bg-surface border border-border-main text-text-muted hover:bg-neutral-50"
                    }`}
                  >
                    {tab === "Live"
                      ? "Live Auctions"
                      : tab === "Ended"
                        ? "Ended"
                        : "All Bids"}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search all bids..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-9 pr-4 py-2 bg-surface border border-border-main rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-muted min-w-200">
              <thead className="bg-neutral-50 border-b border-border-main text-text-main">
                <tr>
                  <th className="px-6 py-4 font-medium">Product</th>
                  <th className="px-6 py-4 font-medium">My Bid</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">End Time</th>
                  <th className="px-6 py-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {loading ? (
                  <>
                    <SkeletonRow cols={5} />
                    <SkeletonRow cols={5} />
                    <SkeletonRow cols={5} />
                  </>
                ) : bids.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-16">
                      <Gavel className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                      <p className="text-text-muted font-medium">
                        No bids found.
                      </p>
                      <p className="text-neutral-400 text-xs mt-1">
                        {debouncedSearch || activeTab !== "All"
                          ? "Try adjusting your search or filter."
                          : "Start exploring auctions to place your first bid!"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  bids.map((b) => (
                    <tr
                      key={b.bidId}
                      className="hover:bg-neutral-50 transition-colors cursor-pointer"
                      onClick={() =>
                        (window.location.href = `/auction/${b.auctionId}`)
                      }
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-neutral-100 border border-border-main overflow-hidden shrink-0 flex items-center justify-center">
                            {b.mainImageUrl ? (
                              <img
                                src={imageUrl(b.mainImageUrl)}
                                alt={b.productTitle}
                                onError={handleImageError}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Package className="w-5 h-5 text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-text-main line-clamp-1 flex items-center gap-2">
                              {b.productTitle}
                              {b.isHighest && (
                                <span className="text-[10px] font-bold text-success-700 bg-success-100 px-1.5 py-0.5 rounded shrink-0">
                                  WINNING
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-text-muted mt-0.5">
                              Auction #{b.auctionId}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-primary-600">
                            ৳{b.bidAmount?.toLocaleString()}
                          </span>
                          {b.isHighest && b.auctionStatus === "Active" && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-success-700 bg-success-100 px-2 py-0.5 rounded-full w-fit">
                              <span className="w-1.5 h-1.5 bg-success-600 rounded-full animate-pulse"></span>
                              You are winning
                            </span>
                          )}
                          {b.isHighest && b.auctionStatus !== "Active" && (
                            <span className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-success-700 bg-success-100 px-2 py-0.5 rounded-full w-fit">
                              Highest Bid
                            </span>
                          )}
                          {!b.isHighest && b.auctionStatus === "Active" && (
                            <span className="mt-1 text-xs text-warning-600 font-medium">
                              Outbid
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            b.auctionStatus === "Active"
                              ? "bg-success-100 text-success-700"
                              : b.auctionStatus === "Upcoming"
                                ? "bg-warning-100 text-warning-700"
                                : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {b.auctionStatus === "Active" && (
                            <span className="w-1.5 h-1.5 bg-success-600 rounded-full mr-1.5 animate-pulse"></span>
                          )}
                          {b.auctionStatus}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-text-muted">
                        {b.auctionEndTime
                          ? formatDateTime(b.auctionEndTime)
                          : "N/A"}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/auction/${b.auctionId}`}
                          className="inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 font-medium bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          {b.auctionStatus === "Active" ? "Bid Again" : "View"}
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
          />
        </div>
      </div>
    </>
  );
}
