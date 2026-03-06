import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Search, ExternalLink, Users, Globe, Map } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const clubTypes = [
  {
    name: "Toastmasters Clubs",
    description: "International organization focused on public speaking and leadership development",
    query: "Toastmasters club near me",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    name: "Public Speaking Groups",
    description: "Local speaking groups and communication workshops in your area",
    query: "public speaking club near me",
    icon: Globe,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    name: "Debate Clubs",
    description: "Improve argumentation and persuasion skills through debate practice",
    query: "debate club near me",
    icon: Map,
    color: "text-secondary",
    bg: "bg-secondary/10",
  },
];

const tips = [
  "Toastmasters has 16,000+ clubs in 145 countries",
  "Most clubs welcome guests for free at first meetings",
  "Practice clubs meet weekly or bi-weekly",
  "Club meetings typically last 1–2 hours",
];

const FindClubsPage = () => {
  const [loading, setLoading] = useState(false);
  const [locationGranted, setLocationGranted] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const requestLocation = () => {
    setLoading(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
        setLocationGranted(true);
        setLoading(false);
      },
      () => {
        setLocationError("Location access denied. Use the search buttons below to find clubs manually.");
        setLoading(false);
      }
    );
  };

  const openGoogleMaps = (query: string) => {
    if (userLocation) {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}/@${userLocation.lat},${userLocation.lng},13z`;
      window.open(url, "_blank");
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
      window.open(url, "_blank");
    }
  };

  const openToastmastersLocator = () => {
    window.open("https://www.toastmasters.org/find-a-club", "_blank");
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-accent/10 text-accent border border-accent/20 rounded-full px-4 py-1.5 text-sm font-medium mb-4"
          >
            <MapPin className="h-3.5 w-3.5" />
            Community Discovery
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-display font-bold mb-3"
          >
            Find Speaking Clubs Near You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto"
          >
            Connect with real people and practice in a supportive environment. Toastmasters and local speaking clubs are powerful complements to online practice.
          </motion.p>
        </div>

        {/* Location Request */}
        {!locationGranted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-6 shadow-card border border-border mb-8 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Navigation className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-lg font-display font-semibold mb-2">Share Your Location</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Allow location access to find speaking clubs closest to you, or search manually below.
            </p>
            {locationError && (
              <p className="text-xs text-warning bg-warning/10 rounded-lg px-3 py-2 mb-4">{locationError}</p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={requestLocation}
                disabled={loading}
                className="gradient-brand shadow-brand gap-2"
              >
                <Navigation className="h-4 w-4" />
                {loading ? "Getting Location..." : "Use My Location"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setLocationGranted(true)}
                className="gap-2"
              >
                <Search className="h-4 w-4" />
                Search Manually
              </Button>
            </div>
          </motion.div>
        )}

        {locationGranted && userLocation && (
          <div className="bg-success/10 border border-success/20 rounded-xl p-3 mb-6 flex items-center gap-2 text-sm text-success">
            <MapPin className="h-4 w-4 flex-shrink-0" />
            Location detected — showing clubs near you ({userLocation.lat.toFixed(3)}, {userLocation.lng.toFixed(3)})
          </div>
        )}

        {/* Club Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {clubTypes.map((club, i) => (
            <motion.div
              key={club.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="p-5 shadow-card h-full flex flex-col card-hover">
                <div className={`w-10 h-10 rounded-xl ${club.bg} flex items-center justify-center mb-4`}>
                  <club.icon className={`h-5 w-5 ${club.color}`} />
                </div>
                <h3 className="text-sm font-display font-semibold mb-2">{club.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed flex-1 mb-4">{club.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className={`gap-1.5 ${club.color} border-current/20 hover:bg-current/5`}
                  onClick={() => openGoogleMaps(club.query)}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open in Google Maps
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Toastmasters Official */}
        <Card className="p-6 shadow-card mb-8 bg-gradient-to-br from-primary/5 via-card to-secondary/5 border-primary/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <h3 className="font-display font-semibold mb-1">Toastmasters International</h3>
              <p className="text-sm text-muted-foreground">
                The world's leading organization dedicated to communication and leadership development. Find an official club near you.
              </p>
            </div>
            <Button onClick={openToastmastersLocator} className="gradient-brand shadow-brand gap-2 flex-shrink-0">
              <ExternalLink className="h-4 w-4" />
              Find a Club
            </Button>
          </div>
        </Card>

        {/* Tips */}
        <div>
          <h3 className="text-sm font-semibold mb-4">💡 Tips for Joining a Speaking Club</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 bg-muted/50 rounded-xl p-3">
                <div className="w-5 h-5 rounded-full gradient-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-primary-foreground text-xs font-bold">{i + 1}</span>
                </div>
                <p className="text-sm text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindClubsPage;
