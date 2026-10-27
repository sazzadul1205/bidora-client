import {
  Gavel,
  ShieldCheck,
  Wallet,
  Scale,
  Users,
  Store,
  ArrowRight,
  Sparkles,
  Heart,
  Lock,
  Truck,
  BadgeCheck,
  Mail,
  Handshake,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto">
      {/* ================= HERO ================= */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-20 w-64 h-64 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative px-6 sm:px-12 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              Built for buyers and sellers who want to trust the process
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 leading-tight max-w-3xl mx-auto">
            Fair auctions. Trusted transactions.
          </h1>

          <p className="text-blue-100 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            Bidora is a modern auction platform where every bid is protected,
            every seller is verified, and every sale happens through escrow — so
            both sides can focus on the deal, not on worrying.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/auctions"
              className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg w-full sm:w-auto justify-center"
            >
              <Gavel className="w-4 h-4" /> Browse Auctions
            </Link>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 font-semibold px-6 py-3 rounded-lg transition-colors backdrop-blur-sm w-full sm:w-auto justify-center"
            >
              <Store className="w-4 h-4" /> Start Selling
            </Link>
          </div>
        </div>
      </section>

      {/* ================= STATS BAR ================= */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <StatCard
          icon={<Users className="w-5 h-5" />}
          value="10K+"
          label="Registered Users"
          color="blue"
        />
        <StatCard
          icon={<Gavel className="w-5 h-5" />}
          value="25K+"
          label="Auctions Closed"
          color="purple"
        />
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          value="$1.2M"
          label="Transacted Safely"
          color="green"
        />
        <StatCard
          icon={<BadgeCheck className="w-5 h-5" />}
          value="98%"
          label="Verified Sellers"
          color="orange"
        />
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="How it works"
          title="Three steps to a fair deal"
          subtitle="Whether you're bidding or listing, the process is the same: protected, verified, and transparent from start to finish."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StepCard
            number="01"
            icon={<Gavel className="w-5 h-5" />}
            title="Bid or list"
            description="Buyers place binding bids backed by a refundable 25% deposit. Sellers list products with the same 25% deposit, ensuring both sides have skin in the game."
            color="blue"
          />
          <StepCard
            number="02"
            icon={<Lock className="w-5 h-5" />}
            title="Pay through escrow"
            description="When a winner is decided, the buyer pays into escrow — not to the seller. Funds stay locked until the item is confirmed received."
            color="purple"
          />
          <StepCard
            number="03"
            icon={<CheckCircle2 className="w-5 h-5" />}
            title="Confirm & settle"
            description="The buyer uploads proof of receipt, escrow releases, the seller gets paid, and the platform takes its flat 10% commission. Done."
            color="green"
          />
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="What we believe"
          title="Four principles we don't compromise on"
          subtitle="These aren't marketing lines — they're the rules the entire platform is built around."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ValueCard
            icon={<ShieldCheck className="w-5 h-5" />}
            title="Trust through transparency"
            description="Every auction shows its full bid history, every dispute shows the admin's decision, and every user can see how much is reserved and how much is available. No hidden numbers."
            color="blue"
          />
          <ValueCard
            icon={<Scale className="w-5 h-5" />}
            title="Everyone gets a fair shot"
            description="The 25% deposit isn't a barrier — it's a filter. Bidders who don't intend to pay don't participate, and sellers who overpromise are held accountable by the same rule."
            color="purple"
          />
          <ValueCard
            icon={<Lock className="w-5 h-5" />}
            title="Your money is protected"
            description="Money sits in escrow, not in someone's pocket. Buyers can't lose funds to a seller who vanishes. Sellers can't lose goods to a buyer who never pays."
            color="green"
          />
          <ValueCard
            icon={<Handshake className="w-5 h-5" />}
            title="Humans, not bots, resolve disputes"
            description="When a transaction goes wrong, an administrator reviews the evidence from both sides and makes a decision. No algorithm deciding who's at fault."
            color="orange"
          />
        </div>
      </section>

      {/* ================= WHY BIDORA ================= */}
      <section className="mb-10 bg-gray-50 border border-gray-200 rounded-2xl p-6 sm:p-10">
        <SectionHeading
          eyebrow="Why Bidora"
          title="What makes us different"
          subtitle="Plenty of platforms let you buy and sell. Very few actually protect you while you do it."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <FeatureItem
            icon={<BadgeCheck className="w-5 h-5" />}
            title="National ID verification"
            description="Buyers, sellers, and admins are all verified. Anonymous accounts can't manipulate auctions or vanish after taking your money."
          />
          <FeatureItem
            icon={<Wallet className="w-5 h-5" />}
            title="Escrow on every sale"
            description="Payment is held by the platform, not sent to the seller directly. Sellers get paid only after you confirm you received the item."
          />
          <FeatureItem
            icon={<Scale className="w-5 h-5" />}
            title="Deposit-backed bids"
            description="A 25% deposit backs every bid. If you win and don't pay, you lose the deposit — not the seller's trust."
          />
          <FeatureItem
            icon={<Truck className="w-5 h-5" />}
            title="Delivery tracking built in"
            description="Sellers must upload tracking evidence within 5 days. Buyers confirm receipt within 10. Both sides have proof."
          />
          <FeatureItem
            icon={<Eye className="w-5 h-5" />}
            title="Flat, honest fees"
            description="One commission rate: 10% on completed sales. No listing fees, no hidden charges, no surprise deductions from your wallet."
          />
          <FeatureItem
            icon={<Heart className="w-5 h-5" />}
            title="Support that actually responds"
            description="Disputes are reviewed by real administrators with real decisions — not queued into a void. You'll hear back within two business days."
          />
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="mb-10">
        <SectionHeading
          eyebrow="Our story"
          title="Why we built Bidora"
          subtitle="Because auctions shouldn't feel like a gamble."
        />

        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
              <p>
                Online auctions have a trust problem. Buyers worry the item
                won't be as described — or won't arrive at all. Sellers worry
                the winning bidder will ghost them after the auction ends. Every
                transaction is a leap of faith, and too often, someone gets
                burned.
              </p>
              <p>
                Bidora was built to fix that. We took the parts of auctions that
                work — competitive pricing, open discovery, real-time bidding —
                and wrapped them in the protections that were missing: identity
                verification, deposit-backed participation, escrow-held
                payments, and human dispute resolution.
              </p>
              <p>
                The result is an auction platform where both sides can
                participate with confidence, because the system itself protects
                them. Not because they trust each other, but because they don't
                have to.
              </p>
            </div>

            <div className="space-y-3">
              <TimelineItem
                year="The problem"
                text="Existing platforms let anyone list anything, with no verification, no escrow, and no recourse when deals go wrong."
              />
              <TimelineItem
                year="The idea"
                text="An auction platform built around three pillars: verified users, escrowed payments, and refundable deposits as skin in the game."
              />
              <TimelineItem
                year="The build"
                text="A full auction system with wallet-based payments, escrow, deposits, dispute resolution, delivery tracking, and admin oversight."
              />
              <TimelineItem
                year="Today"
                text="Bidora runs end-to-end auctions with verified users, protected funds, and human-reviewed disputes — the way it should be."
                isLast
              />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative bg-linear-to-br from-gray-900 via-gray-800 to-black rounded-2xl overflow-hidden mb-8">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-blue-500 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-purple-500 blur-3xl" />
        </div>

        <div className="relative px-6 sm:px-12 py-14 text-center">
          <h2 className="text-2xl sm:text-4xl font-bold text-white mb-3">
            Ready to bid — or to sell?
          </h2>
          <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Join a marketplace where every transaction is protected, every user
            is verified, and every dispute gets a real answer.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg w-full sm:w-auto justify-center"
            >
              Create an Account <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/terms"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-lg transition-colors w-full sm:w-auto justify-center"
            >
              Read our Terms
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 text-xs text-gray-400">
            <Mail className="w-3.5 h-3.5" />
            <span>Questions? Reach us at support@bidora.com</span>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ================= HELPER COMPONENTS ================= */

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">
        {eyebrow}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-gray-500 max-w-2xl mx-auto leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600" },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex items-center gap-4">
      <div className={`p-3 ${c.bg} ${c.text} rounded-lg shrink-0`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function StepCard({ number, icon, title, description, color }) {
  const colorMap = {
    blue: {
      border: "border-blue-200",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    purple: {
      border: "border-purple-200",
      bg: "bg-purple-50",
      text: "text-purple-600",
    },
    green: {
      border: "border-green-200",
      bg: "bg-green-50",
      text: "text-green-600",
    },
  };
  const c = colorMap[color];

  return (
    <div className="relative bg-white border border-gray-200 rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${c.bg} ${c.text} rounded-lg`}>{icon}</div>
        <span className="text-3xl font-black text-gray-100">{number}</span>
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function ValueCard({ icon, title, description, color }) {
  const colorMap = {
    blue: { bg: "bg-blue-50", text: "text-blue-600" },
    purple: { bg: "bg-purple-50", text: "text-purple-600" },
    green: { bg: "bg-green-50", text: "text-green-600" },
    orange: { bg: "bg-orange-50", text: "text-orange-600" },
  };
  const c = colorMap[color];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
      <div className={`inline-flex p-2.5 ${c.bg} ${c.text} rounded-lg mb-3`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function FeatureItem({ icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2 bg-white border border-gray-200 text-blue-600 rounded-lg shrink-0 shadow-sm">
        {icon}
      </div>
      <div>
        <h4 className="text-sm font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-xs text-gray-600 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function TimelineItem({ year, text, isLast }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1.5" />
        {!isLast && <div className="w-0.5 flex-1 bg-gray-200 mt-1" />}
      </div>
      <div className="pb-4">
        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">
          {year}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
