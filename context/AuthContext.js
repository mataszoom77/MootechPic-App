// AuthContext.js
import React, { createContext, useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import api, { loginUser, refreshToken as apiRefreshToken } from "../api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  // For coordinating multi‐request token refresh
  const isRefreshing = useRef(false);
  const failedQueue = useRef([]);

  const processQueue = (error, token = null) => {
    failedQueue.current.forEach((p) => {
      if (error) p.reject(error);
      else p.resolve(token);
    });
    failedQueue.current = [];
  };

  // A ref so our axios interceptor can always see the latest tokens & helpers
  const contextRef = useRef({});
  contextRef.current = {
    userToken,
    refreshToken,
    logout,
    updateTokens: (newToken, newRt) => {
      setUserToken(newToken);
      setRefreshToken(newRt);
      const decoded = jwt_decode(newToken);
      setUserInfo(decoded);
      AsyncStorage.setItem("jwtToken", newToken);
      AsyncStorage.setItem("refreshToken", newRt);
      api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
    },
  };

  // 1️⃣ On mount, load tokens from storage
  useEffect(() => {
    (async () => {
      try {
        const jt = await AsyncStorage.getItem("jwtToken");
        const rt = await AsyncStorage.getItem("refreshToken");
        if (jt && rt) {
          setUserToken(jt);
          setRefreshToken(rt);
          setUserInfo(jwt_decode(jt));
          api.defaults.headers.common.Authorization = `Bearer ${jt}`;
        }
      } catch (err) {
        if (__DEV__) {
          console.log("Failed to load tokens", err);
        }
      }
      setLoading(false);
    })();
  }, []);

  // 2️⃣ Install axios interceptor for 401 → refresh
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (res) => res,
      async (err) => {
        const originalReq = err.config;
        if (
          err.response?.status === 401 &&
          !originalReq._retry &&
          !originalReq.url.endsWith("/Auth/login") &&
          !originalReq.url.endsWith("/Auth/refresh")
        ) {
          if (isRefreshing.current) {
            // queue up while we're already refreshing
            return new Promise((resolve, reject) => {
              failedQueue.current.push({ resolve, reject });
            }).then((token) => {
              originalReq.headers.Authorization = `Bearer ${token}`;
              return api(originalReq);
            });
          }

          originalReq._retry = true;
          isRefreshing.current = true;

          const {
            userToken: jt,
            refreshToken: rt,
            logout,
            updateTokens,
          } = contextRef.current;
          try {
            const { token: newToken, refreshToken: newRt } =
              await apiRefreshToken(jt, rt);

            updateTokens(newToken, newRt);

            processQueue(null, newToken);

            originalReq.headers.Authorization = `Bearer ${newToken}`;
            return api(originalReq);
          } catch (refreshErr) {
            processQueue(refreshErr, null);
            logout();
            return Promise.reject(refreshErr);
          } finally {
            isRefreshing.current = false;
          }
        }
        return Promise.reject(err);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // 3️⃣ login() now calls our loginUser helper, stores both tokens
  const login = async ({ email, password }) => {
    const {
      token: jt,
      refreshToken: rt,
      user,
    } = await loginUser(email, password);
    setUserToken(jt);
    setRefreshToken(rt);
    setUserInfo(user);
    await AsyncStorage.setItem("jwtToken", jt);
    await AsyncStorage.setItem("refreshToken", rt);
    api.defaults.headers.common.Authorization = `Bearer ${jt}`;
  };

  // 4️⃣ logout clears everything
  const logout = async () => {
    await AsyncStorage.removeItem("jwtToken");
    await AsyncStorage.removeItem("refreshToken");
    setUserToken(null);
    setRefreshToken(null);
    setUserInfo(null);
    delete api.defaults.headers.common.Authorization;
  };

  return (
    <AuthContext.Provider
      value={{ userToken, userInfo, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
