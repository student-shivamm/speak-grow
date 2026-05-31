import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Mic, Zap, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCreditStore } from "@/store/creditStore";
import { useAuthStore } from "@/store/authStore";
import logoImage from "@/assets/logo.png";

const navItems = [
  { label: "Practice", href: "/practice" },
  { label: "Progress", href: "/progress" },
  { label: "Find Clubs", href: "/find-clubs" },
  { label: "About", href: "/about" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { session, profile, signOut } = useAuthStore();
  const { credits: localCredits } = useCreditStore();
  
  const credits = profile ? profile.credits : localCredits;

  return (
    <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 relative z-20 h-full w-[160px] md:w-[200px]">
          <img src={logoImage} alt="SpeakGrow" className="absolute top-1/2 -translate-y-1/2 left-0 h-[90px] w-auto max-w-none pointer-events-none" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.href
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {/* Credits Badge */}
          <Link to="/upgrade" className="flex items-center gap-1.5 bg-accent/10 text-accent border border-accent/20 rounded-full px-3 py-1.5 text-sm font-semibold hover:bg-accent/20 transition-colors">
            <Zap className="h-3.5 w-3.5" />
            {credits} credit{credits !== 1 ? "s" : ""}
          </Link>
          <Link to="/practice">
            <Button variant="default" size="sm" className="gradient-brand shadow-brand gap-1.5">
              <Mic className="h-4 w-4" />
              Start Practicing
            </Button>
          </Link>
          {session ? (
            <Button variant="ghost" size="sm" onClick={signOut} className="gap-1.5">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          ) : (
            <Link to="/auth">
              <Button variant="outline" size="sm" className="gap-1.5">
                <User className="h-4 w-4" />
                Log In
              </Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-border bg-card overflow-hidden"
          >
            <div className="container px-4 py-3 flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.href
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-3 mt-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between w-full">
                  <Link to="/upgrade" className="flex items-center gap-1.5 bg-accent/10 text-accent border border-accent/20 rounded-full px-3 py-1.5 text-sm font-semibold">
                    <Zap className="h-3.5 w-3.5" />
                    {credits} credit{credits !== 1 ? "s" : ""}
                  </Link>
                  {session ? (
                    <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="gap-1.5">
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </Button>
                  ) : (
                    <Link to="/auth" onClick={() => setMobileOpen(false)}>
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <User className="h-4 w-4" />
                        Log In
                      </Button>
                    </Link>
                  )}
                </div>
                <Link to="/practice" onClick={() => setMobileOpen(false)} className="w-full">
                  <Button className="w-full gradient-brand gap-1.5" size="sm">
                    <Mic className="h-4 w-4" />
                    Start Practicing
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
