import React, { useState } from "react";
import {
  Share2,
  Heart,
  Bookmark,
  Copy,
  Plus,
  Mail,
  Phone,
} from "lucide-react";

// Import all our enhanced components
import { Button } from "../ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  MagneticCard,
  GlassCard,
  GradientCard,
  RevealCard,
  StackedCard,
} from "../ui/card";
import ScrollReveal from "../ui/scroll-reveal";
import {
  Skeleton,
  SkeletonCard,
  SkeletonText,
  SkeletonGroup,
} from "../ui/skeleton";
import Parallax, { ParallaxText } from "../ui/parallax";
import {
  ExpandableFloatingActionButton,
} from "../ui/floating-action-button";
import EnhancedInput, { EnhancedTextarea } from "../ui/enhanced-input";
// Flip animations - for future use
// import {
//   SharedElement,
//   LayoutAnimator,
//   GridItemAnimator,
// } from "../ui/flip-animation";
import { showToast } from "../ui/toast";

const UXShowcase: React.FC = () => {
  const [, setSelectedCard] = useState<number | null>(null);
  const [showSkeletons, setShowSkeletons] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  // Demo cards for future use
  // const demoCards = [
  //   {
  //     id: 1,
  //     title: "Interactive Card",
  //     description: "Hover to see lift effect",
  //   },
  //   {
  //     id: 2,
  //     title: "Magnetic Card",
  //     description: "Follow your mouse movement",
  //   },
  //   { id: 3, title: "Glass Card", description: "Beautiful glassmorphism" },
  //   { id: 4, title: "Gradient Card", description: "Animated gradient border" },
  // ];

  const handleCardClick = (id: number) => {
    setSelectedCard(id);
    showToast.success(`Selected card ${id}!`);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    showToast.copySuccess();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "UX Showcase",
        text: "Check out these amazing micro-interactions!",
        url: window.location.href,
      });
    } else {
      showToast.linkShared();
    }
  };

  const fabActions = [
    {
      icon: <Copy size={16} />,
      label: "Copy Link",
      onClick: handleCopyLink,
    },
    {
      icon: <Share2 size={16} />,
      label: "Share",
      onClick: handleShare,
    },
    {
      icon: <Heart size={16} />,
      label: "Like",
      onClick: () => showToast.success("Thanks for the love! ❤️"),
    },
    {
      icon: <Bookmark size={16} />,
      label: "Bookmark",
      onClick: () => showToast.success("Bookmarked!"),
    },
  ];

  return (
    <div className="min-h-screen space-y-16 p-8">
      {/* Hero Section with Parallax */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <Parallax speed={0.5} className="absolute inset-0">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 opacity-30" />
        </Parallax>

        <div className="relative z-10 text-center space-y-6">
          <ScrollReveal direction="up" duration={0.8}>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Advanced UX Showcase
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.2} duration={0.8}>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sophisticated micro-interactions, smooth animations, and
              delightful user experiences built with Framer Motion and modern
              web technologies.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.4} duration={0.8}>
            <div className="flex gap-4 justify-center">
              <Button
                variant="gradient"
                animation="bounce"
                onClick={() => showToast.success("Welcome to the showcase!")}
              >
                Explore Features
              </Button>
              <Button
                variant="outline"
                animation="magnetic"
                onClick={() => setShowSkeletons(!showSkeletons)}
              >
                Toggle Skeletons
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Button Showcase */}
      <ScrollReveal>
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">
            Enhanced Button Interactions
          </h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button animation="subtle">Subtle Animation</Button>
            <Button animation="bounce" variant="secondary">
              Bounce Effect
            </Button>
            <Button animation="magnetic" variant="outline">
              Magnetic Hover
            </Button>
            <Button animation="ripple" variant="gradient">
              Ripple Effect
            </Button>
            <Button animation="none" variant="ghost">
              No Animation
            </Button>
          </div>
        </section>
      </ScrollReveal>

      {/* Card Showcase */}
      <ScrollReveal direction="right">
        <section className="space-y-8">
          <h2 className="text-3xl font-bold text-center">Interactive Cards</h2>

          {/* Standard Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              variant="hover-lift"
              animation="fade-in"
              onClick={() => handleCardClick(1)}
            >
              <CardHeader>
                <CardTitle>Lift Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hover to see the smooth lift animation with enhanced shadow.
                </p>
              </CardContent>
            </Card>

            <MagneticCard onClick={() => handleCardClick(2)}>
              <CardHeader>
                <CardTitle>Magnetic</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Move your mouse around to see the magnetic effect.
                </p>
              </CardContent>
            </MagneticCard>

            <GlassCard onClick={() => handleCardClick(3)}>
              <CardHeader>
                <CardTitle>Glassmorphism</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Beautiful frosted glass effect with backdrop blur.
                </p>
              </CardContent>
            </GlassCard>

            <GradientCard
              gradientFrom="from-purple-500"
              gradientTo="to-pink-500"
              onClick={() => handleCardClick(4)}
            >
              <CardHeader>
                <CardTitle>Gradient Border</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Animated gradient border with scale interaction.
                </p>
              </CardContent>
            </GradientCard>
          </div>

          {/* Special Effect Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <RevealCard revealDirection="left">
              <CardHeader>
                <CardTitle>Reveal Animation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Scroll to see the reveal effect in action.
                </p>
              </CardContent>
            </RevealCard>

            <StackedCard stackCount={3}>
              <CardHeader>
                <CardTitle>Stacked Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Multiple layers creating depth and dimension.
                </p>
              </CardContent>
            </StackedCard>

            <Card variant="tilt" animation="scale-in">
              <CardHeader>
                <CardTitle>3D Tilt Effect</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  3D perspective transforms on hover.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </ScrollReveal>

      {/* Form Components */}
      <ScrollReveal direction="left">
        <section className="space-y-8 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center">
            Enhanced Form Interactions
          </h2>

          <Card variant="hover-glow" className="p-8">
            <div className="space-y-6">
              <EnhancedInput
                label="Full Name"
                variant="floating"
                icon={<span>👤</span>}
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                helperText="Enter your full name"
              />

              <EnhancedInput
                label="Email Address"
                type="email"
                variant="outlined"
                icon={<Mail size={16} />}
                value={formData.email}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
                required
              />

              <EnhancedInput
                label="Phone Number"
                type="tel"
                variant="underlined"
                icon={<Phone size={16} />}
                helperText="Optional: for urgent matters"
              />

              <EnhancedTextarea
                label="Message"
                variant="floating"
                rows={4}
                value={formData.message}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, message: e.target.value }))
                }
                helperText="Tell us about your project"
                required
              />

              <Button
                variant="gradient"
                animation="ripple"
                className="w-full"
                onClick={() =>
                  showToast.success("Form submitted successfully!")
                }
              >
                Send Message
              </Button>
            </div>
          </Card>
        </section>
      </ScrollReveal>

      {/* Skeleton Loading States */}
      {showSkeletons && (
        <ScrollReveal direction="up">
          <section className="space-y-8">
            <h2 className="text-3xl font-bold text-center">Loading States</h2>

            <SkeletonGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SkeletonCard />
              <div className="space-y-4">
                <Skeleton variant="wave" className="h-12 w-12 rounded-full" />
                <SkeletonText lines={4} />
                <Skeleton variant="shimmer" className="h-10 w-24" />
              </div>
              <div className="space-y-4">
                <Skeleton variant="glow" className="h-48 w-full" />
                <SkeletonText lines={2} />
              </div>
            </SkeletonGroup>
          </section>
        </ScrollReveal>
      )}

      {/* Parallax Text Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-muted/20">
        <ParallaxText speed={0.3} className="text-center">
          <h2 className="text-8xl font-bold opacity-10 select-none">
            PARALLAX
          </h2>
        </ParallaxText>

        <div className="relative z-10 text-center space-y-4">
          <ScrollReveal direction="scale" cascade>
            <h3 className="text-4xl font-bold">Smooth Parallax Effects</h3>
            <p className="text-muted-foreground text-lg">
              Background elements move at different speeds to create depth
            </p>
            <Button
              variant="outline"
              animation="magnetic"
              onClick={() =>
                showToast.info("Scroll to see more parallax effects!")
              }
            >
              Keep Scrolling
            </Button>
          </ScrollReveal>
        </div>
      </section>

      {/* Floating Action Button */}
      <ExpandableFloatingActionButton
        mainIcon={<Plus size={20} />}
        actions={fabActions}
        position="bottom-right"
      />
    </div>
  );
};

export default UXShowcase;
