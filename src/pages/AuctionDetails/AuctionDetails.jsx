import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuctionById } from "../../services/publicApi"; // Removed getProductById
import { getAuctionBids, placeBid, buyoutAuction } from "../../services/buyerApi";
import { imageUrl, handleImageError } from "../../utils/image";
import Countdown from "../../components/Countdown";
import { toast } from "../../utils/toast";
import { Gavel, Clock, ShieldCheck, ArrowLeft, Tag, Loader2, CheckCircle, XCircle, TrendingUp, Target } from "lucide-react";

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [zoomImage, setZoomImage] = useState(null);
  const [now, setNow] = useState(new Date());

  const token = localStorage.getItem("token");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      // ONLY fetch auction data (it now contains everything)
      const aucRes = await getAuctionById(id);
      const auctionData = aucRes.data.data;
      setAuction(auctionData);

      if (auctionData.images?.length > 0) {
        const main = auctionData.images.find((i) => i.isMain) || auctionData.images[0];
        setActiveImage(main.imageUrl);
      }

      try {
        const bidsRes = await getAuctionBids(id);
        setBids(bidsRes.data.data || []);
      } catch {
        console.error("Could not load bids");
      }
    } catch {
      toast.error("Failed to load auction details.");
      navigate("/auctions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const aucRes = await getAuctionById(id);
        const auctionData = aucRes.data.data;
        if (!mounted) return;
        setAuction(auctionData);

        if (auctionData.images?.length > 0) {
          const main = auctionData.images.find((i) => i.isMain) || auctionData.images[0];
          setActiveImage(main.imageUrl);
        }

        try {
          const bidsRes = await getAuctionBids(id);
          if (mounted) setBids(bidsRes.data.data || []);
        } catch {
          console.error("Could not load bids");
        }
      } catch {
        toast.error("Failed to load auction details.");
        navigate("/auctions");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, navigate]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to place a bid.");
      return navigate("/login");
    }

    // Tier logic
    const startingPrice = auction.startingPrice || 0;
    const buyoutPrice = auction.buyoutPrice || 0;
    const range = buyoutPrice - startingPrice;
    const currentBid = auction.currentHighestBid || startingPrice;
    let currentIncrement = 20;
    if (range > 0) {
      if (currentBid >= startingPrice + (range / 3) && currentBid < startingPrice + ((range * 2) / 3)) currentIncrement = 50;
      else if (currentBid >= startingPrice + ((range * 2) / 3)) currentIncrement = 100;
    }
    const calculatedMinBid = auction.currentHighestBid ? auction.currentHighestBid + currentIncrement : startingPrice;

    if (!bidAmount || Number(bidAmount) <= 0) return toast.error("Please enter a valid bid amount.");
    if (Number(bidAmount) < calculatedMinBid) return toast.error(`Minimum bid is $${calculatedMinBid.toLocaleString()}`);

    setIsBidding(true);
    try {
      await placeBid({ auctionId: Number(id), amount: Number(bidAmount) });
      toast.success("Bid placed successfully!");
      setBidAmount("");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place bid.");
    } finally {
      setIsBidding(false);
    }
  };

  const handleBuyout = async () => {
    if (!token) {
      toast.error("Please log in to buy out.");
      return navigate("/login");
    }
    if (!(await toast.confirm("Buy this item now?", "You will be charged the buyout price immediately."))) return;

    try {
      await buyoutAuction(id);
      toast.success("Buyout successful! Please check your Won Auctions to pay.");
      navigate("/buyer/won");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to buyout auction.");
    }
  };

  if (loading || !auction) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
      </div>
    );
  }

  const endTimeMs = auction.endTime ? new Date(auction.endTime).getTime() : 0;
  const isTimeUp = endTimeMs > 0 && endTimeMs <= now.getTime();
  const isLive = auction.status === "Active" && !isTimeUp;
  const isUpcoming = auction.status === "Upcoming";
  const isEnded = auction.status === "Completed" || auction.status === "Cancelled" || (auction.status === "Active" && isTimeUp);

  // --- 3-TIER PRICING LOGIC ---
  const startingPrice = auction.startingPrice || 0;
  const buyoutPrice = auction.buyoutPrice || 0;
  const range = buyoutPrice - startingPrice;
  const tier1End = startingPrice + (range / 3);
  const tier2End = startingPrice + ((range * 2) / 3);
  const currentBid = auction.currentHighestBid || startingPrice;

  let currentIncrement = 20;
  if (range > 0) {
    if (currentBid >= tier1End && currentBid < tier2End) currentIncrement = 50;
    else if (currentBid >= tier2End) currentIncrement = 100;
  }

  const calculatedMinBid = auction.currentHighestBid ? auction.currentHighestBid + currentIncrement : startingPrice;
  const progressPercentage = range > 0 ? Math.min(100, Math.max(0, ((currentBid - startingPrice) / range) * 100)) : 0;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <Link to="/auctions" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Auctions
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Images & Description */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4">
              <div className="aspect-4/3 bg-gray-100 rounded-xl overflow-hidden mb-4 cursor-zoom-in" onClick={() => activeImage && setZoomImage(imageUrl(activeImage))}>
                {activeImage ? (
                  <img src={imageUrl(activeImage)} alt={auction.productTitle} onError={handleImageError} className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No image</div>
                )}
              </div>

              {auction.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {auction.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.imageUrl)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${activeImage === img.imageUrl ? "border-blue-600" : "border-transparent hover:border-gray-300"}`}
                    >
                      <img src={imageUrl(img.imageUrl)} alt="thumbnail" onError={handleImageError} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{auction.productTitle}</h1>
                {/* Short Summary is optional, we can use Description */}
                <p className="text-sm text-gray-500">{auction.productDescription?.substring(0, 100)}...</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Condition</p>
                  <p className="font-semibold text-gray-900 capitalize">{auction.condition}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Brand</p>
                  <p className="font-semibold text-gray-900">{auction.brand || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Model</p>
                  <p className="font-semibold text-gray-900">{auction.modelNumber || "N/A"}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Category</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400" /> {auction.categoryName}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">Full Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{auction.productDescription}</p>
              </div>

              {auction.knownIssues && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Known Issues / Defects</h3>
                  <p className="text-red-700 bg-red-50 p-3 rounded-lg text-sm border border-red-100">{auction.knownIssues}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Auction Action Panel */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${isLive ? "bg-red-100 text-red-700" : isUpcoming ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"
                  }`}>
                  {isLive && <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>}
                  {isLive ? "ACTIVE" : isUpcoming ? "UPCOMING" : "ENDED"}
                </span>
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Gavel className="w-4 h-4" /> {auction.bidCount} Bids
                </span>
              </div>

              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">
                  {auction.currentHighestBid ? "Current highest bid" : "Starting price"}
                </p>
                <p className="text-4xl font-bold text-blue-600 mb-3">
                  ${auction.currentHighestBid?.toLocaleString() || startingPrice.toLocaleString()}
                </p>

                {isLive && auction.endTime && (
                  <div className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium">
                    <Clock className="w-4 h-4 inline mr-1 -mt-0.5" /> Ends in: <Countdown targetDate={auction.endTime} />
                  </div>
                )}
                {isUpcoming && auction.startTime && (
                  <div className="inline-block bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium">
                    <Clock className="w-4 h-4 inline mr-1 -mt-0.5" /> Starts in: <Countdown targetDate={auction.startTime} />
                  </div>
                )}
                {isEnded && (
                  auction.status === "Completed" ? (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium">
                      <CheckCircle className="w-4 h-4" /> Auction Completed
                    </div>
                  ) : auction.status === "Cancelled" ? (
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium">
                      <XCircle className="w-4 h-4" /> Auction Cancelled
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium">
                      <Clock className="w-4 h-4 animate-pulse" /> Processing Results...
                    </div>
                  )
                )}
              </div>

              {/* TIER VISUALIZATION */}
              <div className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Bid Increment Tiers
                  </span>
                  <span className="text-xs font-semibold text-blue-600">Current Tier: ${currentIncrement}</span>
                </div>
                <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                  <div className="absolute top-0 bottom-0 left-1/3 w-0.5 bg-white opacity-50"></div>
                  <div className="absolute top-0 bottom-0 left-2/3 w-0.5 bg-white opacity-50"></div>
                </div>
                <div className="flex justify-between text-[10px] font-medium text-gray-400 uppercase">
                  <span>Tier 1 (+$20)</span>
                  <span>Tier 2 (+$50)</span>
                  <span>Tier 3 (+$100)</span>
                </div>
              </div>

              {/* Bidding Form (Only shows if strictly Live) */}
              {isLive && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between items-end">
                      <span>Your Bid</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                        Min: ${calculatedMinBid.toLocaleString()}
                      </span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={calculatedMinBid.toString()}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5" /> Bidding reserves 25% of the starting price from your wallet.
                    </p>
                  </div>

                  <button onClick={handlePlaceBid} disabled={isBidding} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2">
                    {isBidding && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isBidding ? "Placing Bid..." : "Place Bid"}
                  </button>

                  {auction.buyoutPrice > 0 && (
                    <button onClick={handleBuyout} className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 py-3 rounded-xl font-bold transition-colors">
                      Buy It Now for ${auction.buyoutPrice.toLocaleString()}
                    </button>
                  )}
                </div>
              )}

              {/* Bid History (Mini) */}
              {bids.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">Recent Bids</h3>
                  <div className="space-y-3">
                    {bids.slice(0, 5).map((bid, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600 font-mono">User_{bid.bidderId.substring(0, 5)}...</span>
                        <span className="font-bold text-gray-900">${bid.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>Your funds are securely held in escrow until you confirm receipt of the item.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {zoomImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setZoomImage(null)}>
          <img src={zoomImage} alt="Zoomed" className="max-w-full max-h-full object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}