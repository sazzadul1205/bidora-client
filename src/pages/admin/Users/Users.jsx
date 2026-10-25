import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { getUsers, lockUser } from "../../../services/adminApi";
import { Lock, Search } from "lucide-react";
import { toast } from "../../../utils/toast";
import { SkeletonRow, Skeleton } from "../../../components/Skeleton";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data.data);
      setFilteredUsers(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await getUsers();
        if (mounted) {
          setUsers(res.data.data);
          setFilteredUsers(res.data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter(u =>
      u.email?.toLowerCase().includes(term) ||
      u.profile?.fullName?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const onLockSubmit = async (data) => {
    try {
      await lockUser(selectedUser.userId, {
        isLocked: !data.isUnlock,
        isPermanent: data.isPermanent,
        durationMinutes: (!data.isUnlock && !data.isPermanent && data.durationMinutes) ? parseInt(data.durationMinutes) : null,
      });
      setSelectedUser(null);
      reset();
      fetchUsers();
      toast.success("User lock status updated successfully!");
    } catch (err) {
      toast.error("Failed to update lock status: " + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-10 w-64 rounded-lg" />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <SkeletonRow cols={4} />
            <SkeletonRow cols={4} />
            <SkeletonRow cols={4} />
            <SkeletonRow cols={4} />
            <SkeletonRow cols={4} />
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 border-b border-gray-200 text-gray-900">
            <tr>
              <th className="px-6 py-4 font-medium">Name</th>
              <th className="px-6 py-4 font-medium">Email</th>
              <th className="px-6 py-4 font-medium">Role</th>
              <th className="px-6 py-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length === 0 ? (
              <tr><td colSpan="4" className="text-center py-8">No users found.</td></tr>
            ) : filteredUsers.map((u) => (
              <tr key={u.userId} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-900">{u.profile?.fullName || "N/A"}</td>
                <td className="px-6 py-4">{u.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    u.roles?.[0] === "Admin" ? "bg-purple-100 text-purple-700" :
                    u.roles?.[0] === "Seller" ? "bg-orange-100 text-orange-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {u.roles?.[0] || "User"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => setSelectedUser(u)}
                    className="text-blue-600 hover:text-blue-800 flex items-center justify-end gap-1 w-full font-medium"
                  >
                    <Lock className="w-4 h-4" /> Manage Lock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Lock Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
            <h2 className="text-lg font-bold mb-1">Manage Lock</h2>
            <p className="text-sm text-gray-500 mb-4">{selectedUser.email}</p>

            <form onSubmit={handleSubmit(onLockSubmit)} className="space-y-4">
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" {...register("isUnlock")} className="w-4 h-4 text-blue-600 rounded" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Unlock Account</p>
                  <p className="text-xs text-gray-500">Check this to remove any active locks.</p>
                </div>
              </label>

              <div className="p-3 border rounded-lg space-y-3 bg-gray-50">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register("isPermanent")} className="w-4 h-4 text-blue-600 rounded" />
                  <span className="text-sm font-medium text-gray-900">Permanent Lock</span>
                </label>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Temporary Duration (minutes)</label>
                  <input
                    type="number"
                    {...register("durationMinutes")}
                    className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. 60 for 1 hour"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={() => setSelectedUser(null)} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Apply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}