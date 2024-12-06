import React from "react";
import { Button } from "flowbite-react";
import { ArrowRight, Zap, Users, ChefHat } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const handleScheduleDemoClick = () => {
    window.open("https://forms.gle/o2voWRF4q5njiYXV6", "_blank");
  };

  const fadeIn = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };

  return (
    <div className="flex flex-col flex-1 bg-gray-900 text-gray-50">
      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          className="py-16 md:pt-32"
          initial="hidden"
          animate="visible"
          variants={fadeIn}
        >
          <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Transform
              </span>{" "}
              Your Restaurant with AI
            </h1>
            <p className="mt-10 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
              Empower your team, engage customers, and stand out from
              competition with our easily customizable chatbot—no technical
              skills required.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4">
              <Button
                onClick={handleScheduleDemoClick}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white"
              >
                Join the Waitlist <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <p className="text-gray-400 text-sm">No credit card required</p>
            </div>
          </div>
        </motion.section>
        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          className="py-16 bg-gray-200"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0 }}
          variants={staggerContainer}
        >
          <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              How It Works
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-indigo-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v7m0 0l3.5-3.5M12 11.5l-3.5-3.5M5 15.5h14m-7 0v5.5"
                      />
                    </svg>
                  ),
                  title: "Teach the Menu",
                  description:
                    "Upload your menu, including dishes, ingredients, and prices. Any updates are reflected in real time, so your chatbot always stays current.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-purple-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12l2-2m0 0l2-2m-2 2l2 2m-2-2H3m13 5.5h5.5m-5.5 0v5.5m0-5.5l3.5-3.5M6 9.5v.01"
                      />
                    </svg>
                  ),
                  title: "Upload Restaurant Info",
                  description:
                    "Add articles, origin stories, opening hours, and promotions. Let the chatbot reflect your restaurant's personality and unique offerings.",
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-12 w-12 text-blue-500 mx-auto"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 17l2.293-2.293a1 1 0 00.207-.293H5m0 0l2.293 2.293m9.414 0H5m11 0V7m0 10l-2.293-2.293M7 15V9"
                      />
                    </svg>
                  ),
                  title: "Set Instructions",
                  description:
                    "Guide how the chatbot interacts with customers. Tailor its behavior to suit your brand's voice and customer experience goals.",
                },
              ].map((step, index) => (
                <motion.div
                  key={index}
                  className="p-6 bg-white rounded-lg shadow-md flex flex-col items-center text-center space-y-4 hover:shadow-lg transition"
                  variants={fadeIn}
                >
                  {step.icon}
                  <h3 className="text-xl font-bold text-gray-900">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/*Benefits Section*/}
        <motion.section
          id="key-highlights"
          className="py-16 bg-gray-800"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={staggerContainer}
        >
          <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-50 mb-12">
              Why Choose Our AI Solution?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-12 w-12 text-indigo-500" />,
                  title: "Train Employees Faster",
                  description:
                    "Empower your team with instant answers to menu or promotion questions. Quickly onboard new employees, reducing the impact of turnover.",
                },
                {
                  icon: <Users className="h-12 w-12 text-purple-500" />,
                  title: "Boost Customer Engagement",
                  description:
                    "Delight customers with a virtual assistant that answers questions and recommends dishes, even during peak hours.",
                },
                {
                  icon: <ChefHat className="h-12 w-12 text-blue-500" />,
                  title: "Gain Actionable Insights",
                  description:
                    "Capture customer preferences, refine your menu, and focus on key demographics for better ROI.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="flex flex-col items-center text-center space-y-4"
                  variants={fadeIn}
                >
                  {item.icon}
                  <h3 className="text-xl font-bold text-gray-50">
                    {item.title}
                  </h3>
                  <p className="text-gray-300">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Demo Section */}
        <motion.section
          className="py-16 bg-gray-900 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold text-gray-100 mb-8">
            Watch Our Demo
          </h2>

          <div className="flex flex-col lg:flex-row justify-center items-center gap-8">
            {/* Chat Bot Interface */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-200 mb-4">
                Chat Bot Interface
              </h3>
              <iframe
                width="200"
                height="300"
                src="https://www.youtube.com/embed/2M_-O2DhqaE"
                title="Chat Bot Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="shadow-xl rounded-lg"
              ></iframe>
            </div>

            {/* Admin Dashboard */}
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-bold text-gray-200 mb-4">
                Admin Dashboard
              </h3>
              <iframe
                width="200"
                height="300"
                src="https://www.youtube.com/embed/4_4OcN6OlEE"
                title="Admin Dashboard Demo"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="shadow-xl rounded-lg"
              ></iframe>
            </div>
          </div>
        </motion.section>
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
