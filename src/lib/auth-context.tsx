"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Role } from "@/types";

interface AuthContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentRole: Role;
  setRole: (role: Role) => void;
  availableUsers: User[];
}

export const DEMO_USERS: User[] = [
  {
    id: "usr_admin_01",
    name: "Harsh Shrivas",
    email: "harsh.admin@metroflex.com",
    role: "ADMIN",
    phone: "+91 98765 43210",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    facilityId: "fac_metroflex_01",
  },
  {
    id: "usr_tech_01",
    name: "Alex Rivera (Lead Tech)",
    email: "alex.tech@metroflex.com",
    role: "TECHNICIAN",
    phone: "+1 (555) 014-9821",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    facilityId: "fac_metroflex_01",
  },
  {
    id: "usr_tech_02",
    name: "Sam Chen (Field Tech)",
    email: "sam.tech@metroflex.com",
    role: "TECHNICIAN",
    phone: "+1 (555) 018-7744",
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    facilityId: "fac_metroflex_01",
  },
  {
    id: "usr_staff_01",
    name: "Jordan Taylor (Floor Staff)",
    email: "staff@metroflex.com",
    role: "STAFF",
    phone: "+1 (555) 012-3490",
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    facilityId: "fac_metroflex_01",
  },
  {
    id: "usr_member_01",
    name: "Guest / Gym Member",
    email: "member@guest.com",
    role: "MEMBER",
    phone: "+1 (555) 011-0000",
    avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
    facilityId: "fac_metroflex_01",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState<User>(DEMO_USERS[0]);

  useEffect(() => {
    const savedUserId = localStorage.getItem("fitfix_active_user_id");
    if (savedUserId) {
      const found = DEMO_USERS.find((u) => u.id === savedUserId);
      if (found) setCurrentUserState(found);
    }
  }, []);

  const setCurrentUser = (user: User) => {
    setCurrentUserState(user);
    localStorage.setItem("fitfix_active_user_id", user.id);
  };

  const setRole = (role: Role) => {
    const userWithRole = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    setCurrentUser(userWithRole);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        currentRole: currentUser.role,
        setRole,
        availableUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
