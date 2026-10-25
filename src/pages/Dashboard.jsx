import { Gavel, Trophy } from "lucide-react";

function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Page Header */}
      <div className="flex items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, Nadia</h1>
          <p className="text-sm text-gray-500 mt-1">Your bids, wins and spend, all in one place.</p>
        </div>
        <button className="ml-auto bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Browse marketplace
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Active bids</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">2</span>
            <span className="text-sm text-gray-400 mb-1">currently leading</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Auctions won</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">2</span>
            <span className="text-sm text-gray-400 mb-1">1 awaiting payment</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-sm font-medium text-gray-500 mb-1">Total spent</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">6</span>
            <span className="text-sm text-gray-400 mb-1">successful purchases</span>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
        <div className="mt-0.5 text-blue-500 font-bold text-sm">i</div>
        <p className="text-sm text-blue-800">
          Your wallet balance is <strong>$1,250.00</strong>. Top up your wallet to bid above your current limit.
        </p>
      </div>

      {/* Placeholder Table Area */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">My bids</h2>
          <button className="text-sm text-blue-600 font-medium hover:underline">Browse all auctions</button>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Gavel className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">Table placeholder: Your active bids will appear here.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-base font-bold text-gray-900">Won auctions</h2>
        </div>
        <div className="p-6 text-center text-gray-500">
          <Trophy className="w-8 h-8 mx-auto text-gray-300 mb-2" />
          <p className="text-sm">Table placeholder: Your won auctions will appear here.</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;