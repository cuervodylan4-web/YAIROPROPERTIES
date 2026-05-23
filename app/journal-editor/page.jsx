import { JournalEditorPage } from "../../src/YairoHero.jsx";

export const metadata = {
  title: "Journal Editor",
  description: "Internal journal publishing tool for Yairo Properties.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function JournalEditorRoute() {
  return <JournalEditorPage />;
}
