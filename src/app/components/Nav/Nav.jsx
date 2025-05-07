import Link from "next/link";
import "./Nav.scss";

const Nav = () => {
  return (
    <nav id="nav" className="inside">
      <div className="logo">
        <div className="link">
          <Link className="page_link" href="/">
            Logo
          </Link>
        </div>
      </div>
      <div className="links">
        <div className="link">
          <Link className="page_link" href="/page1">
            Page 1
          </Link>
        </div>
        <div className="link">
          <Link className="page_link" href="/page2">
            Page 2
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Nav;
