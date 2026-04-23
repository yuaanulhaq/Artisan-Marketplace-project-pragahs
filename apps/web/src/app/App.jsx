import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { useTranslation } from "react-i18next";

import "../lib/i18n";
import AppShell from "../components/AppShell";
import ProtectedRoute from "../components/ProtectedRoute";
import { isLanguageRTL } from "../lib/i18n";
import { AuthProvider } from "../store/AuthContext";
import AdminDashboardPage from "../pages/AdminDashboardPage";
import ArtisanDashboardPage from "../pages/ArtisanDashboardPage";
import CartPage from "../pages/CartPage";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import MarketplacePage from "../pages/MarketplacePage";
import OrdersPage from "../pages/OrdersPage";
import ProductDetailPage from "../pages/ProductDetailPage";
import SignupPage from "../pages/SignupPage";
import WishlistPage from "../pages/WishlistPage";

const AppFrame = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = isLanguageRTL(i18n.language) ? "rtl" : "ltr";
  }, [i18n.language]);

  return <AppShell />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppFrame />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "marketplace", element: <MarketplacePage /> },
      { path: "products/:productId", element: <ProductDetailPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "signup", element: <SignupPage /> },
      {
        path: "cart",
        element: (
          <ProtectedRoute roles={["buyer"]}>
            <CartPage />
          </ProtectedRoute>
        )
      },
      {
        path: "wishlist",
        element: (
          <ProtectedRoute roles={["buyer"]}>
            <WishlistPage />
          </ProtectedRoute>
        )
      },
      {
        path: "orders",
        element: (
          <ProtectedRoute roles={["buyer", "artisan", "admin"]}>
            <OrdersPage />
          </ProtectedRoute>
        )
      },
      {
        path: "artisan",
        element: (
          <ProtectedRoute roles={["artisan"]}>
            <ArtisanDashboardPage />
          </ProtectedRoute>
        )
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute roles={["admin"]}>
            <AdminDashboardPage />
          </ProtectedRoute>
        )
      }
    ]
  }
]);

const App = () => {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
};

export default App;

