import React from "react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: [Date]</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">1. Data Collection</h2>
          <p className="mb-4">
            <strong>Types of Data Collected:</strong> We collect restaurant data
            (menu details, restaurant name, location), user data (name and email
            of restaurant owners and staff), chatbot interactions (questions
            asked by diners and chatbot responses), and diner data (names and
            emails if logged in).
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            2. Purpose of Data Collection
          </h2>
          <p className="mb-4">
            <strong>Usage:</strong> Data is used to train the chatbot and
            improve recommendations.
          </p>
          <p>
            <strong>Third-Party Sharing:</strong> We do not share data with
            third parties except for services we use (e.g., OpenAI for chatbot
            responses, MongoDB for storage).
          </p>
        </section>

        <footer className="text-sm text-gray-400 mt-8">
          For questions or requests, contact us via{" "}
          <a
            href="https://forms.gle/VukrYeTGEeWiJRYA8"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 underline"
          >
            this form
          </a>
          .
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
