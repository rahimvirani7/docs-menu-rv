import { useRef, useState, useEffect } from "react";
import DocumentMenu from "./DocumentMenu";
const _ = require("lodash");

const sampleDocuments = [
  {
    id: "a1b2c3",
    fileName: "Policy_2026_Q1.pdf",
    fileSize: "1.2 MB",
    dateModified: "2026-04-22",
    category: "Category_X",
  },
  {
    id: "d4e5f6",
    fileName: "Invoice_98765.pdf",
    fileSize: "450 KB",
    dateModified: "2026-03-15",
    category: "Category_Y",
  },
  {
    id: "g7h8i9",
    fileName: "Home_Sale_Contract.docx",
    fileSize: "320 KB",
    dateModified: "2026-02-01",
    category: "Category_Z",
  },
  {
    id: "j0k1l2",
    fileName: "Receipt_March.pdf",
    fileSize: "220 KB",
    dateModified: "2026-03-30",
    category: "Category_X",
  },
  {
    id: "m3n4o5",
    fileName: "Summary_Claims.pdf",
    fileSize: "2.4 MB",
    dateModified: "2026-01-18",
    category: "Category_Y",
  },
  {
    id: "p6q7r8",
    fileName: "Policy_Amendment.pdf",
    fileSize: "980 KB",
    dateModified: "2026-04-01",
    category: "Category_X",
  },
  {
    id: "s9t0u1",
    fileName: "Closing_Docs.zip",
    fileSize: "5.1 MB",
    dateModified: "2026-02-27",
    category: "Category_Z",
  },
  {
    id: "v2w3x4",
    fileName: "Statement_April.pdf",
    fileSize: "1.0 MB",
    dateModified: "2026-04-10",
    category: "Category_Y",
  },
  {
    id: "y5z6a7",
    fileName: "Inspection_Report.pdf",
    fileSize: "760 KB",
    dateModified: "2026-03-05",
    category: "Category_Z",
  },
  {
    id: "b8c9d0",
    fileName: "Proof_of_Ownership.jpg",
    fileSize: "420 KB",
    dateModified: "2026-01-08",
    category: "Category_X",
  },
];

export default function App() {
  return (
    <div className="m-12">
      <h1 className="font-extrabold text-center text-3xl p-4 bg-indigo-500 text-white rounded-2xl">
        React + Tailwind
      </h1>
      <DocumentMenu documents={sampleDocuments} />
    </div>
  );
}
