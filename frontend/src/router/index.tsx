import { createBrowserRouter } from "react-router-dom";
import MainLayout from "@/layouts/main-layout";
import MarketplacePage from "@/pages/marketplace-page";
import NFTDetailPage from "@/pages/nft-detail-page";
import CreateListingPage from "@/pages/create-listing-page";
import MyNFTsPage from "@/pages/my-nfts-page";
import MyListingNFT from "@/pages/my-listing-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,

    children: [
      {
        index: true,
        element: <MarketplacePage />,
      },

      {
        path: "detail/:type/:id",
        element: <NFTDetailPage />,
      },

      {
        path: "create",
        element: <CreateListingPage />,
      },

      {
        path: "my-nfts",
        element: <MyNFTsPage />,
      },

      {
        path: "my-listings",
        element: <MyListingNFT />,
      },
    ],
  },
]);
