type CallbackCtaProps = {
  headingId: string;
  onOpen: () => void;
};

export function CallbackCta({ headingId, onOpen }: CallbackCtaProps) {
  return (
    <section className="callback-cta container" aria-labelledby={headingId}>
      <div>
        <p className="eyebrow">ХОЧЕШЬ НАЧАТЬ?</p>
        <h2 id={headingId}>ЗАКАЖИ ОБРАТНЫЙ ЗВОНОК</h2>
      </div>
      <button className="callback-cta-button" type="button" onClick={onOpen}>
        ЗАКАЗАТЬ ОБРАТНЫЙ ЗВОНОК
      </button>
    </section>
  );
}
