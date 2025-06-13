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
  MoreHorizontal,
} from "lucide-react";
import supabase from "@/lib/supabase";
import SearchBar from "@/components/searchBar/SearchBar";
import { notificationService } from "@/services/supabase/notification";
import { ThemeToggle } from "./ThemeToggle";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [unreadMessageCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data: profileData } = await supabase
          .from("Profile")
          .select("*")
          .eq("user_id", session.user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };

    getProfile();
  }, []);

  useEffect(() => {
    const fetchUnreadNotificationCount = async () => {
      if (!profile?.id) return;

      try {
        const count = await notificationService.getUnreadCount(profile.id);
        setUnreadNotificationCount(count);
      } catch (err) {
        console.error("Error fetching notification count:", err);
      }
    };

    fetchUnreadNotificationCount();
  }, [profile?.id]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
    } catch (err) {
      console.error("Error signing out:", err);
    }
  };

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
      {/* Mobile Header - Responsive top bar */}
      <div className="xl:hidden fixed top-0 left-0 right-0 h-14 sm:h-16 bg-background/90 backdrop-blur-sm border-b border-border flex items-center justify-between px-3 sm:px-4 z-50 transition-all duration-300">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <Image
            src="/logo_Flow.png"
            alt="Flow Logo"
            width={28}
            height={28}
            className="sm:w-8 sm:h-8 rounded-lg"
          />
          <h1 className="text-base sm:text-lg font-bold text-foreground">
            Flow
          </h1>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme toggle for mobile */}
          <ThemeToggle />

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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
      </div>

      {/* Mobile Menu Overlay - Responsive */}
      {isMobileMenuOpen && (
        <div
          className="xl:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div className="fixed top-14 sm:top-16 left-0 right-0 bg-background border-b border-border py-3 sm:py-4 transition-all duration-300">
            {/* Search bar in mobile menu */}
            <div className="px-3 sm:px-4 mb-3 sm:mb-4">
              <SearchBar placeholder="Rechercher..." />
            </div>

            <nav className="px-3 sm:px-4 space-y-1 sm:space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 sm:space-x-4 px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors relative text-sm sm:text-base ${
                    pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="font-medium">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation - Responsive */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-sm border-t border-border px-2 sm:px-4 py-1 sm:py-2 z-50 transition-all duration-300">
        <div className="flex justify-around max-w-md mx-auto">
          {menuItems.slice(0, 5).map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`flex flex-col items-center space-y-0.5 sm:space-y-1 px-2 sm:px-3 py-1 sm:py-2 rounded-lg transition-colors relative ${
                pathname === item.path
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs hidden sm:block">{item.label}</span>
              {item.badge && item.badge > 0 && (
                <span className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 bg-red-500 text-white text-xs rounded-full min-w-[14px] h-[14px] sm:min-w-[16px] sm:h-4 flex items-center justify-center font-medium">
                  {item.badge > 9 ? "9+" : item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Desktop Sidebar - Hidden on mobile and tablet */}
      <div className="hidden xl:flex fixed top-0 left-0 h-full w-64 bg-white dark:bg-black border-r border-gray-200 dark:border-gray-800 z-50 flex-col transition-colors duration-300">
        {/* Header avec logo, barre de recherche et bouton thème */}
        <div className="p-3 lg:p-4 border-b border-gray-200 dark:border-gray-800 space-y-3 lg:space-y-4">
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
        <nav className="flex-1 p-3 lg:p-4 space-y-2">
          <div className="space-y-1 px-2 lg:px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 lg:space-x-3 px-2 lg:px-3 py-2 lg:py-3 rounded-lg transition-all duration-200 group relative text-sm lg:text-base ${
                    isActive
                      ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <div className="relative">
                    <item.icon className="w-5 h-5 lg:w-6 lg:h-6" />
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 lg:min-w-[18px] lg:h-[18px] flex items-center justify-center font-medium">
                        {item.badge > 99 ? "99+" : item.badge}
                      </span>
                    )}
                  </div>
                  <span className="font-medium truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Bouton Ajouter un post - Responsive */}
          <button
            onClick={() => router.push("/tweets")}
            className="mt-4 lg:mt-6 w-full bg-red-600 text-white py-2 lg:py-3 px-3 lg:px-4 rounded-full font-medium hover:bg-red-700 transition-colors duration-200 text-sm lg:text-base"
          >
            <div className="flex items-center justify-center">
              <Plus className="mr-1 lg:mr-2" size={14} />
              <span className="hidden sm:inline">Ajouter un post</span>
              <span className="sm:hidden">Post</span>
            </div>
          </button>

          {/* User profile section - Responsive */}
          {profile && (
            <div className="mt-4 lg:mt-6 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowProfileMenu(!showProfileMenu);
                }}
                className="w-full p-2 lg:p-3 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl transition-all duration-200 flex items-center justify-between group"
              >
                <div className="flex items-center min-w-0">
                  {profile.profilePicture || profile.avatar_url ? (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full mr-2 lg:mr-3 overflow-hidden flex-shrink-0">
                      <Image
                        src={profile.profilePicture || profile.avatar_url}
                        alt={`${profile.nickname || profile.username}'s avatar`}
                        width={40}
                        height={40}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-500 rounded-full mr-2 lg:mr-3 flex items-center justify-center text-white flex-shrink-0">
                      <span className="text-xs lg:text-sm font-medium">
                        {(profile.nickname || profile.username || "U")
                          .substring(0, 2)
                          .toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="font-bold text-black dark:text-white text-left text-sm lg:text-base truncate w-full">
                      {profile.nickname || profile.username || "Votre pseudo"}
                    </span>
                    <span className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 text-left truncate w-full">
                      @{(profile.nickname || profile.username || "votre_pseudo")
                        .toLowerCase()}
                    </span>
                  </div>
                </div>
                <MoreHorizontal className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0" />
              </button>

              {/* Profile dropdown menu - Responsive */}
              {showProfileMenu && (
                <div className="absolute bottom-full left-0 mb-2 w-full bg-white dark:bg-black rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                  {/* Logout button */}
                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center px-3 lg:px-4 py-3 lg:py-4 text-black dark:text-white hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-left text-sm lg:text-base group"
                  >
                    <LogOut className="mr-2 lg:mr-3 flex-shrink-0 group-hover:text-red-600 dark:group-hover:text-red-400" size={16} />
                    <span className="font-medium">Se déconnecter</span>
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
