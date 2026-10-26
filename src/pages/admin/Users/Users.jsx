import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { getUsers, lockUser } from "../../../services/adminApi";
import {
  Lock,
  Search,
  Users as UsersIcon,
  Shield,
  Store,
  ShoppingBag,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Unlock,
  Clock,
  X,
  Loader2,
  Mail,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      action: "unlock",
      isPermanent: false,
      durationMinutes: "",
    },
  });

  const lockAction = useWatch({ control, name: "action" });

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
      (u) =>
        u.email?.toLowerCase().includes(term) ||
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

  // --- STATS ---
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles?.[0] === "Admin").length;
  const sellerCount = users.filter((u) => u.roles?.[0] === "Seller").length;
  const buyerCount = users.filter((u) => u.roles?.[0] === "Buyer" || !u.roles?.[0]).length;

  // Helper to get initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
  };

  // --- LOADING STATE ---
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
                <th className="px-6 py-4 font-medium">Verification</th>
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
            Manage user accounts, roles, and security settings.
          </p>
        </div>

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
                <th className="px-6 py-4 font-medium w-[30%]">User</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Verification</th>
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
                    <p className="text-gray-400 text-xs mt-1">
                      {searchTerm ? "Try adjusting your search term." : "There are no users in the system."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-gray-50/80 transition-colors">

                    {/* User Info */}
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

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${u.roles?.[0] === "Admin"
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : u.roles?.[0] === "Seller"
                            ? "bg-orange-50 text-orange-700 border-orange-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                        {u.roles?.[0] === "Admin" && <Shield className="w-3.5 h-3.5" />}
                        {u.roles?.[0] === "Seller" && <Store className="w-3.5 h-3.5" />}
                        {u.roles?.[0] === "Buyer" && <ShoppingBag className="w-3.5 h-3.5" />}
                        {u.roles?.[0] || "Buyer"}
                      </span>
                    </td>

                    {/* Verification Status */}
                    <td className="px-6 py-4">
                      {u.roles?.[0] === "Admin" ? (
                        <span className="text-xs text-gray-400 italic">N/A</span>
                      ) : u.profile?.verificationStatus === "Verified" || u.profile?.verificationStatus === "Approved" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                        </span>
                      ) : u.profile?.verificationStatus === "PendingReview" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      ) : u.profile?.verificationStatus === "Rejected" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3.5 h-3.5" /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          Not Submitted
                        </span>
                      )}
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        {u.profile?.city || "—"}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedUser(u);
                          reset({ action: "unlock", durationMinutes: "" });
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <Lock className="w-3.5 h-3.5" /> Manage Access
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MANAGE LOCK MODAL */}
      {/* ========================================================= */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95">

            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Manage Access</h2>
                <p className="text-xs text-gray-500 mt-0.5 truncate max-w-70">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onLockSubmit)} className="p-6 space-y-5">

              {/* Action Selection */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Account Status</label>
                <div className="grid grid-cols-1 gap-2">

                  {/* Unlock Option */}
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

                  {/* Temporary Lock Option */}
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

                  {/* Permanent Lock Option */}
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

              {/* Conditional Duration Input */}
              {lockAction === "temporary" && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    {...register("durationMinutes", { required: lockAction === "temporary" })}
                    className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm"
                    placeholder="e.g. 60 for 1 hour, 1440 for 1 day"
                  />
                </div>
              )}

              {/* Warning Banner */}
              {lockAction !== "unlock" && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    The user will be immediately logged out and unable to sign in until the lock is lifted.
                  </p>
                </div>
              )}

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 text-white text-sm font-bold rounded-lg transition-all disabled:opacity-50 ${lockAction === "unlock"
                      ? "bg-green-600 hover:bg-green-700 shadow-md shadow-green-600/20"
                      : lockAction === "permanent"
                        ? "bg-red-600 hover:bg-red-700 shadow-md shadow-red-600/20"
                        : "bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-600/20"
                    }`}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? "Applying..." : lockAction === "unlock" ? "Confirm Unlock" : "Apply Lock"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}