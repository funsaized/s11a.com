import React from "react";
import { StaticImage } from "gatsby-plugin-image";

function Footer(): React.ReactElement {
  return (
    <footer className="bg-background border-t border-border">
      <div className="container-custom py-6">
        <div className="flex justify-center items-center gap-6">
          <a
            href="https://github.com/funsaized"
            title="Contribute on GitHub"
            className="opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            <StaticImage
              src="../../../static/logos/octocat.png"
              alt="GitHub"
              className="w-8 h-8"
              width={32}
              height={32}
              placeholder="blurred"
            />
          </a>
          <a
            href="https://www.netlify.com/"
            title="Hosted by Netlify"
            className="opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            <StaticImage
              src="../../../static/logos/netlify.png"
              alt="Netlify"
              className="w-8 h-8"
              width={32}
              height={32}
              placeholder="blurred"
            />
          </a>
          <a
            href="https://www.gatsbyjs.org/"
            title="Built with Gatsby"
            className="opacity-70 hover:opacity-100 transition-opacity duration-200"
          >
            <StaticImage
              src="../../../static/logos/gatsby.png"
              alt="Gatsby"
              className="w-8 h-8"
              width={32}
              height={32}
              placeholder="blurred"
            />
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
