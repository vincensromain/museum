import "./page1.scss";

import content from "../data/content.json";

const Page1 = () => {
  const { title, description } = content.page1;
  return (
    <div className="page_2">
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
};

export default Page1;
