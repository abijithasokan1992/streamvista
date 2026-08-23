import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../services/supabase";

const SERVICE_AMOUNT = 4999;
const SERVICE_NAME = "StreamVista Creator Content QC & Delivery Setup";

function loadRazorpay(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
    document.body.appendChild(script);
  });
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

export default function Bridge() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  if (loading) return <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading StreamVista…</div>;
  if (!user) return <Navigate to={`/login?next=/bridge`} replace />;

  const pay = async () => {
    setBusy(true);
    setMessage("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Your session expired. Please sign in again.");

      const idempotencyKey = `bridge-${user.uid}-${Date.now()}`;
      const response = await fetch("/api/payment/create-service-order", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({ service: "creator-content-qc" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not create payment order");

      await loadRazorpay();
      if (!window.Razorpay) throw new Error("Razorpay Checkout is unavailable");

      const checkout = new window.Razorpay({
        key: data.razorpay.keyId,
        amount: Math.round(Number(data.payment.amount) * 100),
        currency: data.payment.currency,
        name: "StreamVista",
        description: SERVICE_NAME,
        order_id: data.razorpay.orderId,
        prefill: { email: user.email || "" },
        theme: { color: "#ffffff" },
        handler: async (payment: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json" },
            body: JSON.stringify(payment),
          });
          const result = await verify.json();
          if (!verify.ok) throw new Error(result.error || "Payment verification failed");
          setMessage("Payment verified successfully. StreamVista will contact you for delivery intake.");
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      checkout.open();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Payment could not be started");
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        <button className="text-sm text-white/60 hover:text-white" onClick={() => navigate("/")}>← StreamVista</button>
        <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_.7fr]">
          <section>
            <p className="text-xs uppercase tracking-[0.3em] text-white/50">Crayons Bridge · Live Service</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-6xl">Creator Content QC & Delivery Setup</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/65">A paid StreamVista service for creators and studios who need their content checked, prepared and delivered into a professional distribution workflow.</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {['Content intake review','QC readiness check','Delivery setup'].map((item) => <div key={item} className="rounded-2xl border border-white/10 bg-white/[.03] p-5 text-sm text-white/75">✓ {item}</div>)}
            </div>
          </section>
          <aside className="rounded-3xl border border-white/10 bg-white/[.04] p-7 shadow-2xl">
            <p className="text-sm text-white/50">One-time service</p>
            <p className="mt-2 text-4xl font-semibold">₹{SERVICE_AMOUNT.toLocaleString("en-IN")}</p>
            <p className="mt-2 text-sm text-white/50">Inclusive of GST where applicable; final invoice issued by StreamVista.</p>
            <button disabled={busy} onClick={pay} className="mt-8 w-full rounded-xl bg-white px-5 py-4 font-semibold text-slate-950 disabled:opacity-50">{busy ? "Opening secure payment…" : "Pay securely with Razorpay"}</button>
            {message && <p className="mt-4 rounded-xl border border-white/10 p-4 text-sm text-white/70">{message}</p>}
            <p className="mt-5 text-xs leading-5 text-white/40">Secure checkout · Sign-in required · Payment is verified server-side before confirmation.</p>
          </aside>
        </div>
      </div>
    </main>
  );
}
