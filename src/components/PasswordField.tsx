import { Eye, EyeOff, Lock } from 'lucide-react';
import { useState } from 'react';

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  required?: boolean;
};

export function PasswordField({ value, onChange, autoComplete = 'current-password', required = true }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex items-center rounded-xl border border-white/10 bg-zinc-950/80 px-3 transition-colors focus-within:border-cyan-400/40">
      <Lock className="mr-3 h-4 w-4 shrink-0 text-zinc-500" aria-hidden="true" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        type={visible ? 'text' : 'password'}
        required={required}
        autoComplete={autoComplete}
        className="min-w-0 flex-1 bg-transparent py-3.5 text-white outline-none placeholder:text-zinc-600"
        aria-label="Password"
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        className="ml-2 rounded-lg p-2 text-zinc-500 transition hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
        aria-label={visible ? 'Hide password' : 'Show password'}
        title={visible ? 'Hide password' : 'Show password'}
      >
        {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}
