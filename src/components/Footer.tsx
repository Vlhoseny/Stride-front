import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

/* ─── Column definitions ───────────────────────────── */
const productLinks = [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Changelog", href: "#changelog" },
    { label: "Roadmap", href: "#roadmap" },
];

const resourceLinks = [
    { label: "Documentation", href: "#docs" },
    { label: "API Reference", href: "#api" },
    { label: "Community", href: "#community" },
    { label: "Blog", href: "#blog" },
];

const companyLinks = [
    { label: "About", href: "#about" },
    { label: "Careers", href: "#careers" },
    { label: "Contact", href: "#contact" },
    { label: "Press Kit", href: "#press" },
];

const socialLinks = [
    { icon: Github, href: "#github", label: "GitHub" },
    { icon: Twitter, href: "#twitter", label: "Twitter" },
    { icon: Linkedin, href: "#linkedin", label: "LinkedIn" },
];

/* ─── Footer Column ────────────────────────────────── */
function FooterColumn({ title, links }: { title: string; links: { label: string; href: string }[] }) {
    return (
        <div>
            <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/60 mb-4">
                {title}
            </h4>
            <ul className="space-y-2.5">
                {links.map((link) => (
                    <li key={link.label}>
                        <a
                            href={link.href}
                            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors duration-200"
                        >
                            {link.label}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════
   Premium SaaS Footer — Global
   ═══════════════════════════════════════════════════════ */
export default function Footer() {
    return (
        <footer
            className="
        relative border-t border-border/20
        bg-background/60 backdrop-blur-xl
        before:absolute before:inset-x-0 before:top-0 before:h-px
        before:bg-gradient-to-r before:from-transparent before:via-primary/30 before:to-transparent
      "
        >
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* ── Main grid ────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-10 py-14">
                    {/* Branding column — spans 2 cols on md */}
                    <div className="col-span-2">
                        <Link to="/" className="inline-flex items-center gap-2.5 group mb-4">
                            <img
                                src="/stride-logo.webp"
                                alt="STRIDE"
                                className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
                            />
                            <span className="text-lg font-extrabold tracking-tight text-foreground">
                                STRIDE
                            </span>
                        </Link>
                        <p className="text-[13px] text-muted-foreground max-w-xs leading-relaxed mb-6">
                            High-performance glassmorphic project management.
                            Plan smarter, ship faster, collaborate beautifully.
                        </p>
                        {/* Social icons */}
                        <div className="flex items-center gap-3">
                            {socialLinks.map((s) => (
                                <a
                                    key={s.label}
                                    href={s.href}
                                    aria-label={s.label}
                                    className="
                    w-9 h-9 rounded-xl grid place-items-center
                    bg-foreground/[0.04] hover:bg-foreground/[0.08]
                    text-muted-foreground hover:text-foreground
                    transition-all duration-200
                  "
                                >
                                    <s.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    <FooterColumn title="Product" links={productLinks} />
                    <FooterColumn title="Resources" links={resourceLinks} />
                    <FooterColumn title="Company" links={companyLinks} />
                </div>

                {/* ── Divider ──────────────────────────────── */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-border/40 to-transparent" />

                {/* ── Bottom bar ───────────────────────────── */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6">
                    <p className="text-[12px] text-muted-foreground/50">
                        &copy; {new Date().getFullYear()} STRIDE. All rights reserved.
                    </p>
                    <div className="flex items-center gap-5 text-[12px] text-muted-foreground/40">
                        <a href="#privacy" className="hover:text-muted-foreground transition-colors">Privacy</a>
                        <span className="w-px h-3 bg-border/30" />
                        <a href="#terms" className="hover:text-muted-foreground transition-colors">Terms</a>
                        <span className="w-px h-3 bg-border/30" />
                        <span className="inline-flex items-center gap-1">
                            Made with <Heart className="w-3 h-3 text-rose-500/60 fill-rose-500/60" /> by STRIDE team
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
