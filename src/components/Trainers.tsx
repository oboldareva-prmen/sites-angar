import { Dumbbell, Leaf, UserRound } from 'lucide-react';

const trainers = [
  {
    name: 'АЛЕКСЕЙ КУЗНЕЦОВ',
    role: 'ГЛАВНЫЙ ТРЕНЕР. КРОССФИТ',
    specialization: 'ФУНКЦИОНАЛЬНЫЙ ТРЕНИНГ, КРОССФИТ, ОБЩАЯ ПОДГОТОВКА',
    description: 'Опыт работы более 10 лет. Помогает достигать целей через силу, дисциплину и грамотную нагрузку. Работает с любым уровнем подготовки.',
    image: '/angar_hero.jpg',
    icon: Dumbbell,
  },
  {
    name: 'МАРИЯ ПЕТРОВА',
    role: 'ТРЕНЕР. ФУНКЦИОНАЛЬНЫЙ ФИТНЕС',
    specialization: 'СНИЖЕНИЕ ВЕСА, ТОНУС, ЗДОРОВАЯ СПИНА, ЖЕНСКИЙ ФИТНЕС',
    description: 'Строго, но с заботой. Помогает женщинам становиться сильнее, увереннее и чувствовать себя лучше. Индивидуальный подход к каждой тренировке.',
    image: '/Personal.jpg',
    icon: UserRound,
  },
  {
    name: 'ДМИТРИЙ САВЕЛЬЕВ',
    role: 'ТРЕНЕР. СИЛОВЫЕ ТРЕНИРОВКИ',
    specialization: 'НАБОР МЫШЕЧНОЙ МАССЫ, СИЛОВЫЕ ТРЕНИРОВКИ, ПОДГОТОВКА К СОРЕВНОВАНИЯМ',
    description: 'Более 8 лет в профессии. Помогает раскрыть потенциал, строить сильное тело и достигать спортивных целей.',
    image: '/gym.jpg',
    icon: Dumbbell,
  },
  {
    name: 'ЕЛЕНА ВАСИЛЬЕВА',
    role: 'ТРЕНЕР. РАСТЯЖКА И МОБИЛЬНОСТЬ',
    specialization: 'РАСТЯЖКА, МОБИЛЬНОСТЬ, ЙОГА, ВОССТАНОВЛЕНИЕ',
    description: 'Помогает улучшить гибкость, снять напряжение и вернуть телу лёгкость. Вдохновляет на осознанное движение и заботу о себе.',
    image: '/Split.jpg',
    icon: Leaf,
  },
];

export function Trainers() {
  return (
    <section className="trainers container" id="trainers">
      <div className="trainers-heading">
        <p className="eyebrow">КОМАНДА, КОТОРАЯ РЯДОМ</p>
        <h2>НАШИ ТРЕНЕРЫ</h2>
      </div>

      <div className="trainers-grid">
        {trainers.map(({ name, role, specialization, description, image, icon: Icon }) => (
          <article className="trainer-card" key={name}>
            <div className="trainer-image-wrap">
              <img src={image} alt="" loading="lazy" />
              <span className="trainer-image-note">ФОТО ТРЕНЕРА БУДЕТ ДОБАВЛЕНО</span>
            </div>
            <div className="trainer-card-content">
              <h3>{name}</h3>
              <p className="trainer-role">{role}</p>
              <div className="trainer-specialization">
                <span className="trainer-icon"><Icon size={25} strokeWidth={1.5} /></span>
                <div>
                  <strong>СПЕЦИАЛИЗАЦИЯ:</strong>
                  <p>{specialization}</p>
                </div>
              </div>
              <div className="trainer-divider" />
              <p className="trainer-description">{description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
