import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar } from "lucide-react";

const FeaturedPosts: React.FC = () => {
  const featuredPosts = [];

  return (
    <section className="mb-16">
      <h2 className="text-3xl font-serif font-medium mb-8">
        Featured Articles
      </h2>
      <div className="grid md:grid-cols-2 gap-8">
        {featuredPosts.map((post) => (
          <Card
            key={post.id}
            className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
          >
            <Link to={`/blog/${post.slug}`} className="block">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-48 object-cover hover:opacity-90 transition-opacity"
              />
            </Link>
            <CardContent className="flex-grow flex flex-col p-6">
              <div className="flex items-center text-sm text-spirit-600 mb-2">
                <span className="bg-purple-100 text-spirit-700 px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <h3 className="text-xl font-serif font-medium mb-2">
                <Link
                  to={`/blog/${post.slug}`}
                  className="hover:text-spirit-600 transition-colors"
                >
                  {post.title}
                </Link>
              </h3>
              <p className="text-earth-600 mb-4">{post.excerpt}</p>
              <div className="mt-auto flex items-center justify-between text-sm text-earth-500">
                <span>{post.author}</span>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{post.date}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};

export default FeaturedPosts;
