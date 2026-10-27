import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getUsers, lockUser, createAdmin } from "../../../services/adminApi";
import {
  Lock, Search, Users as UsersIcon, Shield, Store, ShoppingBag,
  MapPin, CheckCircle2, XCircle, AlertTriangle, Unlock, Clock,
  X, Loader2, Mail, UserPlus, Eye, Wallet, Phone, CreditCard, Calendar
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals State
  const [selectedUser, setSelectedUser] = useState(null); // For Manage Access
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null); // For Read-Only View
  const [showCreateModal, setShowCreateModal] = useState(false); // For Create Admin

  const [submitting, setSubmitting] = useState(false);

  // Form for locking users
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: { action: "unlock", isPermanent: false, durationMinutes: "" },
  });
  const lockAction = useWatch({ control, name: "action" });

  // Form for creating admins
  const { register: registerAdmin, handleSubmit: handleAdminSubmit, reset: resetAdmin, formState: { errors: adminErrors, isSubmitting: isAdminSubmitting } } = useForm();

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data || []);
      setFilteredUsers(res.data.data || []);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getUsers();
        if (mounted) {
          setUsers(res.data.data || []);
          setFilteredUsers(res.data.data || []);
        }
      } catch {
        toast.error("Failed to load users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (u) => u.email?.toLowerCase().includes(term) ||
        u.profile?.fullName?.toLowerCase().includes(term) ||
        u.userId?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const onLockSubmit = async (data) => {
    setSubmitting(true);
    try {
      const isUnlock = data.action === "unlock";
      const isPermanent = data.action === "permanent";

      await lockUser(selectedUser.userId, {
        isLocked: !isUnlock,
        isPermanent: isPermanent,
        durationMinutes: data.action === "temporary" ? parseInt(data.durationMinutes) : null,
      });

      setSelectedUser(null);
      reset();
      fetchUsers();
      toast.success(`User account ${isUnlock ? "unlocked" : "locked"} successfully!`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update lock status.");
    } finally {
      setSubmitting(false);
    }
  };

  const onCreateAdminSubmit = async (data) => {
    try {
      await createAdmin(data);
      toast.success("Admin account created successfully!");
      setShowCreateModal(false);
      resetAdmin();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin.");
    }
  };

  // --- STATS ---
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles?.[0] === "Admin").length;
  const sellerCount = users.filter((u) => u.roles?.[0] === "Seller").length;
  const buyerCount = users.filter((u) => u.roles?.[0] === "Buyer" || !u.roles?.[0]).length;

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const formatMoney = (num) =>
    `$${Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-64 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Wallet</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
              <SkeletonRow cols={5} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage user accounts, roles, wallets, and security settings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm shrink-0 w-full sm:w-auto"
          >
            <UserPlus className="w-4 h-4" /> Add Admin
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Users</p>
            <p className="text-2xl font-bold text-gray-900">{totalUsers}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sellers</p>
            <p className="text-2xl font-bold text-gray-900">{sellerCount}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Buyers</p>
            <p className="text-2xl font-bold text-gray-900">{buyerCount}</p>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600 min-w-225">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
              <tr>
                <th className="px-6 py-4 font-medium w-[25%]">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Wallet Balance</th>
                <th className="px-6 py-4 font-medium">Location</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No users found.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 text-blue-700 font-bold text-xs shadow-sm border border-blue-200">
                          {getInitials(u.profile?.fullName)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.profile?.fullName || "Unnamed User"}</p>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${u.roles?.[0] === "Admin" ? "bg-purple-50 text-purple-700 border-purple-200"
                          : u.roles?.[0] === "Seller" ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                        {u.roles?.[0] === "Admin" && <Shield className="w-3.5 h-3.5" />}
                        {u.roles?.[0] === "Seller" && <Store className="w-3.5 h-3.5" />}
                        {u.roles?.[0] === "Buyer" && <ShoppingBag className="w-3.5 h-3.5" />}
                        {u.roles?.[0] || "Buyer"}
                      </span>
                    </td>

                    {/* NEW: Wallet Column */}
                    <td className="px-6 py-4">
                      {u.wallet ? (
                        <div>
                          <p className="font-bold text-gray-900">{formatMoney(u.wallet.availableBalance)}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">
                            Res: {formatMoney(u.wallet.reservedBalance)}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">No Wallet</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {u.profile?.city || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewDetailsTarget(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            reset({ action: "unlock", durationMinutes: "" });
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <Lock className="w-3.5 h-3.5" /> Manage Access
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* NEW: READ-ONLY USER DETAILS MODAL */}
      {/* ========================================================= */}
      {viewDetailsTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-xl flex flex-col">

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0 text-blue-700 font-bold text-lg shadow-sm border border-blue-200">
                  {getInitials(viewDetailsTarget.profile?.fullName)}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">{viewDetailsTarget.profile?.fullName || "Unnamed User"}</h2>
                  <p className="text-xs text-gray-500">{viewDetailsTarget.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewDetailsTarget(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">

              {/* Wallet Overview */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-gray-500" /> Wallet Overview
                </h3>
                {viewDetailsTarget.wallet ? (
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Available</p>
                      <p className="text-xl font-bold text-green-600">{formatMoney(viewDetailsTarget.wallet.availableBalance)}</p>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Reserved</p>
                      <p className="text-xl font-bold text-orange-600">{formatMoney(viewDetailsTarget.wallet.reservedBalance)}</p>
                    </div>
                    <div className="text-center border-l border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Total</p>
                      <p className="text-xl font-bold text-gray-900">{formatMoney(viewDetailsTarget.wallet.balance)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 p-4 rounded-xl text-center text-gray-500 text-sm">No wallet data available.</div>
                )}
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-gray-500" /> Account Information
                </h3>
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Role</p>
                    <p className="font-semibold text-gray-900">{viewDetailsTarget.roles?.[0] || "Buyer"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Verification Status</p>
                    <div>
                      {viewDetailsTarget.roles?.[0] === "Admin" ? (
                        <span className="text-xs text-gray-400 italic">N/A</span>
                      ) : viewDetailsTarget.profile?.verificationStatus === "Verified" || viewDetailsTarget.profile?.verificationStatus === "Approved" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                      ) : viewDetailsTarget.profile?.verificationStatus === "PendingReview" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded"><Clock className="w-3 h-3" /> Pending</span>
                      ) : viewDetailsTarget.profile?.verificationStatus === "Rejected" ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded"><XCircle className="w-3 h-3" /> Rejected</span>
                      ) : (
                        <span className="text-xs text-gray-500">Not Submitted</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Phone Number</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-gray-400" /> {viewDetailsTarget.phoneNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">National ID</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-gray-400" /> {viewDetailsTarget.profile?.nationalIdNumber || "N/A"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-0.5">Address</p>
                    <p className="font-semibold text-gray-900">{viewDetailsTarget.profile?.address || "N/A"}, {viewDetailsTarget.profile?.city || "N/A"}</p>
                  </div>
                  <div className="col-span-2 border-t border-gray-200 pt-2">
                    <p className="text-xs text-gray-500 mb-0.5">Joined Date</p>
                    <p className="font-semibold text-gray-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {viewDetailsTarget.profile?.createdAt ? new Date(viewDetailsTarget.profile.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end sticky bottom-0 z-10 rounded-b-2xl">
              <button
                onClick={() => setViewDetailsTarget(null)}
                className="px-6 py-2.5 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MANAGE LOCK MODAL (Keep existing) */}
      {/* ========================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Manage Access</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">{selectedUser.email}</p>
              </div>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onLockSubmit)} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Account Status</label>
                <div className="grid grid-cols-1 gap-2">
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "unlock" ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" value="unlock" {...register("action")} className="hidden" />
                    <div className={`p-2 rounded-lg ${lockAction === "unlock" ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                      <Unlock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${lockAction === "unlock" ? "text-green-800" : "text-gray-700"}`}>Unlock Account</p>
                      <p className="text-xs text-gray-500">Restore normal access immediately.</p>
                    </div>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "temporary" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" value="temporary" {...register("action")} className="hidden" />
                    <div className={`p-2 rounded-lg ${lockAction === "temporary" ? "bg-orange-100 text-orange-600" : "bg-gray-100 text-gray-400"}`}>
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${lockAction === "temporary" ? "text-orange-800" : "text-gray-700"}`}>Temporary Lock</p>
                      <p className="text-xs text-gray-500">Suspend access for a specific duration.</p>
                    </div>
                  </label>
                  <label className={`cursor-pointer border-2 rounded-xl p-3 flex items-center gap-3 transition ${lockAction === "permanent" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"}`}>
                    <input type="radio" value="permanent" {...register("action")} className="hidden" />
                    <div className={`p-2 rounded-lg ${lockAction === "permanent" ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-400"}`}>
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${lockAction === "permanent" ? "text-red-800" : "text-gray-700"}`}>Permanent Lock</p>
                      <p className="text-xs text-gray-500">Permanently ban this user from the platform.</p>
                    </div>
                  </label>
                </div>
              </div>
              {lockAction === "temporary" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                  <input type="number" {...register("durationMinutes", { required: lockAction === "temporary" })} className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm" placeholder="e.g. 60 for 1 hour" />
                </div>
              )}
              {lockAction !== "unlock" && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>The user will be immediately logged out and unable to sign in until the lock is lifted.</p>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setSelectedUser(null)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${lockAction === "unlock" ? "bg-green-600 hover:bg-green-700" : lockAction === "permanent" ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}`}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Applying..." : lockAction === "unlock" ? "Confirm Unlock" : "Apply Lock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* CREATE ADMIN MODAL (Keep existing) */}
      {/* ========================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-gray-700" /> Create Admin Account
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Grant full platform access to a new user.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdminSubmit(onCreateAdminSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  {...registerAdmin("fullName", { required: "Name is required" })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${adminErrors.fullName ? "border-red-500" : "border-gray-300"}`}
                  placeholder="John Doe"
                />
                {adminErrors.fullName && <p className="text-xs text-red-600 mt-1">{adminErrors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  {...registerAdmin("email", { required: "Email is required" })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${adminErrors.email ? "border-red-500" : "border-gray-300"}`}
                  placeholder="admin@bidora.com"
                />
                {adminErrors.email && <p className="text-xs text-red-600 mt-1">{adminErrors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  {...registerAdmin("password", { required: "Password is required", minLength: { value: 6, message: "Min 6 characters" } })}
                  className={`w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-gray-500 outline-none text-sm ${adminErrors.password ? "border-red-500" : "border-gray-300"}`}
                  placeholder="••••••••"
                />
                {adminErrors.password && <p className="text-xs text-red-600 mt-1">{adminErrors.password.message}</p>}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isAdminSubmitting} className="inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 bg-gray-900 hover:bg-black shadow-md">
                  {isAdminSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isAdminSubmitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}