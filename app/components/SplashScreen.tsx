"use client";

import { motion } from "framer-motion";

export default function SplashScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black overflow-hidden">
      
      {/* Headlight Glow Background */}
      <motion.div
        className="absolute w-[340px] h-[340px] rounded-full bg-amber-400/16 blur-3xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.12, 0.28, 0.12] }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* App Title */}
        <h1
          className="mb-4 translate-x-[2px] text-4xl font-semibold tracking-[0.22em] text-amber-400 uppercase"
        >
          Shift
        </h1>

        {/* Logo Wrapper */}
        <div className="relative w-40 h-40">

        {/* Taxi Sign Glow Overlay BEHIND Logo */}
        <motion.img
            src="/taxi-sign-glow.png"
            alt=""
            className="absolute inset-0 z-0 w-40 h-40 object-contain pointer-events-none"
            initial={{ opacity: 1 }}
            animate={{ opacity: [1, 1, 0, 0] }}
            transition={{
            duration: 3.6,
            ease: "easeOut",
            times: [0, 0.84, 0.97, 1],
            }}
        />

        {/* Main Logo */}
        <img
            src="/icon-512.png"
            alt="Shift Mate Logo"
            className="relative z-20 w-40 h-40 object-contain"
        />

        {/* Headlight Flash Overlay */}
        <motion.img
            src="/headlight-flash.png"
            alt=""
            className="absolute inset-0 z-30 w-40 h-40 object-contain pointer-events-none"
            style={{
            filter: "brightness(3.5) drop-shadow(0 0 18px white)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 5, 0, 0, 1.8, 0] }}
            transition={{
            duration: 2.6,
            ease: "easeOut",
            times: [0, 0.10, 0.20, 0.48, 0.62, 1],
            }}
        />
        </div>

      {/* Subtitle */}
      <h2
        className="mt-4 translate-x-[2px] text-xl tracking-[0.28em] text-white/80 uppercase"
      >
        Mate
      </h2>
    </div>
  );
}