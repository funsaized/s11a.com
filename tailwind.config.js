/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,jsx,ts,tsx}",
    "./src/components/**/*.{js,jsx,ts,tsx}",
    "./src/templates/**/*.{js,jsx,ts,tsx}",
    "./src/layout/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		screens: {
  			xs: '480px',
  			sm: '600px',
  			md: '800px',
  			lg: '1000px',
  			xl: '1200px'
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		fontFamily: {
  			sans: [
  				'Inter Variable',
  				'Inter',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'Helvetica Neue',
  				'Arial',
  				'sans-serif'
  			],
  			serif: [
  				'Georgia',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			mono: [
  				'JetBrains Mono Variable',
  				'JetBrains Mono',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(40px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(40px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-in-left': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-40px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'scale-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.9)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'bounce-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.3)'
  				},
  				'50%': {
  					opacity: '0.9',
  					transform: 'scale(1.05)'
  				},
  				'70%': {
  					opacity: '1',
  					transform: 'scale(0.98)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'shimmer': {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			'glow': {
  				'0%, 100%': {
  					opacity: '0.6',
  					transform: 'scale(1)'
  				},
  				'50%': {
  					opacity: '1',
  					transform: 'scale(1.02)'
  				}
  			},
  			'float': {
  				'0%, 100%': {
  					transform: 'translateY(0px)'
  				},
  				'50%': {
  					transform: 'translateY(-6px)'
  				}
  			},
  			'wobble': {
  				'0%, 100%': {
  					transform: 'rotate(0deg)'
  				},
  				'15%': {
  					transform: 'rotate(-1deg)'
  				},
  				'30%': {
  					transform: 'rotate(1deg)'
  				},
  				'45%': {
  					transform: 'rotate(-0.5deg)'
  				},
  				'60%': {
  					transform: 'rotate(0.5deg)'
  				},
  				'75%': {
  					transform: 'rotate(-0.25deg)'
  				}
  			},
  			'ripple': {
  				'0%': {
  					transform: 'scale(0)',
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'scale(4)',
  					opacity: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-in-up': 'fade-in-up 0.6s ease-out',
  			'slide-in-right': 'slide-in-right 0.5s ease-out',
  			'slide-in-left': 'slide-in-left 0.5s ease-out',
  			'scale-in': 'scale-in 0.3s ease-out',
  			'bounce-in': 'bounce-in 0.6s ease-out',
  			'shimmer': 'shimmer 2s linear infinite',
  			'glow': 'glow 2s ease-in-out infinite',
  			'float': 'float 3s ease-in-out infinite',
  			'wobble': 'wobble 0.8s ease-in-out',
  			'ripple': 'ripple 0.6s linear'
  		},
  		typography: {
  			DEFAULT: {
  				css: {
  					maxWidth: 'none',
  					color: 'hsl(var(--foreground))',
  					fontFamily: 'Georgia", "Times New Roman", "Times", serif',
  					lineHeight: '1.7',
  					'.lead': {
  						color: 'hsl(var(--muted-foreground))'
  					},
  					a: {
  						color: 'hsl(var(--primary))',
  						textDecoration: 'underline',
  						fontWeight: '500'
  					},
  					strong: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600'
  					},
  					'li::marker': {
  						color: 'hsl(var(--muted-foreground))'
  					},
  					hr: {
  						borderColor: 'hsl(var(--border))',
  						borderTopWidth: 1
  					},
  					blockquote: {
  						fontWeight: '500',
  						fontStyle: 'italic',
  						color: 'hsl(var(--foreground))',
  						borderLeftWidth: '0.25rem',
  						borderLeftColor: 'hsl(var(--border))',
  						quotes: '\\\\201C""\\\\201D""\\\\2018""\\\\2019"'
  					},
  					h1: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '800'
  					},
  					h2: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '700',
  						paddingBottom: '0.5rem',
  						borderBottomWidth: '1px',
  						borderBottomColor: 'hsl(var(--border))',
  						marginBottom: '1.5rem'
  					},
  					h3: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  						paddingBottom: '0.5rem',
  						borderBottomWidth: '1px',
  						borderBottomColor: 'hsl(var(--border))',
  						marginBottom: '1.5rem'
  					},
  					h4: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600'
  					},
  					'figure figcaption': {
  						color: 'hsl(var(--muted-foreground))'
  					},
  					code: {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '500',
  						fontSize: '0.875em',
  						backgroundColor: 'hsl(var(--muted))',
  						paddingLeft: '0.25rem',
  						paddingRight: '0.25rem',
  						paddingTop: '0.125rem',
  						paddingBottom: '0.125rem',
  						borderRadius: '0.25rem'
  					},
  					'a code': {
  						color: 'hsl(var(--primary))'
  					},
  					p: {
  						marginBottom: '1.5rem',
  						lineHeight: '1.8'
  					},
  					pre: {
  						color: 'hsl(var(--foreground))',
  						backgroundColor: 'hsl(var(--muted))',
  						overflowX: 'auto',
  						fontWeight: '400',
  						borderRadius: '0.5rem',
  						boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  						border: '1px solid hsl(var(--border))',
  						marginBottom: '2rem',
  						marginTop: '2rem'
  					},
  					'pre code': {
  						backgroundColor: 'transparent',
  						borderWidth: '0',
  						borderRadius: '0',
  						padding: '0',
  						fontWeight: 'inherit',
  						color: 'inherit',
  						fontSize: 'inherit',
  						fontFamily: 'inherit',
  						lineHeight: 'inherit'
  					},
  					table: {
  						width: '100%',
  						tableLayout: 'auto',
  						textAlign: 'left',
  						marginTop: '2em',
  						marginBottom: '2em',
  						fontSize: '0.875em',
  						lineHeight: '1.7142857'
  					},
  					thead: {
  						borderBottomWidth: '1px',
  						borderBottomColor: 'hsl(var(--border))'
  					},
  					'thead th': {
  						color: 'hsl(var(--foreground))',
  						fontWeight: '600',
  						verticalAlign: 'bottom'
  					},
  					'tbody tr': {
  						borderBottomWidth: '1px',
  						borderBottomColor: 'hsl(var(--border))'
  					},
  					'tbody tr:last-child': {
  						borderBottomWidth: '0'
  					},
  					'tbody td': {
  						verticalAlign: 'baseline'
  					}
  				}
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
}