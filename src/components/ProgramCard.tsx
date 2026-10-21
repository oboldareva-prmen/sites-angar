import { LucideIcon } from 'lucide-react';

export type Program = {
  title: string;
  description: string;
  phrase: string;
  icon: LucideIcon;
  image: string;
  subtitle?: string;
  secondaryDescription?: string;
  promo?: string;
};

export function ProgramCard({ program }: { program: Program }) {
  const {
    title,
    description,
    phrase,
    icon: Icon,
    image,
    subtitle,
    secondaryDescription,
    promo,
  } = program;

  return (
    <a className="program-card" href="#contacts" aria-label={title}>
      <div className="program-image-wrap">
        <img src={image} alt={title} loading="lazy" />
      </div>
      <div className="program-card-content">
        <div className="program-icon"><Icon size={27} strokeWidth={1.5} /></div>
        <h3>{title}</h3>
        <p className="program-description">{description}</p>
        {subtitle && <h4>{subtitle}</h4>}
        {secondaryDescription && <p className="program-secondary-description">{secondaryDescription}</p>}
        {promo && <div className="program-promo">{promo}</div>}
        <p className="program-phrase">{phrase}</p>
      </div>
    </a>
  );
}
