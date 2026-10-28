import { useEffect, useState } from "react";
import {
  getUsers,
  getUserRoleCounts,
  lockUser,
  createAdmin,
} from "../../../services/adminApi";
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
import Pagination from "../../../components/Pagination/Pagination";

import UserDetailsModal from "./UserDetailsModal/UserDetailsModal";
import ManageLockModal from "./ManageLockModal/ManageLockModal";
import CreateAdminModal from "./CreateAdminModal/CreateAdminModal";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search input + debounced search
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Role filter
  const [roleFilter, setRoleFilter] = useState("All");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  // Global role counts
  const [roleCounts, setRoleCounts] = useState({
    admin: 0,
    seller: 0,
    buyer: 0,
  });

  // Modals
  const [selectedUser, setSelectedUser] = useState(null);
  const [viewDetailsTarget, setViewDetailsTarget] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialLockAction, setInitialLockAction] = useState("unlock");
  const [submitting, setSubmitting] = useState(false);

  // Global total users = sum of the three role counts.
  const globalTotalUsers =
    roleCounts.admin + roleCounts.seller + roleCounts.buyer;

  // Debounce the search box → 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch the paginated user list whenever page / size / search / filter changes.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getUsers({
          page,
          pageSize,
          search: debouncedSearch || undefined,
          filter: roleFilter !== "All" ? roleFilter : undefined,
        });
        if (cancelled) return;
        const payload = res.data.data;
        setUsers(payload?.items || []);
        setTotalCount(payload?.totalCount || 0);
      } catch {
        if (!cancelled) toast.error("Failed to load users.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, roleFilter]);

  // Load global role counts once on mount.
  // Kept as an inline IIFE (not calling an outside function) so the
  // react-hooks/set-state-in-effect lint rule stays happy — the setState
  // calls only run after the async await resolves.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getUserRoleCounts();
        if (cancelled) return;
        const data = res.data.data || {};
        setRoleCounts({
          admin: data.admin ?? 0,
          seller: data.seller ?? 0,
          buyer: data.buyer ?? 0,
        });
      } catch (err) {
        console.error(err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Manual refresh of the role counts — used by event handlers only
  // (called after creating a new admin, for example).
  const fetchRoleCounts = async () => {
    try {
      const res = await getUserRoleCounts();
      const data = res.data.data || {};
      setRoleCounts({
        admin: data.admin ?? 0,
        seller: data.seller ?? 0,
        buyer: data.buyer ?? 0,
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Pagination handlers
  const goToPage = (p) => {
    if (p === page) return;
    setLoading(true);
    setPage(p);
  };

  const changePageSize = (s) => {
    if (s === pageSize) return;
    setLoading(true);
    setPageSize(s);
    setPage(1);
  };

  // Search: reset page inline (the debounced value drives the fetch).
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
    setLoading(true);
  };

  // Role filter: same reset pattern.
  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
    setLoading(true);
  };

  // Manual refresh for the table (used after lock / create-admin).
  const refreshUsers = async (opts = {}) => {
    const targetPage = opts.page ?? page;
    const targetSize = opts.pageSize ?? pageSize;
    setLoading(true);
    try {
      const res = await getUsers({
        page: targetPage,
        pageSize: targetSize,
        search: debouncedSearch || undefined,
        filter: roleFilter !== "All" ? roleFilter : undefined,
      });
      const payload = res.data.data;
      setUsers(payload?.items || []);
      setTotalCount(payload?.totalCount || 0);
    } catch {
      toast.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
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
      await refreshUsers();
      // Locking doesn't change role counts, so no need to refetch them.
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

      // New admin added → role counts changed, refresh them.
      await fetchRoleCounts();

      // Jump to first page so the new admin is visible at the top of the list.
      if (page === 1) {
        await refreshUsers({ page: 1, pageSize });
      } else {
        setLoading(true);
        setPage(1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create admin.");
    }
  };

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

  if (loading && users.length === 0) {
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
          <select
            value={roleFilter}
            onChange={handleRoleChange}
            className="w-full sm:w-32 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Seller">Seller</option>
            <option value="Buyer">Buyer</option>
          </select>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search all users..."
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
            <p className="text-2xl font-bold text-gray-900">
              {globalTotalUsers}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Admins</p>
            <p className="text-2xl font-bold text-gray-900">
              {roleCounts.admin}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-lg shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Sellers</p>
            <p className="text-2xl font-bold text-gray-900">
              {roleCounts.seller}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Buyers</p>
            <p className="text-2xl font-bold text-gray-900">
              {roleCounts.buyer}
            </p>
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
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No users found.</p>
                    <p className="text-gray-400 text-xs mt-1">
                      {debouncedSearch || roleFilter !== "All"
                        ? "Try adjusting your search or filter."
                        : "This page is empty."}
                    </p>
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const lockInfo = getLockInfo(u);
                  return (
                    <tr
                      key={u.userId}
                      className={`transition-colors ${
                        lockInfo
                          ? "bg-red-50/40 hover:bg-red-50/60 border-l-4 border-l-red-500"
                          : "hover:bg-gray-50/80 border-l-4 border-l-transparent"
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm border ${
                                lockInfo
                                  ? "bg-linear-to-br from-red-100 to-red-200 text-red-700 border-red-300"
                                  : "bg-linear-to-br from-blue-100 to-blue-200 text-blue-700 border-blue-200"
                              }`}
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
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${
                            u.roles?.[0] === "Admin"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : u.roles?.[0] === "Seller"
                                ? "bg-orange-50 text-orange-700 border-orange-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                          }`}
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
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg transition-colors ${
                              lockInfo
                                ? "text-red-700 bg-red-50 hover:bg-red-100 border-red-200"
                                : "text-gray-700 bg-white hover:bg-gray-50 border-gray-300"
                            }`}
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

        <Pagination
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={goToPage}
          onPageSizeChange={changePageSize}
        />
      </div>

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
