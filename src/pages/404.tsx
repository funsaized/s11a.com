import React from 'react';
import type { PageProps } from 'gatsby';
import { Link } from 'gatsby';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

const NotFoundPage: React.FC<PageProps> = () => {
  return (
    <Layout 
      title="404 - Page Not Found" 
      description="The page you're looking for doesn't exist."
    >
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="mb-8">
            <div className="text-9xl font-bold text-muted-foreground mb-4">404</div>
            <h1 className="text-4xl font-bold mb-4">Page Not Found</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 justify-center">
                <span className="text-2xl">🧭</span>
                What can you do?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link to="/" className="flex flex-col items-center gap-2">
                    <span className="text-2xl">🏠</span>
                    <span className="font-semibold">Go Home</span>
                    <span className="text-sm text-muted-foreground">Return to the homepage</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link to="/articles" className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📚</span>
                    <span className="font-semibold">Browse Articles</span>
                    <span className="text-sm text-muted-foreground">Explore technical content</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <Link to="/about" className="flex flex-col items-center gap-2">
                    <span className="text-2xl">👨‍💻</span>
                    <span className="font-semibold">About Me</span>
                    <span className="text-sm text-muted-foreground">Learn more about Sai</span>
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="h-auto p-4">
                  <a 
                    href="https://github.com/snimmagadda1" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex flex-col items-center gap-2"
                  >
                    <span className="text-2xl">🐙</span>
                    <span className="font-semibold">GitHub</span>
                    <span className="text-sm text-muted-foreground">Check out my projects</span>
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="text-sm text-muted-foreground">
            <p>
              If you think this is a mistake, please{' '}
              <a 
                href="https://github.com/snimmagadda1/s11a-new/issues" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                report it on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFoundPage;