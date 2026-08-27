'use client';

import { useState } from 'react';
import { Megaphone, Loader2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';

export default function AdminDashboard() {
  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);

  const announcement = "Legacy in Motion! UNION Auto Spares (Est. 1984) is officially going global. Explore our AI-powered platform for genuine spare parts: https://unionautospares.com";

  const broadcastNews = async () => {
    setIsSending(true);
    setSuccess(false);

    try {
      // Broadcast to our predefined list
      const contacts = ['+919446210740', '+919745892609', '+919422395375'];
      
      for (const contact of contacts) {
        await api.post('/notifications/send', {
          type: 'whatsapp',
          to: contact,
          message: announcement
        });
      }
      setSuccess(true);
    } catch (err) {
      console.error('Broadcast failed:', err);
      alert('Failed to send notifications. Ensure Twilio is configured.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Admin Overview</h1>
        <p className="text-zinc-500 mt-1">Manage operations and broadcast global announcements.</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <Megaphone className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Global Launch Broadcast</h2>
            <p className="text-sm text-zinc-500">Send the "Happy News" to Asokan Chettan, your partner, and team.</p>
          </div>
        </div>

        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100 font-mono text-sm text-zinc-700">
          {announcement}
        </div>

        <button 
          onClick={broadcastNews}
          disabled={isSending}
          className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
        >
          {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{success ? <CheckCircle2 className="w-5 h-5" /> : 'Send Broadcast'}</>}
        </button>
      </div>
    </div>
  );
}
