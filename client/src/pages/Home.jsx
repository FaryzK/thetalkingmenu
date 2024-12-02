import React from "react";
import { Button } from "flowbite-react";
import { ArrowRight, Zap, Users, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";

export default function Home() {
  const handleScheduleDemoClick = () => {
    window.open("https://forms.gle/o2voWRF4q5njiYXV6", "_blank");
  };
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-50">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:pt-32">
          <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Transform
              </span>{" "}
              Your Restaurant with AI
            </h1>
            <p className="mt-10 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
              Empower your team, engage your customers, and stand out from
              competition with our cutting-edge AI.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Button
                onClick={handleScheduleDemoClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                Schedule a Demo <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-gray-800">
          <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center">
              Why Choose Our AI Solution?
            </h2>
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-12 w-12 text-indigo-500" />,
                  title: "Train Employees Faster",
                  description:
                    "Reduce training time with intuitive AI assistance.",
                },
                {
                  icon: <Users className="h-12 w-12 text-purple-500" />,
                  title: "Increase Customer Engagement",
                  description:
                    "Delight your customers with personalized recommendations.",
                },
                {
                  icon: <ChefHat className="h-12 w-12 text-blue-500" />,
                  title: "Unlock Customer Insights",
                  description:
                    "Gain visibility into customer questions to refine your menu and offerings.",
                },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4"
                >
                  {feature.icon}
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-gray-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Demo Section */}
        {/* <section id="demo" className="py-16">
          <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center">
              See The Talking Menu in Action
            </h2>
            <div className="mt-8 mx-auto max-w-3xl">
              <div className="aspect-video overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="The Talking Menu Demo"
                  allow="autoplay; encrypted-media; fullscreen"
                  className="w-full h-full"
                ></iframe>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      {/* Footer */}
      <footer className="py-6 bg-gray-900 text-gray-400 border-t border-gray-700">
        <div className="max-w-screen-lg mx-auto flex justify-between px-4 sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} The Talking Menu. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link to="/terms-of-use" className="hover:underline">
              Terms of Use
            </Link>
            <Link to="/privacy-policy" className="hover:underline">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
