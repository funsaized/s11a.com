import React, { Component } from "react";
import Helmet from "react-helmet";
import { Link, graphql } from "gatsby";
import Layout from "../layout";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import { slugToTitle } from "../services/appConstants";

export default class NotesPage extends Component {
  constructor(props) {
    super(props);
    const {
      data: {
        notes: { nodes },
      },
    } = props;
    this.state = {
      searchTerm: "",
      notes: nodes,
      filteredNotes: nodes,
    };
  }

  handleChange = async (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });

    this.filterPosts();
  };

  filterPosts = () => {
    const { notes, searchTerm } = this.state;

    const filteredNotes = notes.filter((n) =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    this.setState({ filteredNotes });
  };

  render() {
    const { filteredNotes, searchTerm } = this.state;
    // todo
    const filterCount = filteredNotes.length;

    return (
      <Layout>
        <Helmet title={`Notes – ${config.siteTitle}`} />
        <SEO />
        <div className="container">
          <h1>Notes</h1>
          <p>
            Writing things helps with understanding. Below is a repo of my
            scribbles...
          </p>
          <div className="search-container">
            <input
              className="search"
              type="text"
              name="searchTerm"
              value={searchTerm}
              placeholder="Type here to filter notes..."
              onChange={this.handleChange}
            />
            <div className="filter-count">{filterCount}</div>
          </div>
          <div className="notes">
            {filteredNotes.map((note) => (
              <Link to={`/notes/${note.name}`}>
                <h2>{slugToTitle(note.name.replace("/notes/", ""))}</h2>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    );
  }
}

export const pageQuery = graphql`
  query NotesQuery {
    notes: allFile(
      filter: { sourceInstanceName: { eq: "notes" }, extension: { eq: "pdf" } }
    ) {
      nodes {
        name
      }
    }
  }
`;
