import { ArrowRight, LucideIcon } from 'lucide-react';

export type Program = { title: string; description: string; icon: LucideIcon; image: string };

export function ProgramCard({ program }: { program: Program }) {
  const { title, description, icon: Icon, image } = program;
  return (
    <a className="program-card" href="#contacts" aria-label={title}>
      <img src={image} alt={title} loading="lazy" />
      <div className="card-shade" />
      <div className="card-content">
        <div className="card-icon"><Icon size={24} /></div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowRight className="card-arrow" size={24} />
    </a>
  );
}
