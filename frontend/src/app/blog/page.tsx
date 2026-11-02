import type { Metadata } from "next";
import Link from "next/link";
import { BlogPostCard, type BlogPostSummary } from "@/components/blog-post-card";

export const metadata: Metadata = {
  title: "Blog",
  description: "Thoughts on digital strategy, design, and development from the Nexvora team.",
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const PAGE_SIZE = 6;

type PostsResponse = {
  posts: BlogPostSummary[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

async function getPosts(page: number): Promise<PostsResponse> {
  const res = await fetch(`${apiUrl}/api/posts?page=${page}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Could not load posts.");
  return res.json() as Promise<PostsResponse>;
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));

  let data: PostsResponse | null = null;
  let fetchError: string | null = null;

  try {
    data = await getPosts(page);
  } catch {
    fetchError = "We couldn't load posts right now. Please try again shortly.";
  }

  const posts = data?.posts ?? [];
  const totalPages = data?.pagination.totalPages ?? 1;

  return (
    <>
      <section className="page-hero">
        <p className="eyebrow">From the studio</p>
        <h1>Ideas worth<br /><span>writing about.</span></h1>
        <p>Thinking on digital strategy, design and the craft of building things that matter.</p>
      </section>

      <section className="section blog-section">
        {fetchError ? (
          <p className="blog-error">{fetchError}</p>
        ) : posts.length === 0 ? (
          <p className="blog-empty">No posts yet — check back soon.</p>
        ) : (
          <>
            <div className="blog-grid">
              {posts.map((post) => (
                <BlogPostCard key={post.id} post={post} />
              ))}
            </div>

            {totalPages > 1 && (
              <nav className="blog-pagination" aria-label="Blog pagination">
                {page > 1 && (
                  <Link
                    className="button button-ghost"
                    href={`/blog?page=${page - 1}`}
                  >
                    ← Newer posts
                  </Link>
                )}
                <span className="pagination-info">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    className="button button-ghost"
                    href={`/blog?page=${page + 1}`}
                  >
                    Older posts →
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </section>

      <section className="cta-section">
        <div>
          <p className="eyebrow">Have a project in mind?</p>
          <h2>Let's make your<br />next move <span>matter.</span></h2>
        </div>
        <Link className="button button-primary" href="/contact">
          Tell us about it <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
