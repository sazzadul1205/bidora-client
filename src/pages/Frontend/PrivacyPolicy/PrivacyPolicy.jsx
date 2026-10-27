import {
  ShieldCheck,
  Database,
  Eye,
  Share2,
  Clock,
  Cookie,
  Lock,
  UserCog,
  Globe,
  RefreshCw,
  Mail,
  Calendar,
  FileText,
  Users,
} from "lucide-react";

export default function PrivacyPolicy() {
  // Update this date any time the policy changes
  const lastUpdated = "October 27, 2026";

  const sections = [
    { id: "overview", title: "1. Overview" },
    { id: "collect", title: "2. Information We Collect" },
    { id: "use", title: "3. How We Use Information" },
    { id: "share", title: "4. How We Share Information" },
    { id: "retention", title: "5. Data Retention" },
    { id: "security", title: "6. Data Security" },
    { id: "cookies", title: "7. Cookies & Tokens" },
    { id: "rights", title: "8. Your Rights" },
    { id: "children", title: "9. Children's Privacy" },
    { id: "transfers", title: "10. International Transfers" },
    { id: "changes", title: "11. Changes to This Policy" },
    { id: "contact", title: "12. Contact Us" },
  ];

  return (
    <div className="max-w-7xl mx-auto py-10">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <p className="text-sm text-gray-500">
          This policy explains what information Bidora collects, how we use it,
          and the rights you have over your data.
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
                  className="block text-xs text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 px-2 py-1.5 rounded transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="lg:col-span-3 space-y-6">
          {/* 1. Overview */}
          <Section
            id="overview"
            icon={<FileText className="w-5 h-5" />}
            title="1. Overview"
          >
            <p>
              Bidora ("we", "us", "our") operates an online auction platform
              where users can buy and sell products. This Privacy Policy
              describes the personal data we collect, why we collect it, how we
              store it, and your rights regarding that data.
            </p>
            <p>
              This policy applies to all users of the platform, including
              visitors, buyers, sellers, and administrators. By using Bidora,
              you consent to the practices described in this policy.
            </p>
          </Section>

          {/* 2. Information We Collect */}
          <Section
            id="collect"
            icon={<Database className="w-5 h-5" />}
            title="2. Information We Collect"
          >
            <p>
              We collect information that you provide directly, information
              generated when you use the platform, and limited technical
              information from your device.
            </p>

            <SubHeading>Account & Identity</SubHeading>
            <List
              items={[
                "Email address (used as your login identifier).",
                "Password (stored in securely hashed form by ASP.NET Identity; we never see your plain password).",
                "Full name.",
                "Phone number (optional, used for order communication).",
                "Account role (Buyer, Seller, or Admin).",
              ]}
            />

            <SubHeading>Verification Data</SubHeading>
            <p>
              To comply with anti-fraud and KYC requirements, we require
              identity verification for buying, selling, and withdrawing funds:
            </p>
            <List
              items={[
                "National ID number.",
                "Photographs of the front and back of your National ID.",
                "Verification status and, if rejected, the rejection reason.",
                "The identity of the administrator who reviewed your submission and the review timestamp.",
              ]}
            />

            <SubHeading>Profile & Contact</SubHeading>
            <List
              items={[
                "Profile photo (optional).",
                "Address and city (used for delivery coordination and dispute review).",
                "Any profile information you choose to add.",
              ]}
            />

            <SubHeading>Financial & Transaction Data</SubHeading>
            <List
              items={[
                "Wallet balance and reserved balance.",
                "Deposit requests, including the payment method, transaction reference, amount, and uploaded receipt image.",
                "Wallet transactions (credits, debits, penalties, releases, commissions).",
                "Wallet reservations (eligibility deposits, seller deposits, sale escrow).",
              ]}
            />

            <SubHeading>Auction & Sale Activity</SubHeading>
            <List
              items={[
                "Bids you place (amount, auction, timestamp).",
                "Auctions and sales you participate in, as buyer or seller.",
                "Disputes you raise or that are raised against you, including complaint text and evidence images.",
                "Delivery records: dispatch information, tracking evidence images, receipt confirmation, and receipt proof images.",
              ]}
            />

            <SubHeading>Technical Data</SubHeading>
            <List
              items={[
                "Authentication tokens (JWT) issued when you log in — stored in your browser.",
                "IP address and basic request metadata, used for security and fraud prevention.",
                "Standard server logs (timestamps, endpoints accessed, response codes).",
              ]}
            />
          </Section>

          {/* 3. How We Use Information */}
          <Section
            id="use"
            icon={<Eye className="w-5 h-5" />}
            title="3. How We Use Information"
          >
            <p>We use the information described above to:</p>
            <List
              items={[
                "Create and manage your account.",
                "Verify your identity before allowing financial or selling activity.",
                "Process deposits, payments, escrow, and withdrawals.",
                "Operate auctions, track bids, and determine winners.",
                "Facilitate buyer-seller transactions and delivery.",
                "Resolve disputes fairly, including reviewing evidence from both parties.",
                "Detect and prevent fraud, abuse, and unauthorized access.",
                "Enforce our Terms of Use and apply penalties where required.",
                "Send transactional emails (e.g. payment confirmations, dispute outcomes).",
                "Comply with legal obligations, including anti-money-laundering (AML) and tax reporting where applicable.",
                "Improve platform features and fix bugs.",
              ]}
            />
            <p>
              We do not sell your personal data, and we do not use your data for
              third-party advertising.
            </p>
          </Section>

          {/* 4. How We Share Information */}
          <Section
            id="share"
            icon={<Share2 className="w-5 h-5" />}
            title="4. How We Share Information"
          >
            <p>
              We only share personal information in the limited situations
              described below.
            </p>

            <SubHeading>Between Buyers and Sellers</SubHeading>
            <p>
              When a sale is completed, the seller and buyer may see each
              other's name, city, and relevant transaction details (final
              amount, delivery information, tracking evidence). Full contact
              details such as email and phone number are shared only when
              necessary to complete the transaction or resolve a dispute.
            </p>

            <SubHeading>With Administrators</SubHeading>
            <p>
              Bidora administrators have access to account information, identity
              documents, transaction history, and dispute records in order to
              review listings, resolve disputes, and enforce platform rules.
            </p>

            <SubHeading>Service Providers</SubHeading>
            <List
              items={[
                "Image hosting providers — to store National ID images, profile photos, product images, receipts, tracking evidence, and dispute evidence.",
                "Email delivery providers — to send transactional notifications.",
                "Database and hosting infrastructure — to run the platform.",
              ]}
            />
            <p>
              These providers are bound to use your data only for the services
              they perform for Bidora.
            </p>

            <SubHeading>Legal Requirements</SubHeading>
            <p>
              We may disclose information when required by law, subpoena, or
              government request, or when we believe in good faith that
              disclosure is necessary to protect our rights, protect users, or
              investigate fraud.
            </p>

            <SubHeading>Business Transfers</SubHeading>
            <p>
              If Bidora is acquired or merged with another company, user data
              may be transferred as part of that transaction. You will be
              notified of any such change in ownership or use of your data.
            </p>
          </Section>

          {/* 5. Data Retention */}
          <Section
            id="retention"
            icon={<Clock className="w-5 h-5" />}
            title="5. Data Retention"
          >
            <p>
              We retain personal data for as long as needed to operate the
              platform and comply with our legal obligations.
            </p>
            <List
              items={[
                "Account records are kept for the lifetime of the account, plus a reasonable period afterward to close out any pending disputes or financial activity.",
                "Identity verification records are retained even after account closure, to comply with anti-fraud and AML obligations.",
                "Financial transaction records (wallet transactions, deposits, sales) are retained for as long as legally required.",
                "Auction and bid history is retained to preserve the integrity of past sales and to support dispute resolution.",
                "Dispute records are retained indefinitely once a decision has been made, as evidence of the resolution.",
              ]}
            />
            <p>
              When data is no longer needed, we delete or anonymize it. Some
              records (like completed sale history) may be retained in
              anonymized form for accounting and statistical purposes.
            </p>
          </Section>

          {/* 6. Data Security */}
          <Section
            id="security"
            icon={<Lock className="w-5 h-5" />}
            title="6. Data Security"
          >
            <p>
              We take the security of your data seriously and apply industry-
              standard protections:
            </p>
            <List
              items={[
                "Passwords are hashed using ASP.NET Identity's secure hashing algorithms — we never store plain passwords.",
                "All API access requires a signed JWT token that expires automatically.",
                "Role-based access control ensures users can only access the endpoints relevant to their role.",
                "Identity documents and evidence images are stored in a managed image hosting service with restricted access.",
                "Administrative actions (verification approvals, dispute resolutions, lock/unlock) are recorded with the acting administrator's user ID.",
              ]}
            />
            <p>
              While we implement these measures, no system is 100% secure. You
              are responsible for keeping your login credentials confidential
              and reporting any suspicious activity immediately.
            </p>
          </Section>

          {/* 7. Cookies & Tokens */}
          <Section
            id="cookies"
            icon={<Cookie className="w-5 h-5" />}
            title="7. Cookies & Authentication Tokens"
          >
            <p>
              Bidora uses browser storage (localStorage or session cookies,
              depending on your session preferences) to store your
              authentication token. This token keeps you logged in and lets the
              platform identify you on each request.
            </p>
            <p>
              We do not use tracking cookies, advertising pixels, or third-party
              analytics that profile your behavior across other websites. Any
              storage we use is strictly necessary to operate the platform
              securely.
            </p>
            <p>
              Logging out clears your token. If you clear your browser storage
              manually, you will be logged out and must sign in again.
            </p>
          </Section>

          {/* 8. Your Rights */}
          <Section
            id="rights"
            icon={<UserCog className="w-5 h-5" />}
            title="8. Your Rights"
          >
            <p>
              Depending on your jurisdiction, you may have the following rights
              regarding your personal data:
            </p>
            <List
              items={[
                "Access — request a copy of the personal data we hold about you.",
                "Correction — update or correct inaccurate information via your profile or by contacting support.",
                "Deletion — request deletion of your account and personal data, subject to legal retention requirements.",
                "Restriction — ask us to limit how we process your data in certain circumstances.",
                "Portability — request your data in a commonly used, machine-readable format.",
                "Objection — object to processing that is not strictly necessary to operate the platform.",
                "Withdrawal of consent — where we rely on consent, you may withdraw it at any time.",
              ]}
            />
            <p>
              To exercise any of these rights, contact us using the details in
              Section 12. We will respond within a reasonable timeframe, and no
              later than required by applicable law.
            </p>
            <p>
              Note that identity documents and financial records may not be
              deletable until legal retention periods have passed. In that case,
              we will explain the reason and retain only the minimum necessary.
            </p>
          </Section>

          {/* 9. Children's Privacy */}
          <Section
            id="children"
            icon={<Users className="w-5 h-5" />}
            title="9. Children's Privacy"
          >
            <p>
              Bidora is intended for users aged 18 and older. We do not
              knowingly collect personal data from anyone under 18. If you
              believe a minor has provided us with personal data, please contact
              us and we will delete it promptly.
            </p>
          </Section>

          {/* 10. International Transfers */}
          <Section
            id="transfers"
            icon={<Globe className="w-5 h-5" />}
            title="10. International Transfers"
          >
            <p>
              Your data may be stored and processed in countries other than your
              own, including where our hosting providers operate. When we
              transfer data across borders, we take steps to ensure it remains
              protected consistent with this policy and applicable law.
            </p>
            <p>
              By using Bidora, you acknowledge that your information may be
              transferred to and processed in jurisdictions that may have
              different data protection laws from your own.
            </p>
          </Section>

          {/* 11. Changes */}
          <Section
            id="changes"
            icon={<RefreshCw className="w-5 h-5" />}
            title="11. Changes to This Policy"
          >
            <p>
              We may update this Privacy Policy from time to time. When we do,
              we will update the "Last updated" date at the top of this page and
              — for significant changes — notify you through the platform or by
              email.
            </p>
            <p>
              Continued use of Bidora after changes take effect constitutes your
              acceptance of the updated policy. If you do not agree, you should
              discontinue use of the platform.
            </p>
          </Section>

          {/* 12. Contact */}
          <Section
            id="contact"
            icon={<Mail className="w-5 h-5" />}
            title="12. Contact Us"
          >
            <p>
              If you have questions about this Privacy Policy, want to exercise
              your data rights, or need to report a data concern, please contact
              us:
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
              <p className="text-sm flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-gray-900">
                  privacy@bidora.com
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-1 ml-6">
                We aim to respond within two business days. For data access or
                deletion requests, please include your account email so we can
                locate your record.
              </p>
            </div>
          </Section>

          {/* Footer strip */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-900 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
            <p>
              Your trust matters. Bidora only collects the data needed to run
              the auction safely and fairly — nothing more. If you have concerns
              about how your information is handled, please reach out before
              assuming the worst.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ---------- Helper components ---------- */

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
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
