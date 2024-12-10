import React from "react";

const TermsOfUse = () => {
  return (
    <div className="flex flex-col flex-1 bg-gray-900 text-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-8">Last Updated: 6 Dec 2024</p>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            1. Ownership and Responsibility
          </h2>
          <p className="mb-4">
            <strong>Ownership of Content:</strong> Restaurant owners retain
            ownership of all content they upload, including menu details and
            restaurant information. However, questions asked by diners are
            co-owned by the diners and the Talking Menu, while chatbot-generated
            responses are owned solely by the Talking Menu.
          </p>
          <p>
            <strong>Data Retention on Cancellation:</strong> If a restaurant
            owner stops using the service, their data (diners and restaurants)
            will be retained unless they request deletion via{" "}
            <a
              href="https://forms.gle/VukrYeTGEeWiJRYA8"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 underline"
            >
              this form
            </a>
            .
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">
            2. License and Usage Rights
          </h2>
          <p>
            <strong>License Grant:</strong> We provide non-exclusive access to
            the chatbot. We reserve the right to revoke access if necessary.
          </p>
          <p>
            <strong>Sublicensing:</strong> Restaurant owners may share or
            sublicense access to the chatbot if desired.
          </p>
        </section>

        <footer className="text-sm text-gray-400 mt-8">
          For questions or concerns, contact us via{" "}
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

export default TermsOfUse;
