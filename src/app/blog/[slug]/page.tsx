import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Clock, Calendar, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { getPost, getAllSlugs } from "@/lib/blog-posts";

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return { title: `${post.title} - Samuel Abolo`, description: post.excerpt };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      {/* Breadcrumb */}
      <div className="breadcrumbs text-xs mb-8">
        <ul>
          <li><Link href="/" className="text-base-content/40">Home</Link></li>
          <li><Link href="/blog" className="text-base-content/40">Blog</Link></li>
          <li className="text-base-content/70 truncate max-w-[200px]">{post.title}</li>
        </ul>
      </div>

      <header className="mb-10">
        <div className="flex flex-wrap gap-1.5 mb-4">
          {post.tags.map((tag) => (
            <span key={tag} className="badge badge-primary badge-soft badge-sm">{tag}</span>
          ))}
          {post.aiGenerated && (
            <span className="badge badge-ghost border border-base-300 badge-sm flex items-center gap-1 text-base-content/40">
              <Bot size={10} /> AI Generated
            </span>
          )}
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-base-content leading-snug mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-base-content/40 text-xs">
          <span className="flex items-center gap-1.5"><Calendar size={12} />{post.date}</span>
          <span className="flex items-center gap-1.5"><Clock size={12} />{post.readTime} read</span>
        </div>
        <div className="divider mt-6 mb-0" />
      </header>

      <article className="prose-blog">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1>{children}</h1>,
            h2: ({ children }) => <h2>{children}</h2>,
            h3: ({ children }) => <h3>{children}</h3>,
            p: ({ children, node }) => {
              // If paragraph contains any img, skip the <p> wrapper to avoid invalid HTML nesting
              const hasImage = (node?.children ?? []).some(
                (child) =>
                  child.type === "element" &&
                  (child as { tagName?: string }).tagName === "img"
              );
              if (hasImage) return <>{children}</>;
              return <p>{children}</p>;
            },
            img: ({ src, alt }) => {
              const imgSrc = typeof src === "string" ? src : "";
              return (
                <figure className="my-8">
                  <div className="rounded-xl overflow-hidden border border-base-300 shadow-sm">
                    <Image src={imgSrc} alt={alt ?? ""} width={1200} height={630} className="w-full h-auto" />
                  </div>
                  {alt && <figcaption>{alt}</figcaption>}
                </figure>
              );
            },
            em: ({ children }) => <em>{children}</em>,
            ul: ({ children }) => (
              <ul className="space-y-2 mb-5 mt-2">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-2 mb-5 mt-2 text-base-content/60 text-[15px]">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="flex gap-2 text-base-content/60 text-[15px] leading-relaxed">
                <span className="text-primary mt-[3px] flex-shrink-0">·</span>
                <span>{children}</span>
              </li>
            ),
            code: ({ children, className }) => {
              const lang = className?.replace("language-", "") ?? "";
              const isBlock = !!lang || (typeof children === "string" && children.includes("\n"));
              if (isBlock) {
                return (
                  <div className="my-6 rounded-xl overflow-hidden border border-base-300 shadow-sm">
                    {lang && (
                      <div className="bg-base-300 px-4 py-2 flex items-center gap-2 border-b border-base-300">
                        <span className="size-2.5 rounded-full bg-red-400/60" />
                        <span className="size-2.5 rounded-full bg-yellow-400/60" />
                        <span className="size-2.5 rounded-full bg-green-400/60" />
                        <span className="ml-2 text-[11px] font-mono text-base-content/40 uppercase tracking-wider">{lang}</span>
                      </div>
                    )}
                    <pre className="bg-neutral overflow-x-auto p-5 m-0">
                      <code className="text-neutral-content text-[13px] font-mono leading-relaxed">{children}</code>
                    </pre>
                  </div>
                );
              }
              return <code className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[13px] font-mono">{children}</code>;
            },
            pre: ({ children }) => <>{children}</>,
            strong: ({ children }) => <strong>{children}</strong>,
            a: ({ children, href }) => (
              <a href={href} className="text-primary underline underline-offset-2 hover:text-primary/70 transition-colors">
                {children}
              </a>
            ),
            blockquote: ({ children }) => (
              <div className="alert alert-info my-5 text-sm">
                <span>{children}</span>
              </div>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6">
                <table className="table table-sm border border-base-300 rounded-xl">{children}</table>
              </div>
            ),
            th: ({ children }) => <th className="bg-base-200 text-xs uppercase tracking-wider">{children}</th>,
            td: ({ children }) => <td>{children}</td>,
            hr: () => <div className="divider my-8" />,
          }}
        >
          {post.content}
        </ReactMarkdown>
      </article>

      <div className="divider mt-12" />
      <div className="flex items-center justify-between">
        <Link href="/blog" className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft size={14} /> All posts
        </Link>
        <Link href="/contact" className="btn btn-primary btn-sm btn-soft">
          Have thoughts? Reach out →
        </Link>
      </div>
    </div>
  );
}
