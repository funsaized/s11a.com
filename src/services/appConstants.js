import urljoin from "url-join";
import config from "../../data/SiteConfig";

// Native Date API replacement for moment.js
const formatDate = (date) => {
  const dateObj = new Date(date);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  };
  // Format: "January 1st, 2024" to match "MMMM Do, YYYY"
  const formatted = dateObj.toLocaleDateString("en-US", options);
  // Add ordinal suffix to day
  const day = dateObj.getUTCDate();
  const suffix = ["th", "st", "nd", "rd"][
    day % 10 > 3 ? 0 : (((day % 100) - (day % 10) !== 10) * day) % 10
  ];
  return formatted.replace(/\d+,/, `${day}${suffix},`);
};

const editOnGithub = (post) => {
  const dateObj = new Date(post.date);
  const month = String(dateObj.getUTCMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getUTCDate()).padStart(2, "0");
  const year = dateObj.getUTCFullYear();
  const date = `${month}-${day}-${year}`; // MM-DD-YYYY format
  return urljoin(config.repo, "/blob/master/content/", `${date}`, "index.md");
};

const slugToTitle = (slug) => {
  const words = slug.split("-");
  const title = words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
  return title;
};

export { formatDate, editOnGithub, slugToTitle };
