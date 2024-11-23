import { Toaster } from "sonner";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster position="bottom-right" richColors /> {/* Enables Sonner toasts */}
      </body>
    </html>
  );
}
