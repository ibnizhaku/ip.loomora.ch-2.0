import { useState, useEffect, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface AuthImageProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: ReactNode;
  /** Wenn true, wird ein iframe gerendert (fuer PDFs) */
  asPdf?: boolean;
}

/**
 * Laedt Dateien mit Authorization-Header und rendert sie als Blob-URL.
 * Noetig da <img> und <iframe> keinen Authorization-Header senden.
 */
export function AuthImage({ src, alt, className, fallback, asPdf = false }: AuthImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) return;
    let objectUrl: string | null = null;
    const token = localStorage.getItem("auth_token");

    fetch(src, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob);
        setBlobUrl(objectUrl);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [src]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px] w-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !blobUrl) {
    return fallback ? <>{fallback}</> : null;
  }

  if (asPdf) {
    return <iframe src={blobUrl} title={alt} className={className || "w-full h-full"} />;
  }

  return <img src={blobUrl} alt={alt} className={className} />;
}
