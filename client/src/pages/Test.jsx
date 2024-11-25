import React from "react";
import ReactMarkdown from "react-markdown";

export default function Test() {
  const markdownExamples = [
    "This is a **bold** text, and this is an *italic* text.",
    "# This is a heading\n## This is a subheading",
    "1. First item\n2. Second item\n3. Third item",
    "- Item one\n- Item two\n- Item three",
    "Here is a paragraph with a [link](https://example.com).\n\n1. Ordered item\n- Unordered item\n\n**Bold Text** here.",
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">ReactMarkdown Test Page</h1>
      {markdownExamples.map((markdown, index) => (
        <div
          key={index}
          className="markdown p-4 border rounded mb-4 bg-gray-100 text-gray-900"
        >
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      ))}
    </div>
  );
}
