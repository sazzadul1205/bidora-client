import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Store, Info } from "lucide-react";

function Register() {
  // State to handle the Buyer / Seller toggle
  const [role, setRole] = useState("buyer");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 md:py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Column - Marketing */}
        <div className="max-w-lg">
          <p className="text-blue-600 font-semibold text-xs tracking-wider uppercase mb-4">
            Join the marketplace
          </p>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            Great products.<br />New possibilities.
          </h1>
          <p className="text-gray-500 mb-8 text-base">
            Create an account to bid on your next find or give your products a new home.
          </p>

          {/* Gray Info Box */}
          <div className="bg-gray-50/80 border border-gray-100 rounded-xl p-6 mb-8">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Choose how you'll use Bidora
            </h3>
            <p className="text-sm text-gray-500 mb-3 leading-relaxed">
              <strong className="text-gray-700 font-medium">Buyers</strong> browse, bid and buy out. 
              Sellers upload products and follow their auctions from approval to result.
            </p>
            <p className="text-sm text-gray-500 leading-relaxed">
              Products are reviewed before going live. Winners and sellers arrange handover directly.
            </p>
          </div>

          <div className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-medium hover:underline">
              Log in
            </Link>
          </div>
        </div>

        {/* Right Column - Register Card */}
        <div className="w-full max-w-md mx-auto lg:ml-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Start with the role that's right for you.
            </p>

            <form className="space-y-4">
              {/* Role Selection Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to join as a
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Buyer Button */}
                  <button
                    type="button"
                    onClick={() => setRole("buyer")}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                      role === "buyer"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className={`w-4 h-4 ${role === "buyer" ? "text-blue-600" : "text-gray-500"}`} />
                        <span className={`text-sm font-medium ${role === "buyer" ? "text-blue-900" : "text-gray-700"}`}>
                          Buyer
                        </span>
                      </div>
                      {/* Custom Radio Circle */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === "buyer" ? "border-blue-600" : "border-gray-300"}`}>
                        {role === "buyer" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Bid and buy</span>
                  </button>

                  {/* Seller Button */}
                  <button
                    type="button"
                    onClick={() => setRole("seller")}
                    className={`flex flex-col items-start p-3 rounded-lg border text-left transition-colors ${
                      role === "seller"
                        ? "border-blue-600 bg-blue-50/50"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-2">
                        <Store className={`w-4 h-4 ${role === "seller" ? "text-blue-600" : "text-gray-500"}`} />
                        <span className={`text-sm font-medium ${role === "seller" ? "text-blue-900" : "text-gray-700"}`}>
                          Seller
                        </span>
                      </div>
                      {/* Custom Radio Circle */}
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${role === "seller" ? "border-blue-600" : "border-gray-300"}`}>
                        {role === "seller" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">Sell your stuff</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Create a password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm mb-1"
                />
                <p className="text-[11px] text-gray-500">
                  Use at least 8 characters, including a letter and a number.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs text-gray-600 leading-tight">
                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
                  </span>
                </label>
              </div>

              <button
                type="button"
                className="w-full bg-blue-600 text-white font-medium py-2.5 rounded-lg hover:bg-blue-700 transition-colors mt-2 capitalize"
              >
                Create {role} account
              </button>
            </form>

            {/* Info Banner */}
            <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
              <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                Admin accounts are created internally. Public registration is for buyers and sellers only.
              </p>
            </div>

            <div className="mt-6 text-center text-sm text-gray-600">
              Already registered?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;