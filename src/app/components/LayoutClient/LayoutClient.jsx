"use client";
import { useState } from "react";
import Loader from "../Loader/Loader";
import LogoHeader from "../LogoHeader/LogoHeader";
import Noise from "../NoiseCanvas/NoiseCanvas";

export default function LayoutClient({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <>
      {isLoading && <Loader setIsLoading={setIsLoading} />}
      {!isLoading && (
        <>
          <Noise />
          <LogoHeader />
          {children}
        </>
      )}
    </>
  );
}
