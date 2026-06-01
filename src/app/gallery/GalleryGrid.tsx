"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";

type Photo = {
  src: string;
  alt: string;
  caption: string;
  category: string;
  context: string;
  spanRow?: boolean;
};

const photos: Photo[] = [
  {
    src: "/sam-pictures/hero-professional.JPEG",
    alt: "Professional headshot",
    caption: "Ready for whatever's next",
    category: "Professional",
    context: "This was taken during a professional shoot I did when I was preparing to take my career to the next level. I wanted a photo that felt confident but approachable - the kind of energy I try to bring into every room. Building AI systems that actually work in production takes the same combination of precision and calm.",
    spanRow: true,
  },
  {
    src: "/sam-pictures/outdoor-smile.jpeg",
    alt: "Outdoors",
    caption: "Outside time",
    category: "Life",
    context: "I spend a lot of time in front of screens - code, dashboards, terminals. So when I get outside, I'm fully outside. This is me on a day off in Kilimani, Nairobi, just existing outside the context of work. Balance is underrated in tech.",
  },
  {
    src: "/sam-pictures/nature.jpg",
    alt: "Nature",
    caption: "Finding calm in nature",
    category: "Life",
    context: "This was taken on a team building trip to Kimende, Kenya. We went zip lining, explored the terrain, and did a bunch of other activities out in nature. It was a good reminder that some of the best team moments happen far away from any screen.",
  },
  {
    src: "/sam-pictures/hobby-quadbiking.jpeg",
    alt: "Quad biking",
    caption: "Quad biking - one of my favourite things",
    category: "Hobbies",
    context: "Quad biking is pure adrenaline and I love it. There's no overthinking on a quad bike - you're just responding to the terrain in real time. In a way it's similar to being on-call for a production AI system, but way more fun.",
  },
];

export default function GalleryGrid() {
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 auto-rows-[200px]">
        {photos.map((photo, i) => (
          <div
            key={i}
            onClick={() => setSelected(photo)}
            className={`relative rounded-xl overflow-hidden bg-base-200 border border-base-300 group cursor-pointer ${
              photo.spanRow ? "row-span-2" : ""
            }`}
          >
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <p className="text-white text-xs font-semibold">{photo.caption}</p>
              <span className="text-white/60 text-[10px]">{photo.category}</span>
            </div>
          </div>
        ))}
      </div>

      {/* DaisyUI Modal */}
      {selected && (
        <div className="modal modal-open">
          <div className="modal-box max-w-5xl p-0 overflow-hidden flex flex-col md:flex-row" style={{ maxHeight: "90vh" }}>
            {/* Full image - no crop */}
            <div className="md:w-3/5 flex-shrink-0 bg-neutral flex items-center justify-center max-h-[45vh] md:max-h-none">
              <Image
                src={selected.src}
                alt={selected.alt}
                width={900}
                height={900}
                className="w-full h-auto object-contain max-h-[45vh] md:max-h-none"
              />
            </div>
            {/* Content */}
            <div className="md:w-2/5 p-5 md:p-8 flex flex-col justify-center bg-base-100 overflow-y-auto">
              <span className="badge badge-primary badge-soft badge-sm mb-3">{selected.category}</span>
              <h3 className="text-xl font-bold text-base-content mb-4 leading-snug">{selected.caption}</h3>
              <p className="text-base-content/60 text-sm leading-relaxed">{selected.context}</p>
              <button onClick={() => setSelected(null)} className="btn btn-ghost btn-sm mt-6 self-start gap-2">
                <X size={14} /> Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setSelected(null)} />
        </div>
      )}
    </>
  );
}
