import GalleryGrid from "./GalleryGrid";

export default function GalleryPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Photos</p>
        <h1 className="text-3xl sm:text-5xl font-black text-base-content mb-3">Gallery</h1>
        <p className="text-base-content/50 max-w-xl text-base leading-relaxed">
          A glimpse beyond the resume - the events, places, and hobbies that make up life outside of code. Click any photo for the story behind it.
        </p>
      </div>

      <GalleryGrid />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-16">
        {[
          { emoji: "🏍️", label: "Quad Biker", desc: "Nothing beats adrenaline in the dirt" },
          { emoji: "🌿", label: "Nature Lover", desc: "Finding clarity outdoors, away from screens" },
          { emoji: "🎙️", label: "Community Speaker", desc: "Sharing knowledge builds stronger ecosystems" },
        ].map((fact) => (
          <div key={fact.label} className="card bg-base-100 border border-base-300 shadow-sm text-center">
            <div className="card-body p-6 gap-2">
              <span className="text-3xl">{fact.emoji}</span>
              <p className="font-semibold text-base-content text-sm">{fact.label}</p>
              <p className="text-base-content/50 text-xs">{fact.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
