export const matchAnimations = {
  modal: {
    initial: { opacity: 0, scale: 0.9 },
    exit: { opacity: 0 },
    transition: {
      duration: 0.3,
      ease: "easeOut" as const,
    },
  },

  heartIcon: {
    initial: {
      opacity: 0,
      scale: 1.5,
    },
    animate: {
      opacity: 1,
      scale: [1.5, 0.7, 1],
    },
    transition: {
      scale: {
        delay: 0.5,
        duration: 1,
        times: [0, 0.33, 1],
      },
      opacity: {
        delay: 0.5,
        duration: 0.5,
      },
    },
  },

  userImage: {
    initial: {
      x: -200,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    transition: {
      delay: 0.5,
      duration: 0.8,
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },

  matchUserImage: {
    initial: {
      x: 200,
      opacity: 0,
    },
    animate: {
      x: 0,
      opacity: 1,
    },
    transition: {
      delay: 0.5,
      duration: 0.8,
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },

  titleShadow1: {
    initial: { y: 0, opacity: 0 },
    animate: {
      y: [0, 0, -72],
      opacity: [1, 1, 0],
    },
    transition: {
      delay: 1,
      times: [0, 0.6, 1],
      duration: 1,
      ease: "easeOut" as const,
    },
  },

  titleShadow2: {
    initial: { y: 0, opacity: 0 },
    animate: {
      y: [0, 20, -52],
      opacity: [1, 1, 0],
    },
    transition: {
      delay: 1,
      times: [0, 0.6, 1],
      duration: 1,
      ease: "easeOut" as const,
    },
  },

  titleMain: {
    initial: { y: 0 },
    animate: { y: 40 },
    transition: {
      delay: 1,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },

  description: {
    initial: { y: 40 },
    animate: { y: 80 },
    transition: {
      delay: 1,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },

  buttons: {
    initial: { y: 400 },
    animate: { y: 0 },
    transition: {
      delay: 1,
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
}

export const matchStyles = {
  titleGradient: {
    background: "linear-gradient(180deg, #FFFFFF 10.29%, #FFAEC7 89.71%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text",
    color: "transparent",
  },
} as const
