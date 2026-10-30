export type Service = {
  number: string;
  icon: string;
  title: string;
  description: string;
  tags: string[];
};

export type Project = {
  name: string;
  category: string;
  description: string;
  palette: string;
  mark: string;
  tags: string[];
};

export const services: Service[] = [
  { number: "01", icon: "↗", title: "Web design & development", description: "Fast, accessible websites that make a great first impression and turn visitors into customers.", tags: ["Next.js", "Webflow", "E-commerce"] },
  { number: "02", icon: "✳", title: "Digital strategy", description: "A clear digital roadmap that connects your business goals with the people you want to reach.", tags: ["Discovery", "SEO", "Content"] },
  { number: "03", icon: "◉", title: "Brand & experience", description: "A distinctive visual identity and seamless user experience that make your business memorable.", tags: ["Identity", "UI/UX", "Design systems"] },
  { number: "04", icon: "⌘", title: "Custom applications", description: "Useful, intuitive web applications that simplify complex workflows and create new possibilities.", tags: ["Web apps", "Integrations", "Automation"] },
  { number: "05", icon: "◎", title: "Growth & optimisation", description: "Practical improvements to search visibility, conversion and performance—guided by real data.", tags: ["SEO", "Analytics", "CRO"] },
  { number: "06", icon: "⟲", title: "Ongoing support", description: "A reliable digital partner to keep your site secure, current and ready for what comes next.", tags: ["Maintenance", "Hosting", "Support"] },
];

export const projects: Project[] = [
  { name: "Forma Studio", category: "Brand & web", description: "A warm, editorial home for an independent architecture practice.", palette: "forma", mark: "F.", tags: ["Identity", "Web design", "Development"] },
  { name: "Fieldnotes", category: "E-commerce", description: "A considered digital storefront for everyday essentials, made to last.", palette: "fieldnotes", mark: "fieldnotes®", tags: ["Strategy", "E-commerce", "Art direction"] },
  { name: "Northline", category: "Digital product", description: "A clear and confident platform for a new generation of urban mobility.", palette: "northline", mark: "NORTHLINE", tags: ["Product design", "Web app", "Prototyping"] },
  { name: "Common Ground", category: "Brand & web", description: "A bright, welcoming identity and digital presence for a neighbourhood café.", palette: "common", mark: "common\\nground", tags: ["Identity", "Storytelling", "Web design"] },
];

export const projectFilters = ["All", "Brand & web", "E-commerce", "Digital product"];
