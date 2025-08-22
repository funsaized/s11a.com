/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/templates/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "720px",
            color: theme("colors.foreground"),
            lineHeight: "1.7",
            fontSize: "18px",
            "h1, h2, h3, h4": {
              fontWeight: "600",
              color: theme("colors.foreground"),
            },
            h1: {
              color: theme("colors.foreground"),
            },
            h2: {
              color: theme("colors.foreground"),
            },
            h3: {
              color: theme("colors.foreground"),
            },
            h4: {
              color: theme("colors.foreground"),
            },
            p: {
              color: theme("colors.foreground"),
            },
            a: {
              color: theme("colors.primary.DEFAULT"),
              "&:hover": {
                color: theme("colors.primary.DEFAULT"),
                opacity: "0.8",
              },
            },
            strong: {
              color: theme("colors.foreground"),
            },
            blockquote: {
              color: theme("colors.muted.foreground"),
              borderLeftColor: theme("colors.border"),
            },
            code: {
              backgroundColor: theme("colors.muted.DEFAULT"),
              color: theme("colors.foreground"),
              padding: "0.25rem 0.375rem",
              borderRadius: "0.25rem",
              fontSize: "0.875em",
            },
            "code::before": {
              content: '""',
            },
            "code::after": {
              content: '""',
            },
            pre: {
              backgroundColor: theme("colors.muted.DEFAULT"),
              color: theme("colors.foreground"),
            },
            thead: {
              borderBottomColor: theme("colors.border"),
            },
            "thead th": {
              color: theme("colors.foreground"),
            },
            "tbody tr": {
              borderBottomColor: theme("colors.border"),
            },
            "tbody td": {
              color: theme("colors.foreground"),
            },
            hr: {
              borderColor: theme("colors.border"),
            },
            "ol > li::marker": {
              color: theme("colors.muted.foreground"),
            },
            "ul > li::marker": {
              color: theme("colors.muted.foreground"),
            },
            "li::marker": {
              color: theme("colors.muted.foreground"),
            },
            figcaption: {
              color: theme("colors.muted.foreground"),
            },
          },
        },
      }),
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: "0",
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: "1",
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
