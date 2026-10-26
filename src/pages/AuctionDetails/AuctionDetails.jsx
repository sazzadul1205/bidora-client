import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAuctionById, getProductById } from "../../services/publicApi";
import {
  getAuctionBids,
  placeBid,
  buyoutAuction,
} from "../../services/buyerApi";
import { imageUrl, handleImageError } from "../../utils/image";
import Countdown from "../../components/Countdown";
import { toast } from "../../utils/toast";
import {
  Gavel,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Tag,
  Loader2,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function AuctionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [product, setProduct] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const [zoomImage, setZoomImage] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch auction data, product data (for images), and bid history
  const fetchData = async () => {
    try {
      const aucRes = await getAuctionById(id);
      const auctionData = aucRes.data.data;
      setAuction(auctionData);

      // Fetch product details to get the images
      const prodRes = await getProductById(auctionData.productId);
      const productData = prodRes.data.data;
      setProduct(productData);

      // Set main image
      if (productData.images?.length > 0) {
        const main =
          productData.images.find((i) => i.isMain) || productData.images[0];
        setActiveImage(main.imageUrl);
      }

      // Fetch bid history
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

  // Initial load only. The async body is inlined inside the effect so the
  // React compiler can statically see every setState() call happens after an
  // await — never synchronously — avoiding cascading renders.
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const aucRes = await getAuctionById(id);
        const auctionData = aucRes.data.data;
        if (!mounted) return;
        setAuction(auctionData);

        const prodRes = await getProductById(auctionData.productId);
        const productData = prodRes.data.data;
        if (!mounted) return;
        setProduct(productData);

        if (productData.images?.length > 0) {
          const main =
            productData.images.find((i) => i.isMain) || productData.images[0];
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
    return () => {
      mounted = false;
    };
  }, [id, navigate]);

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Please log in to place a bid.");
      return navigate("/login");
    }
    if (!bidAmount || Number(bidAmount) <= 0) {
      toast.error("Please enter a valid bid amount.");
      return;
    }

    setIsBidding(true);
    try {
      await placeBid({ auctionId: Number(id), amount: Number(bidAmount) });
      toast.success("Bid placed successfully!");
      setBidAmount("");
      fetchData(); // Refresh bids and current price
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      if (status === 403) {
        toast.error(
          serverMsg ||
            "You are not authorized to bid. Please log in as a Buyer."
        );
      } else if (status === 401) {
        toast.error("Please log in to place a bid.");
        return navigate("/login");
      } else {
        toast.error(serverMsg || "Failed to place bid.");
      }
    } finally {
      setIsBidding(false);
    }
  };

  const handleBuyout = async () => {
    if (!token) {
      toast.error("Please log in to buy out.");
      return navigate("/login");
    }
    if (
        !(await toast.confirm(
          "Buy this item now?",
          "You will be charged the buyout price immediately and become the winner of this auction."
        ))
      )
        return;

    try {
      await buyoutAuction(id);
      toast.success(
        "Buyout successful! Please check your Won Auctions to pay.",
      );
      navigate("/buyer/won");
    } catch (err) {
      const status = err.response?.status;
      const serverMsg = err.response?.data?.message;
      if (status === 403) {
        toast.error(
          serverMsg ||
            "You are not authorized to buy out. Please log in as a Buyer."
        );
      } else if (status === 401) {
        toast.error("Please log in to buy out.");
        return navigate("/login");
      } else {
        toast.error(serverMsg || "Failed to buyout auction.");
      }
    }
  };

  if (loading || !auction || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
      </div>
    );
  }

  const isLive = auction.status === "Active";
  const isUpcoming = auction.status === "Upcoming";
  const isEnded =
    auction.status === "Completed" || auction.status === "Cancelled";

  // Logic to determine minimum bid
  let minBid = auction.currentHighestBid
    ? auction.currentHighestBid + 20 // Basic increment
    : product.startingPrice;

  return (
    <div className="bg-gray-50 min-h-screen pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/auctions"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Auctions
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Images & Description */}
          <div className="lg:col-span-7 space-y-6">
            {/* Image Gallery */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4">
              <div
                className="aspect-4/3 bg-gray-100 rounded-xl overflow-hidden mb-4 cursor-zoom-in"
                onClick={() =>
                  activeImage && setZoomImage(imageUrl(activeImage))
                }
              >
                {activeImage ? (
                  <img
                    src={imageUrl(activeImage)}
                    alt={product.title}
                    onError={handleImageError}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    No image
                  </div>
                )}
              </div>

              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img) => (
                    <button
                      key={img.id}
                      onClick={() => setActiveImage(img.imageUrl)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition ${
                        activeImage === img.imageUrl
                          ? "border-blue-600"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={imageUrl(img.imageUrl)}
                        alt="thumbnail"
                        onError={handleImageError}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {product.title}
                </h1>
                <p className="text-sm text-gray-500">{product.shortSummary}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl text-sm">
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Condition</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {product.condition}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Brand</p>
                  <p className="font-semibold text-gray-900">
                    {product.brand || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Model</p>
                  <p className="font-semibold text-gray-900">
                    {product.modelNumber || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Category</p>
                  <p className="font-semibold text-gray-900 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />{" "}
                    {product.categoryName}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-2">
                  Full Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                  {product.description}
                </p>
              </div>

              {product.knownIssues && (
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Known Issues / Defects
                  </h3>
                  <p className="text-red-700 bg-red-50 p-3 rounded-lg text-sm border border-red-100">
                    {product.knownIssues}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Auction Action Panel */}
          <div className="lg:col-span-5 relative">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sticky top-24">
              {/* Status Banner */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                    isLive
                      ? "bg-red-100 text-red-700"
                      : isUpcoming
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {isLive && (
                    <span className="w-2 h-2 bg-red-600 rounded-full animate-ping"></span>
                  )}
                  {auction.status.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-500 flex items-center gap-1">
                  <Gavel className="w-4 h-4" /> {auction.bidCount} Bids
                </span>
              </div>

              {/* Current Price / Timer */}
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">
                  {auction.currentHighestBid
                    ? "Current highest bid"
                    : "Starting price"}
                </p>
                <p className="text-4xl font-bold text-blue-600 mb-3">
                  $
                  {auction.currentHighestBid?.toLocaleString() ||
                    product.startingPrice?.toLocaleString()}
                </p>

                {isLive && auction.endTime && (
                  <div className="inline-block bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium">
                    <Clock className="w-4 h-4 inline mr-1 -mt-0.5" />
                    Ends in: <Countdown targetDate={auction.endTime} />
                  </div>
                )}
                {isUpcoming && auction.startTime && (
                  <div className="inline-block bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium">
                    <Clock className="w-4 h-4 inline mr-1 -mt-0.5" />
                    Starts in: <Countdown targetDate={auction.startTime} />
                  </div>
                )}
                {isEnded && (
                  auction.status === "Completed" ? (
                    <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-lg font-medium">
                      <CheckCircle className="w-4 h-4" /> Auction Completed
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg font-medium">
                      <XCircle className="w-4 h-4" /> Auction Cancelled
                    </div>
                  )
                )}
              </div>

              {/* Ended auction summary */}
              {isEnded && (
                <div className="mt-4 text-center text-sm">
                  {auction.status === "Completed" && auction.result ? (
                    <p className="text-green-700 font-medium">
                      Winner: {auction.result} · Final bid $
                      {auction.currentHighestBid?.toLocaleString() || "0.00"}
                    </p>
                  ) : auction.status === "Completed" ? (
                    <p className="text-gray-600">
                      No winner — no bids were placed.
                    </p>
                  ) : (
                    <p className="text-red-600">
                      This auction was cancelled by the seller.
                    </p>
                  )}
                </div>
              )}

              {/* Bidding Form */}
              {isLive && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Bid (Min: ${minBid})
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                        $
                      </span>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={minBid.toString()}
                        className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-bold text-lg"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Bidding reserves 25% of the starting price from your
                      wallet.
                    </p>
                  </div>

                  <button
                    onClick={handlePlaceBid}
                    disabled={isBidding}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-lg transition-colors shadow-md shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isBidding && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isBidding ? "Placing Bid..." : "Place Bid"}
                  </button>

                  {product.buyoutPrice > 0 && (
                    <button
                      onClick={handleBuyout}
                      className="w-full bg-white border-2 border-gray-900 text-gray-900 hover:bg-gray-50 py-3 rounded-xl font-bold transition-colors"
                    >
                      Buy It Now for ${product.buyoutPrice.toLocaleString()}
                    </button>
                  )}
                </div>
              )}

              {/* Bid History (Mini) */}
              {bids.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">
                    Recent Bids
                  </h3>
                  <div className="space-y-3">
                    {bids.slice(0, 5).map((bid, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600 font-mono">
                          User_{bid.bidderId.substring(0, 5)}...
                        </span>
                        <span className="font-bold text-gray-900">
                          ${bid.amount.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex items-start gap-2 bg-blue-50 p-3 rounded-lg text-xs text-blue-800">
                <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Your funds are securely held in escrow until you confirm
                  receipt of the item.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {zoomImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setZoomImage(null)}
        >
          <img
            src={zoomImage}
            alt="Zoomed"
            className="max-w-full max-h-full object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
