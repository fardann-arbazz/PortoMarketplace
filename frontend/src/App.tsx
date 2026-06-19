import { TooltipProvider } from "./components/ui/tooltip";
import { useWatchNFTSold } from "./hooks/marketplace/use-watch-nft-sold";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

export default function App() {
  useWatchNFTSold();

  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  );
}
