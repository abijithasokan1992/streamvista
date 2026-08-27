import React, { useState, useEffect } from 'react';
import { Download, Edit3, Trash2, Eye } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  uploadedAt: string;
  size: number;
}

export default function RecentUploadsManager() {
  const [uploads, setUploads] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<FileItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<FileItem | null>(null);
  const [newName, setNewName] = useState('');

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch('/api/storage/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUploads(data.files);
      }
    } catch (err) {
      console.error('Failed to load files', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleRename = async () => {
    if (!editingItem || !newName) return;
    try {
        const token = localStorage.getItem('authToken');
        await fetch(`/api/storage/files/${editingItem.id}/rename`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ newName })
        });
        setEditingItem(null);
        setNewName('');
        fetchFiles();
    } catch (err) {
        console.error('Failed to rename', err);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
        const token = localStorage.getItem('authToken');
        await fetch(`/api/storage/files/${confirmDelete.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setConfirmDelete(null);
        fetchFiles();
    } catch (err) {
        console.error('Failed to delete', err);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 max-w-4xl">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Recent Uploads Control Panel</h3>
      
      {loading ? (
        <div className="text-slate-500 text-sm">Loading assets...</div>
      ) : (
        <div className="space-y-3">
            {uploads.map((file) => (
            <div key={file.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-md gap-4">
                
                <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                    🎥 {file.name}
                </p>
                <div className="flex gap-4 text-xs text-slate-500 mt-1">
                    <span>{new Date(file.uploadedAt).toLocaleString()}</span>
                    <span className="text-slate-400 font-mono">{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
                </div>

                <div className="flex items-center gap-2">
                <button onClick={() => alert('View not implemented')} className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded transition">
                    <Eye size={14} />
                </button>
                <button onClick={() => window.open(`/api/storage/files/${file.id}/download`)} className="p-2 bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 rounded transition">
                    <Download size={14} />
                </button>
                <button onClick={() => { setEditingItem(file); setNewName(file.name); }} className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-500 rounded transition">
                    <Edit3 size={14} />
                </button>
                <button onClick={() => setConfirmDelete(file)} className="p-2 bg-rose-950/40 hover:bg-rose-950 border border-rose-900 text-rose-400 rounded transition">
                    <Trash2 size={14} />
                </button>
                </div>
            </div>
            ))}
        </div>
      )}

      {/* Rename Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-md">
                <h4 className="text-white font-bold mb-4">Rename Asset</h4>
                <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 p-2 text-white rounded mb-4" />
                <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                    <button onClick={handleRename} className="px-4 py-2 bg-emerald-600 text-white rounded">Save</button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-md">
                <h4 className="text-white font-bold mb-4">Confirm Deletion</h4>
                <p className="text-slate-400 text-sm mb-4">Are you sure you want to permanently delete {confirmDelete.name}?</p>
                <div className="flex justify-end gap-2">
                    <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 text-slate-400">Cancel</button>
                    <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 text-white rounded">Delete</button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
}
