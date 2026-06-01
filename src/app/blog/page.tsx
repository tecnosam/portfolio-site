"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Calendar, Bot } from "lucide-react";
import { blogPosts } from "@/lib/blog-posts";

export default function BlogPage() {
  const [showAI, setShowAI] = useState(true);

  const sorted = [...blogPosts].sort((a, b) => {
    if (a.aiGenerated === b.aiGenerated) return 0;
    return a.aiGenerated ? 1 : -1;
  });

  const visible = sorted.filter((p) => showAI || !p.aiGenerated);
  const featured = visible.filter((p) => p.featured);
  const rest = visible.filter((p) => !p.featured);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
      <div className="mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">Writing</p>
        <h1 className="text-3xl sm:text-5xl font-black text-base-content mb-3">Blog</h1>
        <p className="text-base-content/50 max-w-xl text-base leading-relaxed">
          Production AI systems, backend engineering at scale, and hard lessons from shipping ML infrastructure that actually works.
        </p>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-10">
        <span className="text-xs text-base-content/40 font-medium uppercase tracking-wider">Filter</span>
        <button
          onClick={() => setShowAI((v) => !v)}
          className={`flex items-center gap-1.5 badge badge-sm cursor-pointer transition-all ${
            showAI
              ? "badge-primary badge-soft"
              : "badge-ghost border border-base-300 text-base-content/40"
          }`}
        >
          <Bot size={10} />
          AI Generated
        </button>
      </div>

      {visible.length === 0 && (
        <div className="text-center py-20 text-base-content/30 text-sm">
          No posts match the current filter.
        </div>
      )}

      {/* Featured */}
      {featured.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-5">Featured</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featured.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card bg-base-100 border border-base-300 shadow-sm card-lift group"
              >
                <div className="card-body p-6">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {post.tags.map((tag) => (
                      <span key={tag} className="badge badge-primary badge-soft badge-sm">{tag}</span>
                    ))}
                    {post.aiGenerated && (
                      <span className="badge badge-ghost border border-base-300 badge-sm flex items-center gap-1 text-base-content/40">
                        <Bot size={9} /> AI Generated
                      </span>
                    )}
                  </div>
                  <h2 className="card-title text-base font-bold text-base-content group-hover:text-primary transition-colors leading-snug">
                    {post.title}
                  </h2>
                  <p className="text-base-content/50 text-xs leading-relaxed mt-1">{post.excerpt}</p>
                  <div className="card-actions items-center justify-between mt-4">
                    <div className="flex gap-3 text-base-content/40 text-xs">
                      <span className="flex items-center gap-1"><Calendar size={11} />{post.date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} />{post.readTime}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      Read <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All Posts */}
      {rest.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-base-content/40 mb-5">All Posts</h2>
          <div className="space-y-2">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card bg-base-100 border border-base-300 shadow-sm card-lift group"
              >
                <div className="card-body p-4 flex-row items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-base-content group-hover:text-primary transition-colors leading-snug">
                        {post.title}
                      </h3>
                      {post.aiGenerated && (
                        <span className="badge badge-ghost border border-base-300 badge-xs flex items-center gap-1 text-base-content/30">
                          <Bot size={8} /> AI
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-base-content/40 text-xs flex-wrap">
                      <span>{post.date} · {post.readTime} read</span>
                      <div className="flex gap-1.5">
                        {post.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="badge badge-ghost badge-xs border border-base-300">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <ArrowRight size={15} className="text-base-content/20 group-hover:text-primary transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 p-6 rounded-2xl bg-base-200 border border-base-300">
        <div>
          <p className="font-semibold text-base-content text-sm">More writing on Medium</p>
          <p className="text-base-content/40 text-xs mt-0.5">Articles on AI systems, backend engineering, and software craft.</p>
        </div>
        <a
          href="https://ikabolo59.medium.com"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-neutral btn-sm gap-2 flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
          </svg>
          Articles on Medium
        </a>
      </div>
    </div>
  );
}
