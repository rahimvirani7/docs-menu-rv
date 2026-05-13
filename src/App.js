import DocumentMenu from "./DocumentMenu";
import { sampleDocuments } from "./mockData";


export default function App() {
  return (
    <div className="m-12">
      <h1 className="font-extrabold text-center text-3xl p-4 bg-indigo-500 text-white rounded-2xl">
        Docs Menu
      </h1>
      <DocumentMenu documents={sampleDocuments} />
    </div>
  );
}
