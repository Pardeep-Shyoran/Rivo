import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Features.module.css";

const featuresList = [
  {
    icon: "🎵",
    color: "#4f46e5",
    title: "Music Streaming",
    description: "Stream your favorite songs and playlists instantly with high-quality audio.",
    details: "Experience crystal-clear sound with our advanced streaming technology supporting multiple formats."
  },
  {
    icon: "🔒",
    color: "#ff8615",
    title: "Secure Authentication",
    description: "Your data is protected with robust authentication and encryption.",
    details: "Industry-standard security protocols ensure your personal information stays safe and private."
  },
  {
    icon: "📧",
    color: "#3b82f6",
    title: "Real-time Notifications",
    description: "Stay updated with instant notifications for your favorite artists.",
    details: "Never miss new releases, playlist updates, or special events with our smart notification system."
  },
  {
    icon: "📝",
    color: "#22c55e",
    title: "Playlist Management",
    description: "Create, edit, and share playlists with unlimited customization.",
    details: "Build your perfect music collection and share it with friends and the community."
  },
  {
    icon: "⚡",
    color: "#e11d48",
    title: "Lightning Fast",
    description: "Enjoy a smooth and responsive experience with optimized performance.",
    details: "Built with modern technology for instant loading and seamless playback across all devices."
  },
  {
    icon: "🎨",
    color: "#8b5cf6",
    title: "Personalized Experience",
    description: "Discover music tailored to your taste with smart recommendations.",
    details: "Our AI-powered system learns your preferences to suggest tracks you'll love."
  },
];

const statsData = [
  { label: "Active Users", value: "10K+", icon: "👥" },
  { label: "Songs Available", value: "50K+", icon: "🎼" },
  { label: "Playlists Created", value: "25K+", icon: "📋" },
  { label: "Hours Streamed", value: "100K+", icon: "⏱️" },
];

const Features = () => {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    navigate("/register");
  };

  const handleLearnMore = () => {
    navigate("/login");
  };

  return (
    <div className={styles.featuresContainer}>
      {/* Hero Section */}
      <div className={`${styles.heroSection} ${isVisible ? styles.fadeIn : ""}`}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Welcome to <span className={styles.brandName}>Rivo</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Your Ultimate Music Streaming Platform
          </p>
          <p className={styles.heroDescription}>
            Experience music like never before with our cutting-edge platform designed
            for music lovers, artists, and creators.
          </p>
          <div className={styles.heroButtons}>
            <button className={styles.primaryButton} onClick={handleGetStarted}>
              <span className={styles.buttonIcon}>🚀</span>
              <span>Get Started Free</span>
            </button>
            <button className={styles.secondaryButton} onClick={handleLearnMore}>
              <span>Learn More</span>
              <span className={styles.buttonIcon}>→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {statsData.map((stat, idx) => (
            <div 
              key={idx} 
              className={styles.statCard}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className={styles.statIcon}>{stat.icon}</div>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className={styles.featuresSection}>
        <div className={styles.headerSection}>
          <h2 className={styles.sectionTitle}>Powerful Features</h2>
          <p className={styles.sectionSubtitle}>
            Everything you need for an amazing music experience
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {featuresList.map((feature, idx) => (
            <div
              key={idx}
              className={`${styles.featureCard} ${
                selectedFeature === idx ? styles.featureCardExpanded : ""
              }`}
              onClick={() => setSelectedFeature(selectedFeature === idx ? null : idx)}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div 
                className={styles.featureIconWrapper}
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <div 
                  className={styles.featureIcon} 
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>
              </div>
              <h3 className={styles.featureName}>{feature.title}</h3>
              <p className={styles.featureText}>{feature.description}</p>
              {selectedFeature === idx && (
                <div className={styles.featureDetails}>
                  <p className={styles.featureDetailsText}>{feature.details}</p>
                </div>
              )}
              <div className={styles.featureArrow}>
                {selectedFeature === idx ? "−" : "+"}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className={styles.ctaSection}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to Start Your Musical Journey?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of music lovers and discover your next favorite track today.
          </p>
          <button className={styles.ctaButton} onClick={handleGetStarted}>
            <span className={styles.ctaIcon}>🎵</span>
            <span className={styles.ctaText}>Get Started Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Features;