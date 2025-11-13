// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    "introduction",
    "getting_started",

    {
      type: "category",
      label: "📦 JavaScript/TypeScript SDK",
      collapsed: false,
      items: [
        "javascript/introduction",
        "javascript/installation",
        "javascript/authentication",
        "javascript/crud-operations",
        "javascript/query-builder",
        "javascript/relationships",
      ],
    },

    {
      type: "category",
      label: "🎯 Dart SDK",
      collapsed: false,
      items: [
        "dart/introduction",
        "dart/installation",
        "dart/getting-started",
        "dart/usage-examples",
        "dart/query-guide",
      ],
    },

    {
      type: "category",
      label: "🐹 Go SDK",
      collapsed: false,
      items: [
        "golang/introduction",
        "golang/installation",
        "golang/getting-started",
        "golang/client-configuration",
        "golang/authentication",
        "golang/document-operations",
        "golang/query-builder",
        "golang/realtime",
        "golang/storage",
        "golang/error-handling",
        "golang/api-reference",
        "golang/examples",
        "golang/best-practices",
      ],
    },

    {
      type: "category",
      label: "🌐 REST API Reference",
      collapsed: false,
      items: [
        "api/overview",
        "api/authentication",
        "api/collections",
        "api/auth-collections",
        "api/google-authentication",
        "api/error-handling",
      ],
    },

    {
      type: "category",
      label: "☁️ Cloud Functions",
      collapsed: false,
      items: [
        "cloud-functions/introduction",
        "cloud-functions/database-api",
        "cloud-functions/cloud-function-environment",
        "cloud-functions/quick-reference",
        "cloud-functions/intellisense-quickstart",
        "cloud-functions/intellisense-integration",
        "cloud-functions/examples",
      ],
    },

    {
      type: "category",
      label: "📘 Examples & Tutorials",
      collapsed: true,
      items: [
        "examples/sample-project",
        "examples/daily-journal",
        "examples/e-commerce",
      ],
    },
  ],
};

export default sidebars;
