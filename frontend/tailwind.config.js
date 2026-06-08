/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        terracotta: {
          50: "#FDF3EF",
          100: "#FBE8E1",
          200: "#F7D4C9",
          300: "#F0B3A1",
          400: "#E89379",
          500: "#E07A5F",
          600: "#CF6A4C",
          700: "#B95A40",
        },
        sage: {
          50: "#F3F8F5",
          100: "#E8F2EC",
          200: "#D5E6DD",
          300: "#B7D4C6",
          400: "#9AC2AE",
          500: "#81B29A",
          600: "#6FA088",
          700: "#5C8C74",
        },
        butter: {
          100: "#FEF7EC",
          200: "#FCF0DC",
          300: "#FAE6C4",
          400: "#F6D9A8",
          500: "#F2CC8F",
          600: "#E9B86A",
        },
        oat: {
          white: "#FFFFFF",
          100: "#FAF7F0",
          200: "#F3EAD9",
          300: "#EFE6D6",
        },
        charcoal: {
          300: "#8C8FA3",
          500: "#5B5E78",
          700: "#3D405B",
          900: "#2B2D40",
        },
        alert: "#D97455",
        
        // Semantic aliases
        primary: {
          DEFAULT: "var(--color-primary, #E07A5F)",
          hover: "var(--color-primary-hover, #CF6A4C)",
          press: "var(--color-primary-press, #B95A40)",
        },
        secondary: "var(--color-secondary, #81B29A)",
        accent: "var(--color-accent, #F2CC8F)",
        surface: {
          app: "var(--surface-app, #FAF7F0)",
          card: "var(--surface-card, #FFFFFF)",
          sunken: "var(--surface-sunken, #F3EAD9)",
        },
        text: {
          strong: "var(--text-strong, #2B2D40)",
          body: "var(--text-body, #3D405B)",
          muted: "var(--text-muted, #5B5E78)",
          faint: "var(--text-faint, #8C8FA3)",
          "on-primary": "var(--text-on-primary, #FFFFFF)",
          link: "var(--text-link, #CF6A4C)",
        },
        border: {
          soft: "var(--border-soft, #EFE6D6)",
          input: "var(--border-input, #F3EAD9)",
          focus: "var(--border-focus, #E89379)",
        },
      },
      fontFamily: {
        display: ["'Fredoka'", "'Nunito'", "ui-rounded", "system-ui", "sans-serif"],
        rounded: ["'Nunito'", "ui-rounded", "system-ui", "sans-serif"],
        body: ["'Nunito'", "ui-rounded", "system-ui", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        card: "20px",
        pill: "9999px",
      },
      boxShadow: {
        cozy: "0 4px 20px rgba(91, 74, 66, 0.08)",
        "cozy-sm": "0 2px 10px rgba(91, 74, 66, 0.06)",
        "cozy-lg": "0 10px 34px rgba(91, 74, 66, 0.14)",
        press: "inset 0 2px 6px rgba(91, 74, 66, 0.12)",
      },
      transitionTimingFunction: {
        cozy: "cubic-bezier(0.22, 0.61, 0.36, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },
      ringColor: {
        primary: "var(--ring-primary, rgba(224, 122, 95, 0.32))",
        sage: "var(--ring-sage, rgba(129, 178, 154, 0.4))",
      },
      ringWidth: {
        3: "3px",
      },
      transitionDuration: {
        120: "120ms",
      },
    },
  },
  plugins: [],
};

