import React, { Component } from "react";
import { StaticImage } from "gatsby-plugin-image"
import mePic from '../../images/me.jpg';

class About extends Component {

  navigateToSomething = (url: string) => {
    window.open(url, '_blank')
  }

  render() {
    // const mePic = '../../images/me.jpg';
    const leetCode = '../../../static/logos/leetcode.png';
    const udemy = '../../../static/logos/udemy.png';
    const qmk = '../../../static/logos/qmk.png';
    return (
      <div className="about">
        <h1>About me</h1>
        <div className="text-content">
          <p>Hey there 👋! My name is Sai Nimmagadda. I currently work as a full stack software engineer and have a BSE in electrical and computer engineering and biomedical engineering from Duke.</p>
          <p>I'm hoping to grow this site in parallel with my exploration of new tech and open-source software.
            I also created this site to keep myself on track: I love the excitement that comes with contributing to the web and wanted a way to combine my learning with contributing.
          </p>
          <p>I believe the best way to learn is through collaboration with others, so I'll be posting anything and everything I come across in the web that I think might be useful or interesting.
            Hopefully visitors will find the knowledge/rants here useful.</p>
        </div>
        <div className="me-content">
          <div className="currently">
            <h3>What I'm up to: </h3>
            <button className="muted-button"
              onClick={() => this.navigateToSomething("https://github.com/funsaized/coding-challenges")}>
              Tryna remember DS & algos
              <StaticImage
                src={leetCode}
                rel="noopener noreferrer"
                className="button-pic"
                alt="LeetCode"
              />
            </button>
            <button className="muted-button"
              onClick={() => this.navigateToSomething("https://www.udemy.com/course/go-programming-language/")}>
              Learning Golang
              <StaticImage
                src={udemy}
                rel="noopener noreferrer"
                className="button-pic"
                alt="Udemy"
              />
            </button>
            <button className="muted-button"
              onClick={() => this.navigateToSomething("https://docs.qmk.fm/#/")}>
              Hacking my keyboard (QMK)
              <StaticImage
                src={qmk}
                rel="noopener noreferrer"
                className="button-pic"
                alt="AdvancedReact"
              />
            </button>
          </div>
          <img
            src={mePic}
            rel="noopener noreferrer"
            className="me-pic"
            alt="Me picture"
          />
        </div>
      </div>
    );
  }
}

export default About;
