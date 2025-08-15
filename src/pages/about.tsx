import React from "react";
import Helmet from "react-helmet";
import Layout from "../layout";
import About from "../components/About/About";
import config from "../../data/SiteConfig";

function AboutPage(): React.ReactElement {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Helmet title={`About | ${config.siteTitle}`} />
        <About />
      </div>
    </Layout>
  );
}

export default AboutPage;
