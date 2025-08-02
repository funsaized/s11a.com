import React, { Component } from "react";
import gatsby from "../../../static/logos/gatsby.png";
import netlify from "../../../static/logos/netlify.png";
import github from "../../../static/logos/octocat.png";
import "./Footer.css";

// eslint-disable-next-line react/prefer-stateless-function
class Footer extends Component {
  render() {
    return (
      <footer className="footer">
        <div className="container footer">
          <a href="https://github.com/funsaized" title="Contribute on GitHub">
            <img src={github} className="footer-image" alt="GitHub" />
          </a>
          <a href="https://www.netlify.com/" title="Hosted by Netlify">
            <img src={netlify} className="footer-image" alt="Netlify" />
          </a>
          <a href="https://www.gatsbyjs.org/" title="Built with Gatsby">
            <img src={gatsby} className="footer-image" alt="Gatsby" />
          </a>
        </div>
      </footer>
    );
  }
}

export default Footer;
