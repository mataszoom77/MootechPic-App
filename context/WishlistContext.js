import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

  const loadWishlist = async () => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) return;

    try {
      const response = await api.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(response.data);
    } catch (err) {
      if (__DEV__) {
        console.log("Failed to load wishlist", err);
      }
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const toggleWishlist = async (item) => {
    const token = await AsyncStorage.getItem("jwtToken");
    if (!token) return;

    const exists = wishlist.find(
      (w) => w.itemId === item.id && w.itemType === item.type
    );

    try {
      if (exists) {
        await api.delete(`/wishlist/${exists.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(
          "/wishlist",
          { itemId: item.id, itemType: item.type },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      // Always refresh to stay in sync
      await loadWishlist();
    } catch (err) {
      if (__DEV__) {
        console.log("Failed to toggle wishlist", err);
      }
    }

  };

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
