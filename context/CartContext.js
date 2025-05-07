import React, { createContext, useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext({
  cartItems: [], // default value
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
});

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { userToken } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [cartId, setCartId] = useState(null);

  // Fetch cart on load
  useEffect(() => {
    const loadCart = async () => {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;
      if (!userToken) return; // Ensure user is authenticated

      try {
        const response = await api.get("/carts/my", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCartId(response.data.id);
        setCartItems(response.data.items || []);
      } catch (err) {
        if (__DEV__) {
          console.log("Failed to load cart", err);
        }
      }
    };

    loadCart();
  }, []);

  // Add item to cart
  const addToCart = async (item) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;

      const response = await api.post(
        "/cartitems/add",
        {
          itemId: item.id,
          itemType: item.type,
          quantity: item.quantity || 1,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCartItems(response.data.items || []);
    } catch (err) {
      if (__DEV__) {
        console.log("Add to cart failed", err);
      }
    }
  };
  const updateQuantity = (id, newQty) => {
    setCartItems((prev) =>
      prev.map((ci) =>
        ci.Id === id ? { ...ci, Quantity: Math.max(1, newQty) } : ci
      )
    );
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) return;

      const response = await api.delete(`/cartitems/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Assuming backend returns updated cart
      setCartItems(response.data.items || []);
    } catch (err) {
      if (__DEV__) {
        console.log("Remove from cart failed", err);
      }
      Alert.alert("Error", "Could not remove item from cart.");
    }
  };
  const clearCart = () => {
    cartItems.forEach((item) => {
      removeFromCart(item.id);
    });
    setCartItems([]);
  };

  const handleQtyChange = async (cartItemId, newQty) => {
    try {
      const token = await AsyncStorage.getItem("jwtToken");
      if (!token) throw new Error("Not authenticated");

      // Only send quantity in the body
      const { data: cartDto } = await api.put(
        `cartitems/${cartItemId}`,
        { quantity: newQty },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update your cart in context
      setCartItems(cartDto.items);
    } catch (err) {
      if (__DEV__) {
        console.error("Qty update failed:", err.response?.data ?? err);
      }
      Alert.alert("Error", "Could not update quantity.");
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        updateQuantity,
        handleQtyChange,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
