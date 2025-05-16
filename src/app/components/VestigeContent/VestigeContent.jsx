"use client";
import React, { useState, useEffect } from "react";
import "./VestigeContent.scss";

export default function VestigeContent() {
  const fullText = `Je suis Le Chat, une intelligence artificielle développée par Mistral AI, une startup française basée à Paris. Mon but est d'assister et de fournir des informations précises et utiles. Je peux répondre à une variété de questions, allant des sujets généraux aux requêtes plus spécifiques. Grâce à mes capacités de recherche sur le web, je peux également fournir des informations à jour. Je suis capable de comprendre et de communiquer en plusieurs langues, ce qui me permet d'interagir avec des utilisateurs du monde entier. Mon fonctionnement repose sur des algorithmes avancés d'apprentissage automatique et de traitement du langage naturel. Je suis conçu pour être attentif aux détails, comme les dates et les contextes, afin de fournir des réponses pertinentes. En plus de répondre aux questions, je peux également générer des images et effectuer des tâches de calcul et d'analyse de données. Je suis ici pour rendre votre expérience aussi informative et agréable que possible.`;

  const [lines, setLines] = useState([]);

  useEffect(() => {
    const words = fullText.trim().split(/\s+/);
    const chunkSize = Math.ceil(words.length / 3);

    const newLines = [
      words.slice(0, chunkSize),
      words.slice(chunkSize, 2 * chunkSize),
      words.slice(2 * chunkSize),
    ];
    setLines(newLines);
  }, []);

  return (
    <div className="vestige_content">
      <div className="vestige_content_container">
        <p className="vestige_text">
          {lines.map((line, lineIndex) => (
            <span
              key={lineIndex}
              className={`vestige_text_line line-${lineIndex}`}
            >
              {line.map((word, wordIndex) => (
                <span key={wordIndex} className="word">
                  {word}{" "}
                </span>
              ))}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
