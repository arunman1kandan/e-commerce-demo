import { Toaster } from "sonner";

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Toaster position="bottom-right" />
        {children}
      </body>
    </html>
  );
}
