import { Sparkles } from "lucide-react";
import ReferMeClient from "./ReferMeClient";

export default function ReferMePage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="mb-10">
        <div className="badge badge-warning badge-soft gap-1.5 mb-4">
          <Sparkles size={11} /> Referral Kit
        </div>
        <h1 className="text-5xl font-black text-base-content mb-3">Refer Me</h1>
        <p className="text-base-content/50 text-base max-w-xl">
          Referring someone should be easy. Enter a job title or paste a JD to get an AI-customized pitch and key strengths - then copy and send.
        </p>
      </div>
      <ReferMeClient />
    </div>
  );
}
