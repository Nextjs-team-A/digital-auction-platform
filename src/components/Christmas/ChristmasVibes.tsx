"use client";


import Snowfall from "react-snowfall";
import styles from "./ChristmasVibes.module.css";

/**
 * Global background snow effect with enhanced visibility.
 */
export const ChristmasSnow = () => {
  return (
    <div className={styles.snowContainer}>
      <Snowfall
        color="#ffffff"
        snowflakeCount={120}
        radius={[1.0, 5.0]} // Increased size for better visibility
        speed={[0.5, 3.0]}
        wind={[-0.5, 2.0]}
      />
    </div>
  );
};

// Default export if needed, or we just import named members
const ChristmasVibes = () => {
  return (
    <>
      <ChristmasSnow />
    </>
  );
};

export default ChristmasVibes;
