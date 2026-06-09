import { useState, useEffect } from "react";

/**
 * Returns true once the page has scrolled past `threshold` pixels.
 * Used to switch the navbar between transparent and solid backgrounds.
 *
 * @param {number} threshold - Scroll depth in px before returning true (default: 60)
 * @returns {boolean}
 */
export default function useNavScroll(threshold = 60) {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > threshold);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return solid;
}
