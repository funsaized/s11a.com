import React from "react";
import { StaticImage } from "gatsby-plugin-image";
import { Card, CardContent } from "../ui/card";

const navigateToSomething = (url: string) => {
  window.open(url, "_blank");
};

function About(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-8">
      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          About me
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Full stack engineer, open source contributor, and lifelong learner
        </p>
      </div>
      
      {/* Profile Section */}
      <Card className="mb-12 max-w-3xl mx-auto">
        <CardContent className="p-8">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-48 h-48 rounded-2xl overflow-hidden shadow-lg">
              <StaticImage
                src="../../images/me.jpg"
                className="w-full h-full object-cover"
                alt="Sai Nimmagadda"
                placeholder="blurred"
                width={192}
                height={192}
              />
            </div>
            
            <div className="space-y-4 text-foreground leading-relaxed">
              <p>
                Hey there 👋! My name is Sai Nimmagadda. I currently work as a full
                stack software engineer and have a BSE in electrical and computer
                engineering and biomedical engineering from Duke.
              </p>
              <p>
                I&apos;m hoping to grow this site in parallel with my exploration of
                new tech and open-source software. I also created this site to keep
                myself on track: I love the excitement that comes with contributing to
                the web and wanted a way to combine my learning with contributing.
              </p>
              <p>
                I believe the best way to learn is through collaboration with others,
                so I&apos;ll be posting anything and everything I come across in the
                web that I think might be useful or interesting. Hopefully visitors
                will find the knowledge/rants here useful.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What I'm up to Section */}
      <section className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-8">
          What I&apos;m up to
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* DS & Algos Card */}
          <button
            type="button"
            className="group relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
            }}
            onClick={() =>
              navigateToSomething(
                "https://github.com/funsaized/coding-challenges",
              )
            }
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="text-4xl">🔄</div>
              <span className="text-lg font-semibold">
                Tryna remember DS &amp; algos
              </span>
            </div>
          </button>

          {/* Learning Golang Card */}
          <button
            type="button"
            className="group relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
            onClick={() =>
              navigateToSomething(
                "https://www.udemy.com/course/go-programming-language/",
              )
            }
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="text-4xl">🎯</div>
              <span className="text-lg font-semibold">
                Learning Golang
              </span>
            </div>
          </button>

          {/* QMK Keyboards Card */}
          <button
            type="button"
            className="group relative overflow-hidden rounded-xl p-6 text-white transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 md:col-span-2 lg:col-span-1"
            style={{
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)'
            }}
            onClick={() => navigateToSomething("https://docs.qmk.fm/#/")}
          >
            <div className="relative z-10 flex flex-col items-center space-y-4">
              <div className="text-4xl">⌨️</div>
              <span className="text-lg font-semibold">
                Hacking my keyboards (QMK)
              </span>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

export default About;
