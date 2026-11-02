import Link from "next/link";

export type BlogPostSummary = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  published_at: string | null;
  created_at: string;
};

export function BlogPostCard({ post }: { post: BlogPostSummary }) {
  const date = post.published_at ?? post.created_at;
  const formatted = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="blog-card">
      <div className="blog-card-meta">
        <time dateTime={date}>{formatted}</time>
      </div>
      <h2 className="blog-card-title">
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.excerpt && <p className="blog-card-excerpt">{post.excerpt}</p>}
      <Link className="arrow-link blog-card-link" href={`/blog/${post.slug}`}>
        Read post <span aria-hidden="true">↗</span>
      </Link>
    </article>
  );
}
