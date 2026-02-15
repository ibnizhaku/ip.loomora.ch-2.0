import { useState } from "react";
import { Shield, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { use2FASetup, use2FAVerify, use2FADisable } from "@/hooks/use-2fa";
import { toast } from "sonner";
import RecoveryCodesDialog from "./RecoveryCodesDialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEnabled?: boolean;
}

export default function TwoFactorSetupDialog({ open, onOpenChange, isEnabled }: Props) {
  const [step, setStep] = useState<"qr" | "verify" | "disable">(isEnabled ? "disable" : "qr");
  const [code, setCode] = useState("");
  const [qrData, setQrData] = useState<{ qrCode: string; secret: string } | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);
  const [copied, setCopied] = useState(false);

  const setupMutation = use2FASetup();
  const verifyMutation = use2FAVerify();
  const disableMutation = use2FADisable();

  const handleOpen = async (isOpen: boolean) => {
    if (isOpen && !isEnabled) {
      try {
        const data = await setupMutation.mutateAsync();
        setQrData({ qrCode: data.qrCode, secret: data.manualEntry });
        setStep("qr");
      } catch { /* handled by hook */ }
    }
    if (isOpen && isEnabled) {
      setStep("disable");
      setCode("");
    }
    if (!isOpen) {
      setCode("");
      setQrData(null);
      setRecoveryCodes(null);
      setCopied(false);
    }
    onOpenChange(isOpen);
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    try {
      const result = await verifyMutation.mutateAsync(code);
      setRecoveryCodes(result.recoveryCodes);
    } catch { /* handled */ }
  };

  const handleDisable = async () => {
    if (code.length !== 6) return;
    try {
      await disableMutation.mutateAsync(code);
      onOpenChange(false);
    } catch { /* handled */ }
  };

  const copySecret = () => {
    if (qrData?.secret) {
      navigator.clipboard.writeText(qrData.secret);
      setCopied(true);
      toast.success("Secret kopiert");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (recoveryCodes) {
    return (
      <RecoveryCodesDialog
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            setRecoveryCodes(null);
            onOpenChange(false);
          }
        }}
        codes={recoveryCodes}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            {isEnabled ? "2FA deaktivieren" : "Zwei-Faktor-Authentifizierung"}
          </DialogTitle>
          <DialogDescription>
            {isEnabled
              ? "Geben Sie Ihren aktuellen 2FA-Code ein, um die Zwei-Faktor-Authentifizierung zu deaktivieren."
              : step === "qr"
              ? "Scannen Sie den QR-Code mit Ihrer Authenticator-App (Google Authenticator, Authy etc.)."
              : "Geben Sie den 6-stelligen Code aus Ihrer Authenticator-App ein."}
          </DialogDescription>
        </DialogHeader>

        {step === "qr" && qrData && (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <img src={qrData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">
                Oder geben Sie den Code manuell ein:
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs font-mono bg-muted p-2.5 rounded-lg break-all text-center">
                  {qrData.secret}
                </code>
                <Button variant="outline" size="icon" className="shrink-0" onClick={copySecret}>
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button onClick={() => { setStep("verify"); setCode(""); }}>
                Weiter
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "verify" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP value={code} onChange={setCode} maxLength={6}>
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

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("qr")}>Zurück</Button>
              <Button onClick={handleVerify} disabled={code.length !== 6 || verifyMutation.isPending}>
                {verifyMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Aktivieren
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "disable" && (
          <div className="space-y-6">
            <div className="flex justify-center">
              <InputOTP value={code} onChange={setCode} maxLength={6}>
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

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button variant="destructive" onClick={handleDisable} disabled={code.length !== 6 || disableMutation.isPending}>
                {disableMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Deaktivieren
              </Button>
            </DialogFooter>
          </div>
        )}

        {setupMutation.isPending && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
