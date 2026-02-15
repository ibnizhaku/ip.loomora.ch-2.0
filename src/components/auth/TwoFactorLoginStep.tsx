import { useState } from "react";
import { Shield, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { use2FAAuthenticate } from "@/hooks/use-2fa";

interface Props {
  tempToken: string;
  onSuccess: (data: any) => void;
  onBack: () => void;
}

export default function TwoFactorLoginStep({ tempToken, onSuccess, onBack }: Props) {
  const [code, setCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const authenticateMutation = use2FAAuthenticate();

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (code.length < 6) return;

    try {
      const result = await authenticateMutation.mutateAsync({ tempToken, code });
      onSuccess(result);
    } catch { /* handled by hook */ }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-[2rem] font-bold tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>
            2FA Verifizierung
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            {useRecovery
              ? "Geben Sie einen Ihrer Recovery Codes ein."
              : "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein."}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Shield className="h-8 w-8 text-primary" />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {useRecovery ? (
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="XXXX-XXXX"
            className="w-full h-12 text-center font-mono text-lg tracking-widest rounded-xl border border-border/60 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-[#4610A3]"
            autoFocus
          />
        ) : (
          <div className="flex justify-center">
            <InputOTP
              value={code}
              onChange={(val) => {
                setCode(val);
                if (val.length === 6) {
                  // Auto-submit
                  setTimeout(() => {
                    authenticateMutation.mutate(
                      { tempToken, code: val },
                      { onSuccess: (data) => onSuccess(data) }
                    );
                  }, 100);
                }
              }}
              maxLength={6}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 gap-2 font-semibold rounded-xl text-sm bg-[#4610A3] hover:bg-[#370d82] text-white shadow-lg shadow-[#4610A3]/25"
          disabled={code.length < 6 || authenticateMutation.isPending}
        >
          {authenticateMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Prüfung...
            </span>
          ) : (
            "Verifizieren"
          )}
        </Button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={() => { setUseRecovery(!useRecovery); setCode(""); }}
          className="text-xs text-muted-foreground hover:text-[#4610A3] transition-colors"
        >
          {useRecovery ? "Code aus Authenticator-App verwenden" : "Recovery Code verwenden"}
        </button>
      </div>
    </div>
  );
}
