import { Package, Gavel, Plus, Eye, TrendingUp } from "lucide-react";

function SellerDashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your products, auctions, and sales.</p>
        </div>
        <button className="ml-auto bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> List new item
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Active Listings</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">0</span>
            <span className="text-sm text-gray-400 mb-1">products</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Active Auctions</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">0</span>
            <span className="text-sm text-gray-400 mb-1">running</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total Sales</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">$0</span>
            <span className="text-sm text-gray-400 mb-1">lifetime</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Pending Reviews</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">0</span>
            <span className="text-sm text-gray-400 mb-1">moderation</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">List Product</h3>
          </div>
          <p className="text-sm text-gray-500">Create a new product listing for auction.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-green-50 p-2 rounded-lg">
              <Eye className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-gray-900">View Products</h3>
          </div>
          <p className="text-sm text-gray-500">Browse and manage your listed products.</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-purple-50 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Auction Analytics</h3>
          </div>
          <p className="text-sm text-gray-500">View bids, views, and performance metrics.</p>
        </div>
      </div>

      {/* Placeholder Table Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Active Listings</h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">View all</button>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Package className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">Table placeholder: Your active product listings will appear here.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Recent Bids</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Gavel className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">Table placeholder: Recent bids on your products will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default SellerDashboard;