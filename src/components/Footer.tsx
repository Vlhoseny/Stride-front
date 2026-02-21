import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin } from "lucide-react";

const socials = [
    { icon: Github, href: "#github", label: "GitHub" },
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
];

/* ═══════════════════════════════════════════════════════
   Minimalist Footer — Silk & Glass Design System
   ═══════════════════════════════════════════════════════ */
export default function Footer() {
    return (
        <footer
            className="
                relative mt-auto
                border-t border-white/[0.08] dark:border-white/[0.06]
                bg-white/[0.45] dark:bg-white/[0.02]
                backdrop-blur-lg
                before:absolute before:inset-x-0 before:top-0 before:h-px
                before:bg-gradient-to-r before:from-transparent before:via-primary/20 before:to-transparent
            "
        >
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Logo + Copyright */}
                    <div className="flex items-center gap-2.5">
                        <Link to="/" className="flex items-center gap-2 shrink-0">
                            <img
                                src="/stride-logo.webp"
                                alt="STRIDE"
                                className="w-6 h-6 object-contain"
                            />
                            <span className="text-[14px] font-extrabold tracking-tight text-foreground">
                                STRIDE
                            </span>
                        </Link>
                        <span className="text-[12px] text-muted-foreground/40 hidden sm:inline">·</span>
                        <p className="text-[12px] text-muted-foreground/40 hidden sm:inline">
                            &copy; {new Date().getFullYear()} Stride
                        </p>
                    </div>

                    {/* Social icons */}
                    <div className="flex items-center gap-2">
                        {socials.map((s) => (
                            <a
                                key={s.label}
                                href={s.href}
                                aria-label={s.label}
                                className="
                                    w-8 h-8 rounded-xl grid place-items-center
                                    text-muted-foreground/50 hover:text-foreground
                                    hover:bg-foreground/[0.05] dark:hover:bg-white/[0.06]
                                    transition-all duration-200
                                "
                            >
                                <s.icon className="w-4 h-4" />
                            </a>
                        ))}
                    </div>

                    {/* Mobile copyright (shown below on small screens) */}
                    <p className="text-[11px] text-muted-foreground/40 sm:hidden">
                        &copy; {new Date().getFullYear()} Stride
                    </p>
                </div>
            </div>
        </footer>
    );
}
