import React from "react";
import { StaticImage } from "gatsby-plugin-image";

const navigateToSomething = (url: string) => {
  window.open(url, "_blank");
};

function About(): React.ReactElement {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">About me</h1>
        <p className="text-xl text-muted-foreground">
          Full stack engineer, open source contributor, and lifelong learner
        </p>
      </div>

      <div className="space-y-12">
        <section className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed">
              Hey there 👋! My name is Sai Nimmagadda. I currently work as a
              full stack software engineer and have a BSE in electrical and
              computer engineering and biomedical engineering from Duke.
            </p>
            <p className="leading-relaxed">
              I&apos;m hoping to grow this site in parallel with my exploration
              of new tech and open-source software. I also created this site to
              keep myself on track: I love the excitement that comes with
              contributing to the web and wanted a way to combine my learning
              with contributing.
            </p>
            <p className="leading-relaxed">
              I believe the best way to learn is through collaboration with
              others, so I&apos;ll be posting anything and everything I come
              across in the web that I think might be useful or interesting.
              Hopefully visitors will find the knowledge/rants here useful.
            </p>
          </div>
          <div className="flex justify-center">
            <StaticImage
              src="../../images/me.jpg"
              className="rounded-lg shadow-lg max-w-sm"
              alt="Sai Nimmagadda"
            />
          </div>
        </section>
        <section>
          <h2 className="text-2xl font-semibold mb-6">What I&apos;m up to</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-left"
              onClick={() =>
                navigateToSomething(
                  "https://github.com/funsaized/coding-challenges",
                )
              }
            >
              <span className="flex-1">Tryna remember DS &amp; algos</span>
              <StaticImage
                src="../../../static/logos/leetcode.png"
                className="w-6 h-6"
                alt="LeetCode"
              />
            </button>
            <button
              type="button"
              className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-left"
              onClick={() =>
                navigateToSomething(
                  "https://www.udemy.com/course/go-programming-language/",
                )
              }
            >
              <span className="flex-1">Learning Golang</span>
              <StaticImage
                src="../../../static/logos/udemy.png"
                className="w-6 h-6"
                alt="Udemy"
              />
            </button>
            <button
              type="button"
              className="flex items-center gap-3 p-4 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors text-left"
              onClick={() => navigateToSomething("https://docs.qmk.fm/#/")}
            >
              <span className="flex-1">Hacking my keyboards (QMK)</span>
              <StaticImage
                src="../../../static/logos/qmk.png"
                className="w-6 h-6"
                alt="QMK"
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default About;
