import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, Tag } from "lucide-react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BreadcrumbSchema } from "@/components/global/SchemaOrg";
import { getBlogBySlug } from "@/app/actions/blog-actions";
import { format } from "date-fns";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const post = await getBlogBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    return {
        title: post.metaTitle || post.title,
        description: post.metaDescription || post.shortDescription || 'Meezan Educational Institute Blog Post',
        keywords: post.keywords?.join(', '),
        alternates: { canonical: post.canonicalUrl || `https://meezanedu.com/blog/${slug}` },
        openGraph: {
            title: post.ogTitle || post.title,
            description: post.ogDescription || post.shortDescription || '',
            url: `https://meezanedu.com/blog/${slug}`,
            type: 'article',
            publishedTime: post.publishDate ? new Date(post.publishDate).toISOString() : new Date(post.createdAt).toISOString(),
            images: [{ url: post.ogImage || post.featuredImage || '/og-image.jpg', width: 1200, height: 630 }],
        },
    };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const post = await getBlogBySlug(slug);

    if (!post) {
        notFound();
    }

    const title = post.title;
    const publishDate = post.publishDate ? new Date(post.publishDate) : new Date(post.createdAt);

    return (
        <article className="w-full bg-white pb-24">
            <BreadcrumbSchema crumbs={[
                { name: 'Home', url: '/' },
                { name: 'Blog', url: '/blog' },
                { name: title, url: `/blog/${slug}` }
            ]} />

            {/* HERO IMAGE */}
            <div className="relative w-full h-[400px] lg:h-[500px] overflow-hidden bg-brand-deeper-teal">
                {post.featuredImage && (
                    <Image
                        src={post.featuredImage}
                        alt={`Meezan Blog: ${title}`}
                        fill
                        priority={true}
                        className="object-cover opacity-40 mix-blend-overlay"
                        sizes="100vw"
                    />
                )}
                
                <div className="absolute inset-0 flex items-center justify-center pt-20">
                    <div className="max-w-4xl mx-auto px-4 text-center">
                        <span className="inline-block bg-brand-accent text-brand-deeper-teal font-bold text-xs px-3 py-1.5 rounded-md uppercase tracking-widest mb-6">
                            {post.category || 'Article'}
                        </span>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.15] mb-6 drop-shadow-md">
                            {title}
                        </h1>

                        <div className="flex flex-wrap items-center justify-center gap-6 text-white/90 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white text-brand-deeper-teal flex items-center justify-center font-bold">
                                    {post.author ? post.author.charAt(0).toUpperCase() : 'M'}
                                </div>
                                <span>Author: {post.author || 'Meezan Institute'}</span>
                            </div>
                            <span className="flex items-center gap-2"><Calendar size={16} /> {format(publishDate, 'MMMM d, yyyy')}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ARTICLE BODY */}
            <div className="max-w-3xl mx-auto px-4 py-8 lg:py-10 prose prose-lg prose-slate prose-headings:text-brand-deeper-teal prose-a:text-brand-teal prose-img:rounded-2xl">
                <Link href="/blog" className="inline-flex items-center gap-2 text-brand-teal font-semibold hover:text-brand-dark-teal transition-colors mb-8 no-underline text-sm" aria-label="Back to all blog articles">
                    <ArrowLeft size={16} /> Back to all articles
                </Link>

                <div 
                  className="tiptap-content"
                  dangerouslySetInnerHTML={{ __html: post.content }} 
                />

                {/* TAGS */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-3 pt-8 border-t border-border mt-16">
                      <Tag size={18} className="text-foreground/40 shrink-0 mr-2" />
                      {post.tags.map((tag: string) => (
                          <span key={tag} className="bg-brand-light text-foreground/70 text-xs px-3 py-1.5 rounded-full font-medium">
                              {tag}
                          </span>
                      ))}
                  </div>
                )}
            </div>

            {/* CTA STRIP */}
            <section className="bg-brand-deeper-teal border-t border-[#1a1a2e] py-6 md:py-8 px-4 flex items-center justify-center mt-12">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 max-w-5xl mx-auto w-full">
                    <div className="text-center md:text-left">
                        <h3 className="text-xl md:text-2xl font-bold mb-1 text-white">Enjoyed this article?</h3>
                        <p className="text-base text-white/70 m-0">Take the next step in your career journey. Explore our comprehensive courses.</p>
                    </div>
                    <Link
                        href="/courses"
                        className="inline-block shrink-0 bg-brand-teal text-white px-6 py-3 rounded-full font-bold hover:bg-brand-dark-teal transition-all shadow-sm hover:-translate-y-0.5"
                    >
                        Explore Courses
                    </Link>
                </div>
            </section>
        </article>
    );
}
