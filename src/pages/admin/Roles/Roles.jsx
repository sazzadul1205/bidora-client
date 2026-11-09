import PageTitle from "../../../components/PageTitle";
import { useEffect, useState } from "react";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  Users as UsersIcon,
  X,
  Check,
} from "lucide-react";
import {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} from "../../../services/adminApi";
import { toast, confirmDialog } from "../../../utils/toast";
import { SkeletonRow } from "../../../components/Skeleton";

export default function Roles() {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState(null); 
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getRoles();
      setRoles(res.data.data || []);
    } catch {
      toast.error("Failed to load roles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getRoles();
        if (cancelled) return;
        setRoles(res.data.data || []);
      } catch {
        if (!cancelled) toast.error("Failed to load roles.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const visibleRoles = roles;

  const isProtected = (r) => r.isSystem === true;

  const onCreate = async (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setSaving(true);
    try {
      await createRole({ name: trimmed });
      toast.success("Role created.");
      setName("");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create role.");
    } finally {
      setSaving(false);
    }
  };

  const onUpdate = async (e) => {
    e.preventDefault();
    const trimmed = editing?.name?.trim();
    if (!editing || !trimmed) return;

    setSaving(true);
    try {
      await updateRole(editing.id, { name: trimmed });
      toast.success("Role updated.");
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update role.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (r) => {
    const confirmed = await confirmDialog(
      "Delete role?",
      `Are you sure you want to delete "${r.name}"?`,
      "Delete",
      "Cancel",
    );
    if (!confirmed) return;

    try {
      await deleteRole(r.id);
      toast.success("Role deleted.");
      await load();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete role.");
    }
  };

  return (
    <>
      <PageTitle title="Roles" />

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" /> Role Management
          </h1>
        </div>

        <form
          onSubmit={onCreate}
          className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex gap-3"
        >
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New role name (e.g. Moderator)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <button
            disabled={saving || !name.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
              <tr>
                <th className="px-5 py-3 text-left font-medium">Role</th>
                <th className="px-5 py-3 text-left font-medium">Users</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <>
                  <SkeletonRow cols={3} />
                  <SkeletonRow cols={3} />
                </>
              ) : visibleRoles.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No roles found.
                  </td>
                </tr>
              ) : (
                visibleRoles.map((r) => {
                  const prot = isProtected(r);
                  const isEdit = editing?.id === r.id;

                  return (
                    <tr key={r.id} className="hover:bg-gray-50/60">
                      <td className="px-5 py-3">
                        {isEdit ? (
                          <form
                            onSubmit={onUpdate}
                            className="flex gap-2 items-center"
                          >
                            <input
                              value={editing.name}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  name: e.target.value,
                                })
                              }
                              className="px-2 py-1 border border-gray-300 rounded text-sm"
                              autoFocus
                            />
                            <button
                              type="submit"
                              disabled={saving || !editing.name.trim()}
                              className="p-1 text-green-600 hover:bg-green-50 rounded disabled:opacity-50"
                              title="Save"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditing(null)}
                              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
                              title="Cancel"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </form>
                        ) : (
                          <span className="font-medium text-gray-900 flex items-center gap-2">
                            {r.name}
                            {prot && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                                Protected
                              </span>
                            )}
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3 text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <UsersIcon className="w-3.5 h-3.5" />{" "}
                          {r.userCount ?? 0}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-right">
                        {!prot && !isEdit && (
                          <div className="inline-flex gap-2">
                            <button
                              onClick={() =>
                                setEditing({ id: r.id, name: r.name })
                              }
                              className="p-1.5 text-gray-500 hover:text-blue-600"
                              title="Rename"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onDelete(r)}
                              className="p-1.5 text-gray-500 hover:text-red-600 disabled:opacity-40"
                              title={
                                (r.userCount ?? 0) > 0
                                  ? "Cannot delete a role with assigned users"
                                  : "Delete"
                              }
                              disabled={(r.userCount ?? 0) > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                        {prot && (
                          <span className="text-xs font-medium text-red-600">
                            Protected role
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Admin, Buyer, and Seller roles cannot be renamed or deleted. Role
          assignment is managed per user in User Management.
        </p>
      </div>
    </>
  );
}
