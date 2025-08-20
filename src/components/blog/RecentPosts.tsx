import React from "react";
import { Link } from "react-router-dom";
import { FileText, Calendar } from "lucide-react";

const RecentPosts: React.FC = () => {
  // Updated to ensure no duplicates with featured posts (ids 1 and 2)
  const recentPosts = [];

  return (
    <section>
      <h2 className="text-3xl font-serif font-medium mb-8">Recent Articles</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {recentPosts.map((post) => (
          <div key={post.id} className="flex flex-col h-full group">
            <Link
              to={`/blog/${post.slug}`}
              className="block aspect-video mb-4 overflow-hidden rounded-lg"
            >
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </Link>
            <div className="flex items-center text-xs text-spirit-600 mb-2">
              <span className="bg-purple-100 text-spirit-700 px-2 py-1 rounded-full">
                {post.category}
              </span>
            </div>
            <h3 className="text-lg font-medium mb-2">
              <Link
                to={`/blog/${post.slug}`}
                className="hover:text-spirit-600 transition-colors"
              >
                {post.title}
              </Link>
            </h3>
            <p className="text-earth-600 text-sm mb-3 line-clamp-2">
              {post.excerpt}
            </p>
            <div className="mt-auto flex items-center justify-between text-xs text-earth-500">
              <span>{post.author}</span>
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          to="/blog/archive"
          className="inline-flex items-center border border-spirit-600 text-spirit-600 hover:bg-spirit-600 hover:text-white px-5 py-2 rounded-md transition-colors"
        >
          View All Articles
          <FileText className="ml-2 h-4 w-4" />
        </Link>
      </div>
    </section>
  );
};

export default RecentPosts;
