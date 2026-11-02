import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  seo_title: string | null;
  seo_description: string | null;
  published_at: string | null;
  created_at: string;
};

async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${apiUrl}/api/posts/${slug}`, {
    next: { revalidate: 60 },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Could not load post.");
  const data = await res.json() as { post: Post };
  return data.post;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const date = post.published_at ?? post.created_at;
  const formatted = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <article className="blog-post-page">
        <header className="blog-post-header">
          <Link className="back-link" href="/blog">
            ← Back to blog
          </Link>
          <p className="eyebrow">
            <time dateTime={date}>{formatted}</time>
          </p>
          <h1>{post.title}</h1>
          {post.excerpt && <p className="blog-post-excerpt">{post.excerpt}</p>}
        </header>

        <div className="blog-post-body prose">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </article>

      <section className="cta-section">
        <div>
          <p className="eyebrow">Enjoyed this read?</p>
          <h2>Let's build something<br /><span>together.</span></h2>
        </div>
        <Link className="button button-primary" href="/contact">
          Start a project <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
