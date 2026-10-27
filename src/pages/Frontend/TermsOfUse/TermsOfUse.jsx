import {
  ScrollText,
  Shield,
  Users,
  Gavel,
  Wallet,
  CreditCard,
  Truck,
  AlertTriangle,
  Scale,
  Percent,
  Lock,
  Ban,
  RefreshCw,
  Mail,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export default function TermsOfUse() {
  // Update this date any time the terms change
  const lastUpdated = "October 27, 2026";

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "eligibility", title: "2. Eligibility & Account" },
    { id: "roles", title: "3. User Roles" },
    { id: "auctions", title: "4. Auctions & Bidding" },
    { id: "deposits", title: "5. Deposits & Wallet" },
    { id: "payment", title: "6. Payment & Escrow" },
    { id: "delivery", title: "7. Delivery & Receipt" },
    { id: "disputes", title: "8. Disputes & Penalties" },
    { id: "fees", title: "9. Fees & Commission" },
    { id: "prohibited", title: "10. Prohibited Activities" },
    { id: "suspension", title: "11. Account Suspension" },
    { id: "liability", title: "12. Limitation of Liability" },
    { id: "changes", title: "13. Changes to Terms" },
    { id: "contact", title: "14. Contact Us" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
            <ScrollText className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Terms of Use</h1>
        </div>
        <p className="text-sm text-gray-500">
          Please read these terms carefully before using Bidora. By accessing or
          using the platform, you agree to be bound by them.
        </p>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents — sticky on desktop */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 lg:sticky lg:top-6">
            <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">
              On this page
            </h2>
            <nav className="space-y-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="block text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 px-2 py-1.5 rounded transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3 space-y-6">
          {/* 1. Acceptance */}
          <Section
            id="acceptance"
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="1. Acceptance of Terms"
          >
            <p>
              By creating an account, placing a bid, listing a product, or
              otherwise using any part of the Bidora platform, you confirm that
              you have read, understood, and agree to be bound by these Terms of
              Use. If you do not agree, you must not use the platform.
            </p>
            <p>
              These Terms apply to all visitors, registered users, buyers,
              sellers, and administrators. They form a legally binding agreement
              between you and Bidora.
            </p>
          </Section>

          {/* 2. Eligibility */}
          <Section
            id="eligibility"
            icon={<Users className="w-5 h-5" />}
            title="2. Eligibility & Account"
          >
            <p>To use Bidora, you must:</p>
            <List
              items={[
                "Be at least 18 years old and legally able to enter into binding contracts.",
                "Provide accurate, current, and complete information during registration.",
                "Maintain the security of your password and account credentials.",
                "Complete identity verification (National ID) when required for buying, selling, or withdrawing funds.",
                "Notify us immediately of any unauthorized use of your account.",
              ]}
            />
            <p>
              You are responsible for all activity that occurs under your
              account. We may suspend or terminate accounts that contain false
              information or that we reasonably believe are being used
              fraudulently.
            </p>
          </Section>

          {/* 3. Roles */}
          <Section
            id="roles"
            icon={<Shield className="w-5 h-5" />}
            title="3. User Roles"
          >
            <p>Bidora distinguishes between three roles:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <RoleCard
                title="Buyer"
                color="blue"
                description="Can browse listings, place bids, buy out products, and pay through the wallet system."
              />
              <RoleCard
                title="Seller"
                color="orange"
                description="Can list products, manage auctions, dispatch sold items, and receive sale proceeds."
              />
              <RoleCard
                title="Admin"
                color="purple"
                description="Can review listings, manage user accounts, resolve disputes, and configure auctions."
              />
            </div>
            <p className="mt-3">
              Your role determines which features you can access. Attempting to
              access features outside your role is prohibited and may result in
              account suspension.
            </p>
          </Section>

          {/* 4. Auctions */}
          <Section
            id="auctions"
            icon={<Gavel className="w-5 h-5" />}
            title="4. Auctions & Bidding"
          >
            <p>
              All bids placed on an auction are legally binding offers to
              purchase the item at the amount submitted. By placing a bid, you
              commit to pay the winning amount if you are the highest bidder
              when the auction ends.
            </p>
            <SubHeading>Auction rules</SubHeading>
            <List
              items={[
                "Bids may not be retracted once placed, except where required by law.",
                "The first bid must meet or exceed the seller's starting price.",
                "Subsequent bids must meet the minimum bid increment, which increases as the auction price climbs.",
                "Bids at or above the buyout price must use the Buyout function rather than the standard bid.",
                "Sellers may not bid on their own listings.",
                "Bid manipulation (shill bidding, coordinated bidding, or bidding to inflate prices) is strictly prohibited.",
              ]}
            />
            <SubHeading>Buyout</SubHeading>
            <p>
              If a seller has set a buyout price, any eligible buyer may
              purchase the item immediately at that price, ending the auction.
              The buyer must complete payment within three (3) days of the
              buyout.
            </p>
          </Section>

          {/* 5. Deposits */}
          <Section
            id="deposits"
            icon={<Wallet className="w-5 h-5" />}
            title="5. Deposits & Wallet"
          >
            <p>
              Bidora uses a wallet-based payment system. To participate in
              auctions, users must maintain sufficient funds in their wallet.
            </p>
            <SubHeading>Eligibility deposit (buyers)</SubHeading>
            <p>
              Before placing your first bid on an auction, Bidora reserves{" "}
              <strong className="text-gray-900">
                25% of the starting price
              </strong>{" "}
              from your available wallet balance. This reserved amount is held
              until the auction ends and is released back to your available
              balance if you do not win.
            </p>
            <SubHeading>Seller deposit (sellers)</SubHeading>
            <p>
              When you submit a product for admin approval, Bidora reserves{" "}
              <strong className="text-gray-900">
                25% of the starting price
              </strong>{" "}
              from your wallet as a good-faith deposit. This deposit is released
              after a successful sale, or forfeited if you are found at fault in
              a dispute.
            </p>
            <SubHeading>Deposits & withdrawals</SubHeading>
            <List
              items={[
                "Deposit requests require an uploaded receipt and are manually reviewed by administrators.",
                "Approved deposits are credited to your wallet within the review window.",
                "Rejected deposits will not be credited; you will receive a rejection reason.",
                "Withdrawals are subject to identity verification and platform review.",
              ]}
            />
          </Section>

          {/* 6. Payment */}
          <Section
            id="payment"
            icon={<CreditCard className="w-5 h-5" />}
            title="6. Payment & Escrow"
          >
            <p>
              When you win an auction or complete a buyout, you must pay the
              full winning amount from your wallet within the payment window
              (three days from the end of the auction, or immediately on
              buyout).
            </p>
            <SubHeading>How escrow works</SubHeading>
            <p>
              Payment is not delivered directly to the seller. Instead, the
              amount is held securely in escrow by Bidora until the buyer
              confirms receipt of the item. Only then is the seller paid and the
              platform commission deducted.
            </p>
            <SubHeading>Failure to pay</SubHeading>
            <p>
              If payment is not completed by the deadline, the sale is marked
              overdue and may be subject to a dispute by the seller. Your
              eligibility deposit may be forfeited.
            </p>
          </Section>

          {/* 7. Delivery */}
          <Section
            id="delivery"
            icon={<Truck className="w-5 h-5" />}
            title="7. Delivery & Receipt"
          >
            <p>
              Once payment is confirmed, the seller must dispatch the item
              within{" "}
              <strong className="text-gray-900">
                five (5) days of being notified
              </strong>
              . Sellers are required to upload tracking evidence when recording
              dispatch.
            </p>
            <SubHeading>Buyer responsibilities</SubHeading>
            <p>
              The buyer must confirm receipt within ten (10) days of dispatch by
              uploading proof of receipt. If the buyer does not confirm within
              this window, the seller may report non-delivery, which will result
              in a dispute reviewed by an administrator.
            </p>
            <SubHeading>Seller responsibilities</SubHeading>
            <p>
              Sellers must package items appropriately, provide accurate
              tracking information, and remain responsive to buyer inquiries
              during transit.
            </p>
          </Section>

          {/* 8. Disputes */}
          <Section
            id="disputes"
            icon={<AlertTriangle className="w-5 h-5" />}
            title="8. Disputes & Penalties"
          >
            <p>
              If a transaction does not proceed as expected, either party may
              raise a dispute. Disputes are reviewed by Bidora administrators,
              who will examine the evidence and issue a decision.
            </p>
            <SubHeading>When disputes can be raised</SubHeading>
            <List
              items={[
                "Buyers may dispute a sale after payment but before confirming receipt.",
                "Sellers may dispute a sale only after the payment window has closed, if the buyer has not paid.",
                "Sellers may also report non-delivery after the 10-day pickup window has passed with no receipt confirmation.",
                "Once a sale is completed, it cannot be disputed.",
              ]}
            />
            <SubHeading>Outcomes</SubHeading>
            <p>
              Depending on the outcome, the at-fault party's deposit (25% of the
              starting price) will be forfeited and distributed as follows:{" "}
              <strong className="text-gray-900">
                80% to the wronged party
              </strong>{" "}
              and{" "}
              <strong className="text-gray-900">
                20% to the Bidora platform
              </strong>
              .
            </p>
            <p>
              Administrative decisions are final. Repeated disputes or patterns
              of fraudulent behavior may result in account suspension.
            </p>
          </Section>

          {/* 9. Fees */}
          <Section
            id="fees"
            icon={<Percent className="w-5 h-5" />}
            title="9. Fees & Commission"
          >
            <p>
              Bidora charges a{" "}
              <strong className="text-gray-900">10% platform commission</strong>{" "}
              on every completed sale. The commission is deducted from the final
              sale amount and paid to the platform when the buyer confirms
              receipt. The seller receives the remaining 90% as their proceeds.
            </p>
            <p>
              Deposits, wallet transactions, and the platform commission
              described above are the only fees applied to your account under
              normal circumstances. Any future fee changes will be communicated
              in advance.
            </p>
          </Section>

          {/* 10. Prohibited */}
          <Section
            id="prohibited"
            icon={<Ban className="w-5 h-5" />}
            title="10. Prohibited Activities"
          >
            <p>You may not use Bidora to:</p>
            <List
              items={[
                "List or sell illegal, counterfeit, stolen, or prohibited items.",
                "Misrepresent products with inaccurate descriptions, photos, or condition reports.",
                "Engage in shill bidding, bid manipulation, or coordinated auctions.",
                "Circumvent the platform's payment, escrow, or commission system.",
                "Create multiple accounts to bypass locks, bans, or verification requirements.",
                "Harass, threaten, or defraud other users.",
                "Upload malicious content, viruses, or attempt to breach platform security.",
                "Impersonate Bidora staff or other users.",
              ]}
            />
            <p>
              Violation of these rules may result in immediate account
              termination, forfeiture of deposits, and reporting to law
              enforcement where applicable.
            </p>
          </Section>

          {/* 11. Suspension */}
          <Section
            id="suspension"
            icon={<Lock className="w-5 h-5" />}
            title="11. Account Suspension & Termination"
          >
            <p>
              Bidora may suspend, temporarily lock, or permanently terminate any
              account that violates these Terms, engages in fraud, or poses a
              risk to other users or the platform.
            </p>
            <p>
              Temporary locks are issued for specific durations and are lifted
              automatically when the lock period expires. Permanent bans are
              final and prevent the account from logging in or accessing the
              platform. Locked accounts remain subject to any pending disputes
              or financial obligations.
            </p>
            <p>
              You may request account deletion at any time by contacting
              support. Deletion may be delayed while you have open sales,
              disputes, or outstanding wallet balances.
            </p>
          </Section>

          {/* 12. Liability */}
          <Section
            id="liability"
            icon={<Scale className="w-5 h-5" />}
            title="12. Limitation of Liability"
          >
            <p>
              Bidora acts as an intermediary between buyers and sellers. We do
              not own, inspect, or guarantee any item listed on the platform. We
              do not guarantee that sellers will deliver items as described or
              that buyers will pay as required, though we do provide escrow and
              dispute resolution as described in these Terms.
            </p>
            <p>
              To the maximum extent permitted by law, Bidora is not liable for
              any indirect, incidental, or consequential damages arising from
              your use of the platform, including lost profits, lost data, or
              damage to reputation.
            </p>
            <p>
              Where liability cannot be excluded, our total liability to you is
              limited to the total fees you have paid to Bidora in the twelve
              (12) months preceding the event giving rise to the claim.
            </p>
          </Section>

          {/* 13. Changes */}
          <Section
            id="changes"
            icon={<RefreshCw className="w-5 h-5" />}
            title="13. Changes to These Terms"
          >
            <p>
              We may update these Terms of Use from time to time. When we do, we
              will update the "Last updated" date at the top of this page and,
              where the changes are significant, notify you through the platform
              or by email.
            </p>
            <p>
              Continued use of Bidora after changes take effect constitutes your
              acceptance of the updated Terms. If you do not agree with any
              change, you must stop using the platform.
            </p>
          </Section>

          {/* 14. Contact */}
          <Section
            id="contact"
            icon={<Mail className="w-5 h-5" />}
            title="14. Contact Us"
          >
            <p>
              If you have questions about these Terms, need help with a dispute,
              or wish to report a violation, please contact us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-900">
                  support@bidora.com
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                We aim to respond within two business days.
              </p>
            </div>
          </Section>

          {/* Footer strip */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-900 flex items-start gap-3">
            <Shield className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              By using Bidora, you acknowledge that you have read and understood
              these Terms of Use and agree to be bound by them. If you do not
              agree, please discontinue use of the platform.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/* Helper components */

function Section({ id, icon, title, children }) {
  return (
    <section
      id={id}
      className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 scroll-mt-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-gray-50 text-gray-700 rounded-lg">{icon}</div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

function SubHeading({ children }) {
  return (
    <h3 className="text-sm font-bold text-gray-900 mt-4 mb-2">{children}</h3>
  );
}

function List({ items }) {
  return (
    <ul className="space-y-1.5 mt-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RoleCard({ title, description, color }) {
  const colorMap = {
    blue: "bg-blue-50 border-blue-200 text-blue-900",
    orange: "bg-orange-50 border-orange-200 text-orange-900",
    purple: "bg-purple-50 border-purple-200 text-purple-900",
  };

  return (
    <div className={`border rounded-lg p-3 ${colorMap[color]}`}>
      <p className="font-bold text-sm mb-1">{title}</p>
      <p className="text-xs leading-relaxed opacity-90">{description}</p>
    </div>
  );
}
