"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Search,
  Bell,
  Mail,
  User,
  Plus,
  LogOut,
  Sparkles,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import supabase from "@/lib/supabase";
import SearchBar from "@/components/searchBar/SearchBar";
import { messageService } from "@/services/supabase/message";
import { notificationService } from "@/services/supabase/notification";
import { ThemeToggle } from "./ThemeToggle";

export function Navbar() {
  return (
    <nav className="p-4 flex justify-between items-center">
      <div>Logo</div>
    </nav>
  );
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // IMPORTANT: Déclarez tous les hooks useState AVANT tout code conditionnel
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Ne pas afficher le header sur certaines pages
  const authPages = [
    "/auth/login",
    "/auth/register",
    "/auth/callback",
    "/profile/setup",
  ];
  const shouldDisplayHeader = !authPages.some((page) =>
    pathname?.startsWith(page)
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);

      if (session) {
        const { data } = await supabase
          .from("Profile")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (data) {
          setProfileId(data.id);
          setProfile(data);
        }
      }
      setIsAuthChecked(true);
    };

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (!session) {
        setProfileId(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!profileId) {
      setUnreadMessageCount(0);
      return;
    }

    const fetchUnreadMessageCount = async () => {
      try {
        const { count } = await messageService.getUnreadCount(profileId);
        setUnreadMessageCount(count);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des messages non lus:",
          error
        );
      }
    };

    fetchUnreadMessageCount();

    const subscription = supabase
      .channel("messages-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Messages",
          filter: `recipient_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadMessageCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Messages",
          filter: `recipient_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadMessageCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profileId]);

  // Récupérer le nombre de notifications non lues
  useEffect(() => {
    if (!profileId) {
      setUnreadNotificationCount(0);
      return;
    }
    const fetchUnreadNotificationCount = async () => {
      try {
        const { count } = await notificationService.getUnreadCount(profileId);
        setUnreadNotificationCount(count);
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des notifications non lues:",
          error
        );
      }
    };

    fetchUnreadNotificationCount();
    const subscription = supabase
      .channel("notifications-count")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Notifications",
          filter: `user_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadNotificationCount();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Notifications",
          filter: `user_id=eq.${profileId}`,
        },
        () => {
          fetchUnreadNotificationCount();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [profileId]);

  // Pages qui nécessitent une flèche de retour
  const pagesWithBackButton = ["/premium/success", "/premium/cancel"];

  // Retourner null après avoir déclaré tous les hooks si le header ne doit pas s'afficher
  if (!shouldDisplayHeader) {
    return null;
  }

  const menuItems = [
    { icon: Home, label: "Accueil", path: "/dashboard" },
    { icon: Search, label: "Explorer", path: "/explore" },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
      badge: unreadNotificationCount,
    },
    {
      icon: Mail,
      label: "Messages",
      path: "/messages",
      badge: unreadMessageCount,
    },
    { icon: User, label: "Profil", path: "/profile" },
    { icon: Sparkles, label: "Premium", path: "/premium" },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-800 flex-col z-50">
        {/* ...existing sidebar content... */}
        <div className="p-6">
          <Link href="/dashboard" className="flex items-center space-x-3">
            <Image
              src="/logo_Flow.png"
              alt="Flow Logo"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <h1 className="text-xl font-bold text-white">Flow</h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-colors relative ${
                pathname === item.path
                  ? "bg-red-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <item.icon className="w-6 h-6" />
              <span className="font-medium">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="notification-badge">
                  {item.badge > 99 ? "99+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-black/90 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-4 z-50">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo_Flow.png"
            alt="Flow Logo"
            width={32}
            height={32}
            className="rounded-lg"
          />
          <h1 className="text-lg font-bold text-white">Flow</h1>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="fixed top-16 left-0 right-0 bg-black border-b border-gray-800 py-4">
            <nav className="px-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl transition-colors relative ${
                    pathname === item.path
                      ? "bg-red-600 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="notification-badge">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-800 px-4 py-2 z-50">
        <div className="flex justify-around">
          {menuItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors relative ${
                pathname === item.path
                  ? "text-red-500"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 notification-badge text-xs min-w-[16px] h-4">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Header content for all screen sizes */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-colors duration-300">
        {/* Header avec logo, barre de recherche et bouton thème */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image
                src="/logo_Flow.png"
                alt="Flow Logo"
                width={120}
                height={40}
                priority
                className="object-contain"
              />
            </div>
            {/* Afficher le ThemeToggle uniquement en développement ou sur certaines pages */}
            {(process.env.NODE_ENV === "development" ||
              ["/dashboard", "/explore"].some((route) =>
                pathname.startsWith(route)
              )) && <ThemeToggle />}
          </div>

          {/* Barre de recherche */}
          <div className="w-full">
            <SearchBar />
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 p-4 space-y-2">
          <nav className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group relative ${
                    isActive
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="relative">
                    <item.icon className="w-6 h-6" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          {/* Bouton Ajouter un post */}
          <button
            onClick={() => router.push("/tweets")}
            className="mt-6 w-full bg-red-600 text-white py-3 px-4 rounded-full font-medium hover:bg-red-700 transition-colors duration-200"
          >
            <div className="flex items-center justify-center">
              <Plus className="mr-2" size={16} />
              <span>Ajouter un post</span>
            </div>
          </button>{" "}
          {/* User profile section */}
          {profile && (
            <div className="mt-6 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all duration-200 flex items-center justify-between group"
              >
                <div className="flex items-center">
                  {profile.profilePicture || profile.avatar_url ? (
                    <div className="w-10 h-10 rounded-full mr-3 overflow-hidden">
                      <Image
                        src={profile.profilePicture || profile.avatar_url}
                        alt={`${profile.nickname || profile.username}'s avatar`}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 bg-gray-500 rounded-full mr-3 flex items-center justify-center text-white">
                      <span className="text-sm font-medium">
                        {(profile.nickname || profile.username || "U")
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}{" "}
                  <div className="flex flex-col items-start">
                    <span className="font-bold text-black dark:text-white text-left">
                      {profile.nickname || profile.username || "Votre pseudo"}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400 text-left">
                      {profile.nickname || profile.username || "Votre pseudo"}
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
              </button>
              {/* Profile dropdown menu */}{" "}
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-black rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                  {/* Logout button */}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center px-4 py-3 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 text-left"
                  >
                    <LogOut className="mr-3" size={18} />
                    <span className="font-medium">
                      Se déconnecter de{" "}
                      {profile.nickname || profile.username || "votre compte"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>

        {/* Empty bottom space */}
        <div className="p-4"></div>
      </div>
    </>
  );
}
