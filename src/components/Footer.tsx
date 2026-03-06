import { Link } from "react-router-dom";
import { Mic, Github, Twitter } from "lucide-react";
import logoImage from "@/assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src={logoImage} alt="SpeakBetter" className="h-9 w-auto mb-3" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              AI-powered public speaking practice platform. Improve clarity, confidence, and communication skills.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Product</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Practice Speaking", href: "/practice" },
                { label: "View Progress", href: "/progress" },
                { label: "Upgrade Credits", href: "/upgrade" },
                { label: "Find Clubs", href: "/find-clubs" },
              ].map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "/about" },
                { label: "Privacy Policy", href: "/privacy" },
                { label: "Contact", href: "/about#contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link to={item.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Get Started Free</h4>
            <p className="text-sm text-muted-foreground mb-4">
              You get 1 free speech credit. No account required.
            </p>
            <Link
              to="/practice"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg gradient-brand text-primary-foreground text-sm font-semibold shadow-brand hover:opacity-90 transition-opacity"
            >
              <Mic className="h-4 w-4" />
              Start for Free
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SpeakBetter. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for better communicators everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
