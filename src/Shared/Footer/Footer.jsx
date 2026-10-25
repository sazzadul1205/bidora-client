import { Link } from "react-router-dom"

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          
          {/* Left side */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-blue-600 p-1 rounded-md text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">Bidora</span>
            </Link>
            <p className="text-xs text-gray-500">
              © 2026 Bidora. A simpler way to buy and sell.
            </p>
          </div>

          {/* Right side */}
          <div className="flex flex-col items-center md:items-end gap-2">
            <div className="flex gap-4 text-xs font-medium text-gray-500">
              <a href="#" className="hover:text-gray-900">Help center</a>
              <a href="#" className="hover:text-gray-900">Auction rules</a>
              <a href="#" className="hover:text-gray-900">Terms & privacy</a>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              No online payments. Arrange handover directly with the seller.
            </p>
          </div>

        </div>
      </div>
    </footer>
  )
}

export default Footer