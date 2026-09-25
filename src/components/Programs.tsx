import { ChevronDown, Dumbbell, Sparkles, UserRound, UsersRound } from 'lucide-react';
import { ProgramCard, Program } from './ProgramCard';

const programs: Program[] = [
  { title: 'ТРЕНАЖЕРНЫЙ ЗАЛ', description: 'Современное оборудование и свободные тренировки без очередей.', icon: Dumbbell, image: 'https://images.pexels.com/photos/4761349/pexels-photo-4761349.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { title: 'МИНИ-ГРУППЫ', description: 'Эффективные тренировки в кругу единомышленников и под контролем тренера.', icon: UsersRound, image: 'https://images.pexels.com/photos/18986400/pexels-photo-18986400.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { title: 'СПЛИТ-ТРЕНИРОВКИ', description: 'Индивидуальный подход в малой группе. Больше внимания и результата.', icon: UserRound, image: 'https://images.pexels.com/photos/5611633/pexels-photo-5611633.jpeg?auto=compress&cs=tinysrgb&w=900' },
  { title: 'ПЕРСОНАЛЬНЫЕ ТРЕНИРОВКИ', description: 'Тренер рядом. Программа под твои цели, ритм и уровень подготовки.', icon: Sparkles, image: 'https://images.pexels.com/photos/30191517/pexels-photo-30191517.jpeg?auto=compress&cs=tinysrgb&w=900' },
];

export function Programs() {
  return (
    <section className="programs container" id="programs">
      <div className="section-heading"><p className="eyebrow">ВЫБЕРИ СВОЙ ФОРМАТ</p><h2>НАЧНИ СЕЙЧАС</h2><ChevronDown size={22} /></div>
      <div className="program-grid">{programs.map((p) => <ProgramCard key={p.title} program={p} />)}</div>
    </section>
  );
}
