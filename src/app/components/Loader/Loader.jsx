"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import "./Loader.scss";

export default function Loader({ setIsLoading }) {
  const loaderRef = useRef(null);
  const totalPaths = 9;
  const duration = 2.8;
  const interval = duration / totalPaths; // ~0.311s

  useEffect(() => {
    const el = loaderRef.current;

    // Set all paths to opacity 0.3
    for (let i = 1; i <= totalPaths; i++) {
      gsap.set(`.path_${i}`, { opacity: 0.3 });
    }

    window.addEventListener("load", () => {
      // Animation en cascade sur 2.8s
      const timeline = gsap.timeline({
        onComplete: () => {
          gsap.to(el, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => {
              el.style.display = "none";
              setIsLoading(false);
            },
          });
        },
      });

      for (let i = 1; i <= totalPaths; i++) {
        timeline.to(
          `.path_${i}`,
          {
            opacity: 1,
            duration: 0.3,
            ease: "power1.out",
          },
          i * interval
        ); // Delay basé sur l'index
      }
    });
  }, [setIsLoading]);

  return (
    <div className="loader" ref={loaderRef}>
      <svg
        width="116"
        height="98"
        viewBox="0 0 116 98"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_210_3)">
          <path
            className="path_9"
            d="M64.275 60.2264L109.993 59.7944C112.725 59.7683 114.977 57.6665 115.169 54.9648L115.995 43.2712C116.121 41.4848 114.316 40.1858 112.642 40.8559L64.276 60.2254L64.275 60.2264Z"
            fill="#7DDAEE"
          />
          <path
            className="path_8"
            d="M92.3016 11.1964L60.6729 53.6799L99.9632 29.2749C102.434 27.7397 103.316 24.589 101.996 22.0109L96.6397 11.5541C95.7781 9.8722 93.4317 9.67929 92.3026 11.1964H92.3016Z"
            fill="#7DDAEE"
          />
          <path
            className="path_7"
            d="M56.6793 2.37717L53.6072 50.2529L71.4695 12.4442C72.7162 9.80589 71.7077 6.66018 69.1524 5.21945L60.4955 0.334622C58.8524 -0.591707 56.7989 0.50743 56.6793 2.37616V2.37717Z"
            fill="#7DDAEE"
          />
          <path
            className="path_6"
            d="M27.7751 10.5554L46.133 49.9325L43.9173 12.389C43.746 9.48041 41.3479 7.19071 38.4085 7.12942L30.1509 6.95762C28.2616 6.91843 26.9835 8.85448 27.7761 10.5544L27.7751 10.5554Z"
            fill="#7DDAEE"
          />
          <path
            className="path_5"
            d="M12.543 26.0989L7.00783 29.6043C5.41549 30.613 5.43881 32.9268 7.05141 33.9034L40.461 54.1359L20.0718 27.4361C18.2981 25.1133 15.0202 24.5316 12.543 26.0999V26.0989Z"
            fill="#7DDAEE"
          />
          <path
            className="path_4"
            d="M2.38398 52.2864L0.257489 56.6498C-0.564523 58.3367 0.680152 60.2938 2.56946 60.2868L37.1426 60.1542L9.50031 49.5084C6.76061 48.4535 3.6621 49.6621 2.38398 52.2864Z"
            fill="#7DDAEE"
          />
          <path
            className="path_3"
            d="M10.375 77.9875L10.9243 81.1393C11.2466 82.9849 13.4076 83.859 14.9401 82.7629L39.3025 65.3364L14.5306 71.6238C11.6835 72.3462 9.87426 75.1171 10.375 77.9886V77.9875Z"
            fill="#7DDAEE"
          />
          <path
            className="path_2"
            d="M35.2269 95.3185L42.7385 71.0742L29.3137 87.7873C27.4832 90.067 27.7264 93.3584 29.8732 95.3487L31.0358 96.4257C32.4163 97.7047 34.6715 97.1089 35.2259 95.3185H35.2269Z"
            fill="#7DDAEE"
          />
          <path
            className="path_1"
            d="M51.2343 97.8854L52.3705 97.9889C54.2527 98.1597 55.6647 96.317 54.9937 94.5659L47.4557 74.8718L47.2337 93.4898C47.2063 95.7645 48.9477 97.6784 51.2333 97.8854H51.2343Z"
            fill="#7DDAEE"
          />
        </g>
        <defs>
          <clipPath id="clip0_210_3">
            <rect width="116" height="98" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}
