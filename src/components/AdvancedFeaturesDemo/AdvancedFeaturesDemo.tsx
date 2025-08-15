import React from "react";
import { CodeBlock, InlineCodeBlock, CollapsibleCodeBlock } from "../CodeBlock/CodeBlock";
import { 
  Callout, 
  InfoCallout, 
  WarningCallout, 
  TipCallout, 
  SuccessCallout 
} from "../Callout/Callout";
import { 
  ExpandableSection, 
  FAQSection, 
  Accordion 
} from "../ExpandableSection/ExpandableSection";
import ReadingExperience from "../ReadingExperience/ReadingExperience";
import { 
  SocialShare, 
  ReactionSystem, 
  NewsletterSignup 
} from "../SocialEngagement/SocialEngagement";
import { PWAFeatures } from "../PWAFeatures/PWAFeatures";
import CategoryTagFilter from "../CategoryTagFilter/CategoryTagFilter";
import TimelineView from "../TimelineView/TimelineView";
import RelatedContentSidebar from "../RelatedContentSidebar/RelatedContentSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Code, Lightbulb, Eye, Share, Zap, Navigation } from "lucide-react";

export function AdvancedFeaturesDemo(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Advanced Blog Features</h1>
        <p className="text-xl text-muted-foreground">
          A comprehensive demonstration of modern blog components and functionality
        </p>
        <div className="flex justify-center gap-2 flex-wrap">
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">React</Badge>
          <Badge variant="secondary">Gatsby</Badge>
          <Badge variant="secondary">shadcn/ui</Badge>
        </div>
      </div>

      {/* Code Block Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Enhanced Code Blocks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Standard Code Block with Copy</h3>
            <CodeBlock language="tsx" title="React Component Example">
{`import React, { useState } from 'react';

export function Counter(): React.ReactElement {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);

  return (
    <div className="flex items-center gap-4">
      <button onClick={decrement}>-</button>
      <span>{count}</span>
      <button onClick={increment}>+</button>
    </div>
  );
}`}
            </CodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Collapsible Code Block</h3>
            <CollapsibleCodeBlock 
              language="json" 
              title="Package.json Configuration"
            >
{`{
  "name": "my-blog",
  "version": "1.0.0",
  "dependencies": {
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-navigation-menu": "^1.2.14",
    "@radix-ui/react-progress": "^1.1.7",
    "@radix-ui/react-separator": "^1.1.7",
    "@radix-ui/react-tooltip": "^1.2.8",
    "@tailwindcss/typography": "^0.5.16",
    "gatsby": "^5.14.6",
    "react": "^18.3.1",
    "typescript": "^5.5.3"
  },
  "scripts": {
    "develop": "gatsby develop",
    "build": "gatsby build",
    "serve": "gatsby serve"
  }
}`}
            </CollapsibleCodeBlock>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Inline Code</h3>
            <p>
              You can use <InlineCodeBlock>useState</InlineCodeBlock> hook to manage state
              or install packages with <InlineCodeBlock>npm install package-name</InlineCodeBlock>.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Callout Examples */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Callout Components
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InfoCallout title="Information">
            This is an informational callout that provides helpful context or explanations 
            for your readers.
          </InfoCallout>

          <WarningCallout title="Important Warning">
            This callout highlights important warnings that users should be aware of before 
            proceeding with certain actions.
          </WarningCallout>

          <TipCallout>
            Pro tip: You can customize the appearance and behavior of these callouts to match 
            your design system perfectly.
          </TipCallout>

          <SuccessCallout title="Success!">
            This callout celebrates successful operations or provides positive feedback 
            to your users.
          </SuccessCallout>

          <Callout type="code" title="Code Snippet">
            <p>Use this type when explaining code concepts:</p>
            <InlineCodeBlock>const result = await fetchData();</InlineCodeBlock>
          </Callout>
        </CardContent>
      </Card>

      {/* Expandable Sections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Expandable Content
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Standard Expandable Section</h3>
            <ExpandableSection title="Advanced Configuration Options">
              <p>
                Here you can include detailed configuration instructions, code examples,
                or any other content that might be too lengthy for the main flow but
                valuable for interested readers.
              </p>
              <CodeBlock language="yaml" title="config.yml">
{`# Advanced configuration
advanced:
  caching: true
  compression: gzip
  timeout: 30s
  retries: 3`}
              </CodeBlock>
            </ExpandableSection>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">FAQ Section</h3>
            <Accordion>
              <FAQSection
                question="How do I install these components?"
                answer="You can install the components by copying the source code into your project 
                        and ensuring you have the required dependencies installed."
              />
              <FAQSection
                question="Are these components accessible?"
                answer="Yes! All components follow WCAG guidelines and include proper ARIA labels,
                        keyboard navigation, and screen reader support."
              />
              <FAQSection
                question="Can I customize the styling?"
                answer="Absolutely! All components use Tailwind CSS classes and can be easily
                        customized by modifying the className props or the underlying CSS."
              />
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Reading Experience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Reading Experience
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Enhanced Reading Tools</h3>
              <p className="text-muted-foreground">
                Reading mode, text-to-speech, print options, and font customization
              </p>
            </div>
            <ReadingExperience articleId="demo-content" />
          </div>
        </CardContent>
      </Card>

      {/* Social Engagement */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            Social Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Social Sharing</h3>
            <SocialShare
              title="Advanced Blog Features Demo"
              description="Check out these amazing blog features!"
              author="yourusername"
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Reaction System</h3>
            <ReactionSystem 
              postId="demo-post" 
              initialCounts={{ like: 12, love: 8, happy: 3, wow: 1 }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Newsletter Signup</h3>
            <NewsletterSignup />
          </div>
        </CardContent>
      </Card>

      {/* Navigation Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            Advanced Navigation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Category & Tag Filter</h3>
            <CategoryTagFilter />
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Timeline View</h3>
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              <TimelineView />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Progressive Web App Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            PWA features include install prompts, offline indicators, notification management,
            and service worker updates. These features enhance the user experience by providing
            app-like functionality.
          </p>
          <InfoCallout>
            PWA features are automatically active in the background. Try going offline or
            visiting on a mobile device to see the install prompt!
          </InfoCallout>
        </CardContent>
      </Card>

      <PWAFeatures />
    </div>
  );
}

export default AdvancedFeaturesDemo;