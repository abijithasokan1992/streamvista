import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export const DirectIngest: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!Array.isArray(json)) {
          throw new Error("Invalid format: Expected an array of metadata objects.");
        }

        let ingested = 0;
        for (const item of json) {
          if (!item.title) continue;
          await addDoc(collection(db, 'films'), {
            title: item.title,
            description: item.description || '',
            creatorId: item.creatorId || user.uid,
            status: 'draft',
            ingestedAt: serverTimestamp(),
            source: 'admin-direct-ingest',
            metadata: item
          });
          ingested++;
        }
        
        setSuccess(`Successfully ingested ${ingested} records.`);
      } catch (err) {
        setError(`Failed to parse or ingest: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
      setLoading(false);
    };
    reader.readAsText(file);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-white tracking-tight">Direct Ingest</h1>
      
      {error && <div className="bg-red-500/20 text-red-300 p-4 rounded-md border border-red-500/50">{error}</div>}
      {success && <div className="bg-green-500/20 text-green-300 p-4 rounded-md border border-green-500/50">{success}</div>}

      <Card className="bg-brand-navy-light/40 border-white/10">
        <CardHeader>
          <CardTitle className="text-xl text-white">Upload Metadata JSON</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-400 mb-6">Upload a JSON array of title metadata to instantly ingest drafts into the system.</p>
          
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-brand-navy hover:bg-brand-navy-light transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-8 h-8 mb-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                </svg>
                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500">JSON files only</p>
              </div>
              <input type="file" className="hidden" accept=".json" onChange={handleFileUpload} disabled={loading} />
            </label>
          </div>
          {loading && <p className="mt-4 text-brand-gold text-center">Ingesting data, please wait...</p>}
        </CardContent>
      </Card>
    </div>
  );
};
