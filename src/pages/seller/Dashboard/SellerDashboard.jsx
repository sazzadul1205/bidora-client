import { Package } from "lucide-react";

export default function SellerDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-400">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md text-center">
        <div className="bg-blue-50 p-4 rounded-full mb-4">
          <Package className="w-12 h-12 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Seller Dashboard</h1>
        <p className="text-gray-500 text-sm">
          Overview metrics and analytics will be integrated here soon.
        </p>
      </div>
    </div>
  );
}