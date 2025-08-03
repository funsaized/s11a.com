import React, { useState, useEffect } from "react";
import Helmet from "react-helmet";
import { Link, graphql } from "gatsby";
import Layout from "../layout";
import SEO from "../components/SEO/SEO";
import config from "../../data/SiteConfig";
import { slugToTitle } from "../services/appConstants";

interface NotesPageProps {
  data: {
    notes: {
      nodes: Array<{
        name: string;
      }>;
    };
  };
}

function NotesPage({ data }: NotesPageProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [notes] = useState(data.notes.nodes);
  const [filteredNotes, setFilteredNotes] = useState(data.notes.nodes);

  const filterNotes = () => {
    const filtered = notes.filter((n) =>
      n.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredNotes(filtered);
  };

  useEffect(() => {
    filterNotes();
  }, [searchTerm]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

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
            onChange={handleChange}
          />
          <div className="filter-count">{filterCount}</div>
        </div>
        <div className="notes">
          {filteredNotes.map((note) => (
            <Link key={note.name} to={`/notes/${note.name}`}>
              <h2>{slugToTitle(note.name.replace("/notes/", ""))}</h2>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default NotesPage;

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
