import "./page.scss";

import Link from "next/link";

export default function Home() {
  return (
    <>
      <main>
        <section className="home inside">
          <div className="narration">
            <p className="narration_text">
              Lorem, ipsum dolor sit amet consectetur adipisicing elit. In
              accusamus ex ratione eaque, corrupti cumque. In aspernatur facere,
              deserunt tempore laboriosam ipsum ex assumenda accusantium sunt
              nihil illum quam expedita.
            </p>
            <div className="orb"></div>
          </div>

          <Link href="/visite_musee" className="cta">
            Commencer l'éxperience
          </Link>
        </section>
      </main>
    </>
  );
}
