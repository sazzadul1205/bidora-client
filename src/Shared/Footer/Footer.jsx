import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-surface border-t border-border-main py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
          {/* Left: brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Link
              to="/"
              className="flex items-center gap-2"
              aria-label="Bidora home"
            >
              <div className="bg-primary-600 p-1 rounded-md text-text-inverse">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <span className="text-lg font-bold text-text-main">Bidora</span>
            </Link>
            <p className="text-xs text-text-muted text-center md:text-left">
              © 2026 Bidora. A simpler way to buy and sell.
            </p>
          </div>

          {/* Right: links */}
          <nav
            aria-label="Footer navigation"
            className="flex flex-col items-center md:items-end gap-2"
          >
            <div className="flex flex-wrap justify-center md:justify-end gap-x-4 gap-y-2 text-xs font-medium text-text-muted">
              <Link to="/about" className="hover:text-text-main">
                About
              </Link>
              <Link to="/terms" className="hover:text-text-main">
                Terms of Use
              </Link>
              <Link to="/privacy" className="hover:text-text-main">
                Privacy Policy
              </Link>
              <Link to="/auctions" className="hover:text-text-main">
                Auctions
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
