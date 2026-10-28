import { useEffect, useState } from "react";
import { getUsers, lockUser, createAdmin } from "../../../services/adminApi";
import {
  Lock,
  Search,
  Users as UsersIcon,
  Shield,
  Store,
  ShoppingBag,
  MapPin,
  Mail,
  UserPlus,
  Eye,
} from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

import UserDetailsModal from "./UserDetailsModal/UserDetailsModal";
import ManageLockModal from "./ManageLockModal/ManageLockModal";
import CreateAdminModal from "./CreateAdminModal/CreateAdminModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals State
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialLockAction, setInitialLockAction] = useState("unlock");

  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
           const res = await getUsers();
      setUsers(res.data.data?.items || []);
      setFilteredUsers(res.data.data?.items || []);
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
          setUsers(res.data.data?.items || []);
          setFilteredUsers(res.data.data?.items || []);
        }
      } catch {
        toast.error("Failed to load users.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(
      (u) =>
        u.email?.toLowerCase().includes(term) ||
        u.profile?.fullName?.toLowerCase().includes(term) ||
        u.userId?.toLowerCase().includes(term),
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
        durationMinutes:
          data.action === "temporary" ? parseInt(data.durationMinutes) : null,
      });

      setSelectedUser(null);
      fetchUsers();
      toast.success(
        `User account ${isUnlock ? "unlocked" : "locked"} successfully!`,
      );
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to update lock status.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onCreateAdminSubmit = async (data) => {
    try {
      await createAdmin(data);
      toast.success("Admin account created successfully!");
      setShowCreateModal(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin.");
    }
  };

  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.roles?.[0] === "Admin").length;
  const sellerCount = users.filter((u) => u.roles?.[0] === "Seller").length;
  const buyerCount = users.filter(
    (u) => u.roles?.[0] === "Buyer" || !u.roles?.[0],
  ).length;

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatMoney = (num) =>
    `$${Number(num || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  const getLockInfo = (user) => {
    if (!user?.isLocked) return null;
    const end = user.lockoutEnd ? new Date(user.lockoutEnd) : null;
    const isPermanent = end && end.getFullYear() >= 9000;
    return {
      isPermanent,
      endLabel:
        end && !isPermanent
          ? end.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : null,
      label: isPermanent ? "Permanently Locked" : "Temporarily Locked",
    };
  };

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
                filteredUsers.map((u) => {
                  const lockInfo = getLockInfo(u);
                  return (
                    <tr
                      key={u.userId}
                      className={`transition-colors ${lockInfo ? "bg-red-50/40 hover:bg-red-50/60 border-l-4 border-l-red-500" : "hover:bg-gray-50/80 border-l-4 border-l-transparent"}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border ${lockInfo ? "bg-linear-to-br from-red-100 to-red-200 text-red-700 border-red-300" : "bg-linear-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-200"}`}
                            >
                              {getInitials(u.profile?.fullName)}
                            </div>
                            {lockInfo && (
                              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center border-2 border-white shadow">
                                <Lock className="w-2.5 h-2.5" />
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-gray-900">
                                {u.profile?.fullName || "Unnamed User"}
                              </p>
                              {lockInfo && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded">
                                  <Lock className="w-2.5 h-2.5" />{" "}
                                  {lockInfo.isPermanent ? "Banned" : "Locked"}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3" /> {u.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${u.roles?.[0] === "Admin" ? "bg-purple-50 text-purple-700 border-purple-200" : u.roles?.[0] === "Seller" ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}
                        >
                          {u.roles?.[0] === "Admin" && (
                            <Shield className="w-3.5 h-3.5" />
                          )}
                          {u.roles?.[0] === "Seller" && (
                            <Store className="w-3.5 h-3.5" />
                          )}
                          {u.roles?.[0] === "Buyer" && (
                            <ShoppingBag className="w-3.5 h-3.5" />
                          )}
                          {u.roles?.[0] || "Buyer"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.wallet ? (
                          <div>
                            <p className="font-bold text-gray-900">
                              {formatMoney(u.wallet.availableBalance)}
                            </p>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Res: {formatMoney(u.wallet.reservedBalance)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            No Wallet
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />{" "}
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
                              if (lockInfo?.isPermanent)
                                setInitialLockAction("permanent");
                              else if (lockInfo)
                                setInitialLockAction("temporary");
                              else setInitialLockAction("unlock");
                            }}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors ${lockInfo ? "text-red-700 bg-red-50 hover:bg-red-100 border-red-200" : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"}`}
                          >
                            <Lock className="w-3.5 h-3.5" /> Manage Access
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EXTRACTED MODALS */}
      <UserDetailsModal
        target={viewDetailsTarget}
        onClose={() => setViewDetailsTarget(null)}
        getLockInfo={getLockInfo}
        getInitials={getInitials}
        formatMoney={formatMoney}
      />

      <ManageLockModal
        selectedUser={selectedUser}
        onClose={() => setSelectedUser(null)}
        onSubmit={onLockSubmit}
        submitting={submitting}
        getLockInfo={getLockInfo}
        initialAction={initialLockAction}
      />

      {showCreateModal && (
        <CreateAdminModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={onCreateAdminSubmit}
        />
      )}
    </div>
  );
}
