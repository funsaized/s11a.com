import React from "react";
import Helmet from "react-helmet";
import config from "../../data/SiteConfig";
import "./index.css";
import "../styles/main.scss";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayout({ children }: MainLayoutProps): React.ReactElement {
  return (
    <div>
      <Helmet>
        <meta name="description" content={config.siteDescription} />
      </Helmet>
      <Navbar menuLinks={config.menuLinks} />
      <main id="main-content">{children}</main>
      <Footer />
    </div>
  );
}

export default MainLayout;
