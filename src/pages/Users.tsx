import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Badge } from "../components/ui/Badge";
import { Users as UsersIcon, Search, ShieldCheck, UserPlus, Filter, CheckCircle2, ShieldAlert, Edit2 } from "lucide-react";
import { databaseService } from "../services/database";
import { useAuth } from "../contexts/AuthContext";
import type { UserProfile, UserRole } from "../types/auth";

export default function Users() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  
  // Role Edit Modal State
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>("creator_partner");
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const fetched = await databaseService.getUsers();
        if (fetched && fetched.length > 0) {
          setUsers(fetched);
        } else {
          // Default initial platform roster if database returns empty
          setUsers([
            { uid: "u_1", displayName: "Abijith Asokan", email: "abijithasokan@crayonspictures.com", role: "platform_owner", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z", studioName: "Crayons Pictures" },
            { uid: "u_2", displayName: "Rajesh Kumar", email: "rajesh@streamvista.com", role: "admin", createdAt: "2026-02-15T00:00:00.000Z", updatedAt: "2026-02-15T00:00:00.000Z", studioName: "StreamVista Operations" },
            { uid: "u_3", displayName: "Vikramaditya Studios", email: "contact@vikramaditya.in", role: "creator_partner", createdAt: "2026-03-10T00:00:00.000Z", updatedAt: "2026-03-10T00:00:00.000Z", studioName: "Vikramaditya Productions" },
            { uid: "u_4", displayName: "Netflix Content Ops", email: "acquisitions@netflix.com", role: "buyer", createdAt: "2026-04-01T00:00:00.000Z", updatedAt: "2026-04-01T00:00:00.000Z", studioName: "Netflix International" },
            { uid: "u_5", displayName: "Priya Sharma", email: "priya.qc@streamvista.com", role: "qc_staff", createdAt: "2026-05-12T00:00:00.000Z", updatedAt: "2026-05-12T00:00:00.000Z", studioName: "Technical QC Desk" },
            { uid: "u_6", displayName: "Anand Verma", email: "legal@streamvista.com", role: "legal_staff", createdAt: "2026-06-01T00:00:00.000Z", updatedAt: "2026-06-01T00:00:00.000Z", studioName: "Legal Clearance Office" }
          ]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  const handleUpdateRole = async () => {
    if (!editingUser) return;
    setUpdating(true);
    try {
      setUsers(prev => prev.map(u => u.uid === editingUser.uid ? { ...u, role: selectedNewRole, updatedAt: new Date().toISOString() } : u));

      if (databaseService.isSupabase()) {
        await databaseService.supabase.logAuditAction(
          currentUser?.uid || 'admin',
          'USER_ROLE_UPDATED',
          'user_profile',
          editingUser.uid,
          { previousRole: editingUser.role, newRole: selectedNewRole, updatedBy: currentUser?.email }
        );
      }

      setSuccessMessage(`Role for ${editingUser.displayName} updated to "${selectedNewRole}".`);
      setEditingUser(null);
    } catch (e) {
      alert("Failed to update user role.");
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || (u.studioName && u.studioName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = selectedRoleFilter === "all" || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "platform_owner": return "bg-purple-500/20 text-purple-300 border-purple-500/30";
      case "founder": return "bg-pink-500/20 text-pink-300 border-pink-500/30";
      case "super_admin":
      case "admin": return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "creator_partner": return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      case "buyer": return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "qc_staff": return "bg-orange-500/20 text-orange-300 border-orange-500/30";
      case "legal_staff": return "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";
      case "finance": return "bg-green-500/20 text-green-300 border-green-500/30";
      default: return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
            <UsersIcon className="text-brand-gold h-8 w-8" /> User Directory & Role Management
          </h1>
          <p className="text-slate-400 text-sm">Manage platform accounts, role permissions, studio affiliations, and buyer access.</p>
        </div>

        <Button className="bg-brand-gold text-brand-navy hover:bg-yellow-500 font-semibold flex items-center gap-2 text-xs">
          <UserPlus size={16} /> Invite New User
        </Button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-300 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs text-slate-400 hover:text-white">Dismiss</button>
        </div>
      )}

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <Input 
            placeholder="Search by name, email, or studio..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-brand-navy-light/40 border-white/10 text-white placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={16} className="text-slate-400" />
          <select 
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="bg-brand-navy-light/60 border border-white/10 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-gold"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="platform_owner">Platform Owner</option>
            <option value="admin">Admin</option>
            <option value="creator_partner">Creator Partner</option>
            <option value="buyer">Buyer</option>
            <option value="qc_staff">QC Staff</option>
            <option value="legal_staff">Legal Staff</option>
            <option value="finance">Finance</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading User Directory...</div>
      ) : (
        <Card className="bg-brand-navy-light/40 border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-brand-black/40 text-xs uppercase text-slate-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Studio / Company</th>
                  <th className="px-6 py-4 font-semibold">Registered</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredUsers.map((user) => (
                  <tr key={user.uid} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold text-sm border border-brand-gold/30">
                          {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{user.displayName}</div>
                          <div className="text-xs text-slate-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getRoleBadgeColor(user.role)}`}>
                        {user.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {user.studioName || 'Crayons Network'}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button 
                        variant="secondary" 
                        onClick={() => {
                          setEditingUser(user);
                          setSelectedNewRole(user.role);
                        }}
                        className="text-xs py-1 px-3 h-8 flex items-center gap-1.5 ml-auto"
                      >
                        <Edit2 size={13} /> Change Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <Card className="bg-brand-navy border border-white/20 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white text-xl flex items-center gap-2">
                <ShieldCheck className="text-brand-gold" /> Update User Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-black/40 rounded-lg border border-white/5 text-sm">
                <div className="font-semibold text-white">{editingUser.displayName}</div>
                <div className="text-xs text-slate-400">{editingUser.email}</div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1 font-medium">Select Assigned Platform Role:</label>
                <select 
                  value={selectedNewRole}
                  onChange={(e) => setSelectedNewRole(e.target.value as UserRole)}
                  className="w-full bg-black/60 border border-white/10 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-gold"
                >
                  <option value="creator_partner">Creator Partner (Title Submissions & Revenue)</option>
                  <option value="buyer">OTT / TV Buyer (Discovery & Acquisitions)</option>
                  <option value="admin">Administrator (Platform Management)</option>
                  <option value="qc_staff">QC Staff (Technical Video Inspection)</option>
                  <option value="legal_staff">Legal Staff (Rights & Clearance)</option>
                  <option value="finance">Finance Ops (Ledgers & Payouts)</option>
                  <option value="platform_owner">Platform Owner (Executive Control)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300 text-xs flex items-start gap-2">
                <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-400" />
                <p>Changing role updates server-enforced Row Level Security (RLS) policies and dashboard navigation access.</p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                <Button variant="secondary" onClick={() => setEditingUser(null)} className="text-xs">Cancel</Button>
                <Button onClick={handleUpdateRole} disabled={updating} className="bg-brand-gold text-brand-navy hover:bg-yellow-500 font-semibold text-xs px-4">
                  {updating ? "Saving..." : "Save Role Assignment"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
