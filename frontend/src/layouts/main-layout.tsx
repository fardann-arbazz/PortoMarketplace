import { Outlet, useLocation } from "react-router-dom";
import Header from "@/layouts/header";

export default function MainLayout() {
  const location = useLocation();

  const currentPage = location.pathname;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header currentPage={currentPage} />

      <main>
        <Outlet />
      </main>

      <footer className="border-t mt-20 py-8 text-center text-xs text-muted-foreground">
        <p>NFT Bazaar — Simple NFT Marketplace</p>
      </footer>
    </div>
  );
}
