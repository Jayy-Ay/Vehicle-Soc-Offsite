import React, { createContext, useContext, useMemo } from "react";

export type UserRole = "administrator" | "ml_engineer" | "analyst";

interface User {
  name: string;
  email: string;
  roles: UserRole[];
}

interface UserContextValue {
  user: User;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

const mockUser: User = {
  name: "Security Admin",
  email: "admin@soc.com",
  roles: ["administrator", "ml_engineer"],
};

const UserContext = createContext<UserContextValue | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo<UserContextValue>(() => {
    const hasRole = (roles: UserRole | UserRole[]) => {
      const list = Array.isArray(roles) ? roles : [roles];
      return list.some((role) => mockUser.roles.includes(role));
    };

    return {
      user: mockUser,
      hasRole,
    };
  }, []);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }

  return context;
}
