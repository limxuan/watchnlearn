"use client";
import React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

// Components
const FeatureCard = ({ icon, title, description }: any) => (
  <div className="space-y-4 rounded-lg bg-[#1E2638] p-6 transition-colors hover:bg-[#2C3545]">
    <div className="text-3xl text-cyan-400">{icon}</div>
    <h3 className="text-xl font-semibold text-white">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);

const Testimonial = ({ quote, name, role }: any) => (
  <div className="space-y-4 rounded-lg bg-[#1E2638] p-6">
    <p className="italic text-white">"{quote}"</p>
    <div>
      <h4 className="font-semibold text-white">{name}</h4>
      <p className="text-sm text-gray-400">{role}</p>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-[#0F1521] py-12 text-white">
    <div className="container mx-auto grid grid-cols-1 gap-8 px-4 md:grid-cols-4">
      <div>
        <div className="mb-4 flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 font-bold">
            W
          </div>
          <span className="text-xl font-semibold">watchlearn</span>
        </div>
        <p className="text-gray-300">
          The ultimate visual learning platform designed to enhance
          understanding and retention through visual engagement.
        </p>
      </div>
      <div>
        <h4 className="mb-4 font-semibold">Features</h4>
        <ul className="space-y-2 text-gray-400">
          <li>Badges & Streaks</li>
          <li>Image Zoom</li>
          <li>Gamification</li>
        </ul>
      </div>
      <div>
        <h4 className="mb-4 font-semibold">Question Types</h4>
        <ul className="space-y-2 text-gray-400">
          <li>Label to Hotspot</li>
          <li>Image MCQ</li>
          <li>Video Questions</li>
        </ul>
      </div>
      <div>
        <h4 className="mb-4 font-semibold">Company</h4>
        <ul className="space-y-2 text-gray-400">
          <li>About Us</li>
          <li>Contact</li>
          <li>Privacy Policy</li>
          <li>Terms of Service</li>
        </ul>
      </div>
    </div>
    <div className="container mx-auto mt-8 border-t border-gray-800 px-4 pt-6 text-center">
      <p className="text-gray-400">© 2025 watchlearn. All rights reserved.</p>
    </div>
  </footer>
);

const UniqueQuestionTypesSection = () => {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const questionTypes = [
    {
      icon: "🎯",
      title: "Label to Hotspot",
      description:
        "Match labels to specific hotspots in an image, perfect for anatomy, geography, and technical diagrams.",
      image: "/label-hotspot.png",
    },
    {
      icon: "🔄",
      title: "Picture to Picture Matching",
      description:
        "Match related images together to demonstrate understanding of connections and relationships.",
      image: "/picture-matching.png",
    },
    {
      icon: "🖼️",
      title: "Image MCQ",
      description:
        "Select the correct image from multiple options in response to a text question.",
      image: "/image-mcq.png",
    },
    {
      icon: "🎬",
      title: "Video Questions",
      description:
        "Answer questions based on video content with integrated playback controls.",
      image: "/video-mcq.png",
    },
    {
      icon: "📍",
      title: "Hotspot MCQ",
      description:
        "Select the correct area directly on an image to demonstrate spatial understanding.",
      image: "/hotspot-mcq.png",
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === questionTypes.length - 1 ? 0 : prev + 1,
    );
  };

  const prevSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? questionTypes.length - 1 : prev - 1,
    );
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-4xl font-bold">
          Unique <span className="text-cyan-400">Question Types</span>
        </h2>
        <p className="mx-auto mt-4 max-w-3xl text-gray-300">
          Our platform features innovative question formats specifically
          designed for visual learners to engage with content in meaningful
          ways.
        </p>
      </div>

      <div className="relative">
        {questionTypes.map((type, index) => (
          <div
            key={index}
            className={`transition-all duration-300 ${index === currentSlide ? "block" : "hidden"}`}
          >
            <div className="grid items-center gap-8 overflow-hidden rounded-xl bg-[#1A2132] p-8 md:grid-cols-2">
              <div className="space-y-4">
                <div className="text-2xl text-cyan-400">{type.icon}</div>
                <h3 className="text-2xl font-semibold text-white">
                  {type.title}
                </h3>
                <p className="text-gray-400">{type.description}</p>
                <div className="mt-6 flex items-center space-x-2">
                  <button
                    onClick={prevSlide}
                    className="rounded-full bg-[#131825] p-2 transition-colors hover:bg-[#0F1521]"
                  >
                    <ChevronLeft className="h-5 w-5 text-white" />
                  </button>
                  <span className="text-gray-400">
                    {index + 1} / {questionTypes.length}
                  </span>
                  <button
                    onClick={nextSlide}
                    className="rounded-full bg-[#131825] p-2 transition-colors hover:bg-[#0F1521]"
                  >
                    <ChevronRight className="h-5 w-5 text-white" />
                  </button>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg">
                <Image
                  src={type.image}
                  alt={type.title}
                  width={600}
                  height={350}
                  className="h-auto w-full object-cover"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-[#0F1521] text-white">
      {/* Hero Section */}
      <div className="container mx-auto grid items-center gap-12 px-10 pb-16 pt-20 md:grid-cols-2">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold">
            Learn Better with{" "}
            <span className="text-cyan-400">Visual Engagement</span>
          </h1>
          <p className="text-xl text-gray-300">
            Designed specifically for visual learners, our platform offers
            unique interactive question types and features to enhance
            understanding and retention.
          </p>
          <div className="flex space-x-4">
            <button
              className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-black transition-colors hover:bg-cyan-400"
              onClick={() => router.push("/sign-up")}
            >
              Try us out!
            </button>
            <button
              className="rounded-lg border border-white px-6 py-3 transition-colors hover:bg-white/10"
              onClick={() => router.push("/sign-in")}
            >
              Sign In
            </button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 rounded-xl bg-cyan-500/20 blur-2xl"></div>
          <div className="relative z-10 overflow-hidden rounded-xl shadow-2xl">
            <Image
              src="/video-mcq.png"
              alt="Learning Platform Interface"
              width={600}
              height={400}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          Features Designed for{" "}
          <span className="text-cyan-400">Visual Learners</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon="🏆"
            title="Badges & Streaks"
            description="Earn badges for completing challenges and maintain streaks to track your consistent learning progress."
          />
          <FeatureCard
            icon="🔍"
            title="Image Zoom Functionality"
            description="Examine images in detail with our powerful zoom tools, perfect for studying complex visuals."
          />
          <FeatureCard
            icon="📊"
            title="Personalized Learning"
            description="Our platform adapts to your learning style and pace, ensuring maximum retention and understanding."
          />
          <FeatureCard
            icon="🎮"
            title="Gamified Experience"
            description="Learn while having fun with gamification elements that keep you motivated and engaged."
          />
          <FeatureCard
            icon="👁️"
            title="Visual Focused"
            description="Built specifically for visual learners with imagery and graphics at the core of the learning experience."
          />
          <FeatureCard
            icon="📈"
            title="Progress Tracking"
            description="Monitor your improvement over time with detailed analytics and progress visualizations."
          />
        </div>
      </div>

      {/* Unique Question Types Section */}
      <UniqueQuestionTypesSection />

      {/* Testimonials Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="mb-12 text-center text-4xl font-bold">
          What Our <span className="text-cyan-400">Users Say</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Testimonial
            quote="As a visual learner, this platform has completely changed how I study. The image zoom feature is incredibly helpful for detailed diagrams."
            name="Alex Johnson"
            role="Biology Student"
          />
          <Testimonial
            quote="The picture matching and hotspot questions make learning anatomy so much more intuitive. I've improved my test scores significantly."
            name="Sarah Chen"
            role="Medical Student"
          />
          <Testimonial
            quote="The gamification elements keep my students engaged while the visual focus helps with retention. A perfect tool for my classroom."
            name="Dr. Michael Rodriguez"
            role="High School Teacher"
          />
        </div>
      </div>

      {/* Call to Action */}
      <div className="container mx-auto px-4 py-16">
        <div className="rounded-xl bg-gradient-to-r from-cyan-600/20 to-blue-600/20 p-12 text-center">
          <h2 className="mb-6 text-4xl font-bold">
            Ready to Transform Your Learning Experience?
          </h2>
          <p className="mb-8 text-xl text-gray-300">
            Join thousands of visual learners who have improved their
            understanding and retention with our unique approach.
          </p>
          <div className="flex justify-center space-x-4">
            <button
              className="rounded-lg bg-cyan-500 px-8 py-4 font-semibold text-black transition-colors hover:bg-cyan-400"
              onClick={() => router.push("/sign-in")}
            >
              Get Started Free
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
