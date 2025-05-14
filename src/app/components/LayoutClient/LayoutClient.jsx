"use client";

import { useState, useEffect } from "react";
import Loader from "../Loader/Loader";
import LogoHeader from "../LogoHeader/LogoHeader";
import Noise from "../NoiseCanvas/NoiseCanvas";

export default function LayoutClient({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      <Loader isLoading={isLoading} />
      <Noise />
      <LogoHeader />
      {children}
    </>
  );
}
