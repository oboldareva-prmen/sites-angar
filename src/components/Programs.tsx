
import {
  ArrowRight,
  Dumbbell,
  Target,
  UserRoundCheck,
  Users,
} from 'lucide-react';

import { ProgramCard, Program } from './ProgramCard';

const programs: Program[] = [
  {
    title: 'ТРЕНАЖЕРНЫЙ ЗАЛ',
    description: 'Современное оборудование и свободные тренировки без очередей.',
    icon: Dumbbell,
    image: '/miniGr.jpg',
  },
  {
    title: 'МИНИ-ГРУППЫ',
    description: 'Эффективные тренировки в кругу единомышленников и под контролем тренера.',
    icon: Users,
    image: '/miniGr.jpg',
  },
  {
    title: 'СПЛИТ-ТРЕНИРОВКИ',
    description: 'Индивидуальный подход в малой группе. Больше внимания и результата.',
    icon: UserRoundCheck,
    image: '/Split.jpg',
  },
  {
    title: 'ПЕРСОНАЛЬНЫЕ ТРЕНИРОВКИ',
    description: 'Тренер рядом. Программа под твои цели, ритм и уровень подготовки.',
    icon: Target,
    image: '/Personal.jpg',
  },
];

export function Programs() {
  return (
    <section className="programs container" id="programs">
      <div className="program-grid">
        {programs.map((p) => (
          <ProgramCard key={p.title} program={p} />
        ))}
      </div>

      <a className="primary-button programs-button" href="#programs">
  ВЫБРАТЬ ПРОГРАММУ <ArrowRight size={20} />
</a>
    </section>
  );
}

