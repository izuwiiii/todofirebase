import React, { useContext, useEffect, useState } from "react";
import { type ReactNode } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";

interface AuthContextType {
  curentUser: FirebaseUser | null;
  userLoggedIn: boolean;
  loading: boolean;
}

const AuthContext = React.createContext<AuthContextType>({
  curentUser: null,
  userLoggedIn: false,
  loading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [curentUser, setCurentUser] = useState<FirebaseUser | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, initializeUser);
    return unsubscribe;
  }, []);

  async function initializeUser(user: FirebaseUser | null) {
    if (user) {
      setCurentUser({ ...user });
      setUserLoggedIn(true);
    } else {
      setCurentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  }

  const value = { curentUser, userLoggedIn, loading };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
