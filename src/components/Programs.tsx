import { Dumbbell, UsersRound, UserRoundCheck } from 'lucide-react';

import { ProgramCard, Program } from './ProgramCard';

const programs: Program[] = [
  {
    title: 'ПЕРСОНАЛЬНЫЕ И СПЛИТ-ТРЕНИРОВКИ',
    description: 'Индивидуальный подход под наблюдением тренера. Мягкий вход в спорт после травм, операций, ОВЗ. Или если просто хочется полного внимания тренера',
    phrase: 'Твой результат — в надёжных руках!',
    icon: UserRoundCheck,
    image: '/Personal.jpg',
  },
  {
    title: 'МИНИ-ГРУППЫ',
    description: 'Уникальный формат групповых тренировок в группах до 3–6 человек, где вы получаете преимущества персональной тренировки и плюсы дружной поддерживающей командной работы',
    phrase: 'Вместе — дальше!',
    icon: UsersRound,
    image: '/angar_hero.jpg',
  },
  {
    title: 'ТРЕНАЖЁРНЫЙ ЗАЛ',
    description: 'Современное оборудование и комфортная атмосфера. Свободные тренировки без очередей. Опытные тренеры всегда рядом, чтобы помочь и подсказать',
    phrase: 'Сила в доступности!',
    promo: '20% СКИДКА СТУДЕНТАМ И ПЕНСИОНЕРАМ',
    icon: Dumbbell,
    image: '/gym.jpg',
  },
  {
    title: 'ДЕТСКИЕ НАПРАВЛЕНИЯ',
    description: 'Специальная физическая подготовка — подготовка к любому виду спорта, подготовка к ГТО, общая физическая подготовка',
    subtitle: 'Групповые тренировки',
    secondaryDescription: 'Современный спорт, развивающий силу, выносливость, координацию и уверенность в себе. Дружная атмосфера и опытные тренеры',
    phrase: 'Сильное поколение начинается здесь!',
    icon: UsersRound,
    image: '/ДГ.jpg',
  },
];

export function Programs() {
  return (
       <section className="trainers container" id="trainers">
      <div className="trainers-heading">
        <p className="eyebrow">ЭФФЕКТИВНЫЕ ФОРМАТЫ</p>
        <h2>ПРОГРАММЫ ТРЕНИРОВОК</h2>
      </div>
         <div className="program-grid">
        {programs.map((program) => (
          <ProgramCard key={program.title} program={program} />
        ))}
      </div>
    </section>
  );
}
