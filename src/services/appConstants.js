import urljoin from "url-join";
import moment from "moment";
import config from "../../data/SiteConfig";

const formatDate = (date) => moment.utc(date).format(config.dateFormat);

const editOnGithub = (post) => {
  const date = moment.utc(post.date).format(config.dateFromFormat);
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
