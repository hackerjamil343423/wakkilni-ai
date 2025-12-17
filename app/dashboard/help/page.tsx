"use client";

import { useState } from "react";
import { PageHeader } from "@/components/patterns/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Mail, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { helpCategories, popularArticles } from "./help-content";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticle, setExpandedArticle] = useState<string | null>(null);

  const filteredArticles = popularArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleArticle = (id: string) => {
    setExpandedArticle(expandedArticle === id ? null : id);
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      {/* Page Header */}
      <PageHeader
        title="Help Center"
        description="Find answers to your questions and learn how to get the most out of Wakklni AI."
        breadcrumbs={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Help Center" },
        ]}
      />

      {/* Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      {!searchQuery && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {helpCategories.map((category) => (
              <Card
                key={category.id}
                className="hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-primary/50"
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{category.icon}</div>
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {category.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {category.description}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {category.articleCount} articles
                      </p>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Popular Articles */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">
          {searchQuery ? "Search Results" : "Popular Articles"}
        </h2>
        <div className="space-y-3">
          {filteredArticles.map((article) => (
            <Card key={article.id}>
              <CardContent className="p-4">
                <button
                  onClick={() => toggleArticle(article.id)}
                  className="w-full text-left"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-base flex-1">
                      {article.title}
                    </h3>
                    {expandedArticle === article.id ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </button>
                {expandedArticle === article.id && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {article.content}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          {filteredArticles.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No articles found matching your search.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Contact Support */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Still need help?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Can't find what you're looking for? Our support team is here to
            help.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
            <Button variant="outline" className="flex-1">
              <ExternalLink className="w-4 h-4 mr-2" />
              Visit Documentation
            </Button>
          </div>
          <div className="text-xs text-muted-foreground">
            <p>📧 Email: support@wakklni.ai</p>
            <p>⏰ Response time: Within 24 hours</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
