import React, { Component } from "react";
import { StaticImage } from "gatsby-plugin-image";

const navigateToSomething = (url: string) => {
  window.open(url, "_blank");
};

// eslint-disable-next-line react/prefer-stateless-function
class About extends Component {
  render() {
    return (
      <div className="about">
        <h1>About me</h1>
        <div className="text-content">
          <p>
            Hey there 👋! My name is Sai Nimmagadda. I currently work as a full
            stack software engineer and have a BSE in electrical and computer
            engineering and biomedical engineering from Duke.
          </p>
          <p>
            I&apos;m hoping to grow this site in parallel with my exploration of
            new tech and open-source software. I also created this site to keep
            myself on track: I love the excitement that comes with contributing
            to the web and wanted a way to combine my learning with
            contributing.
          </p>
          <p>
            I believe the best way to learn is through collaboration with
            others, so I&apos;ll be posting anything and everything I come
            across in the web that I think might be useful or interesting.
            Hopefully visitors will find the knowledge/rants here useful.
          </p>
        </div>
        <div className="me-content">
          <div className="currently">
            <h3>What I&apos;m up to: </h3>
            <button
              type="button"
              className="muted-button"
              onClick={() =>
                navigateToSomething(
                  "https://github.com/funsaized/coding-challenges",
                )
              }
            >
              Tryna remember DS &amp; algos
              <StaticImage
                src="../../../static/logos/leetcode.png"
                className="button-pic"
                alt="LeetCode"
              />
            </button>
            <button
              type="button"
              className="muted-button"
              onClick={() =>
                navigateToSomething(
                  "https://www.udemy.com/course/go-programming-language/",
                )
              }
            >
              Learning Golang
              <StaticImage
                src="../../../static/logos/udemy.png"
                className="button-pic"
                alt="Udemy"
              />
            </button>
            <button
              type="button"
              className="muted-button"
              onClick={() => navigateToSomething("https://docs.qmk.fm/#/")}
            >
              Hacking my keyboard (QMK)
              <StaticImage
                src="../../../static/logos/qmk.png"
                className="button-pic"
                alt="QMK"
              />
            </button>
          </div>
          <StaticImage
            src="../../images/me.jpg"
            className="me-pic"
            alt="Sai Nimmagadda"
          />
        </div>
      </div>
    );
  }
}

export default About;
