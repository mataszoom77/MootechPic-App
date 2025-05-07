import React from "react";
import AppNavigator from "./Navigation/AppNavigator";
import { AuthProvider } from "./context/AuthContext";
import { WishlistProvider } from "./context/WishlistContext";
import { CartProvider } from "./context/CartContext";

export default function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <CartProvider>
        <AppNavigator />
        </CartProvider>
      </WishlistProvider>
    </AuthProvider>
  );
}
