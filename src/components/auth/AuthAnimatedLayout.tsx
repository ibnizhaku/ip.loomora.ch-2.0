import { useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const routeOrder: Record<string, number> = {
  "/login": 0,
  "/register": 1,
};

export default function AuthAnimatedLayout() {
  const location = useLocation();
  const outlet = useOutlet();

  const currentOrder = routeOrder[location.pathname] ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatePresence mode="wait" custom={currentOrder}>
        <motion.div
          key={location.pathname}
          custom={currentOrder}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "tween", duration: 0.4, ease: [0.4, 0, 0.2, 1] },
            opacity: { duration: 0.3 },
          }}
          className="min-h-screen"
        >
          {outlet}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
