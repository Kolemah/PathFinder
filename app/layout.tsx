import Sidebar from "./components/Sidebar";
import AppShell from "./components/AppShell";
import AuthGuard from "./components/AuthGuard";
import { AppProvider } from "./context/AppContext";
import "./globals.css";

export const metadata = {
  title: "PathFinder",
  description: "PathFinder Fintech Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="app-body">
        <AppProvider>
          <AuthGuard>
            <Sidebar />
            <AppShell>{children}</AppShell>
          </AuthGuard>
        </AppProvider>
      </body>
    </html>
  );
}