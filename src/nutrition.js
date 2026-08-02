export const SLOT_EN = {
  colazione: "Breakfast",
  primo: "First course",
  secondo: "Main course",
  contorno: "Side",
  spuntino: "Snack",
  dolce: "Dessert",
};

export const SAT_BUDGET = 29 / 4;
export const SALT_BUDGET = 5 / 4;
export const FIBRE_TARGET = 25 / 4;

export function healthScore(saturi_g, fibra_g, sale_g) {
  const satScore = Math.min(10, (SAT_BUDGET / Math.max(saturi_g, 0.3)) * 10);
  const saltScore = Math.min(10, (SALT_BUDGET / Math.max(sale_g, 0.1)) * 10);
  const fibreScore = Math.min(10, (fibra_g / FIBRE_TARGET) * 10);
  return Math.max(0, Math.min(10, (satScore + saltScore + fibreScore) / 3));
}

export function healthExplanation(saturi_g, fibra_g, sale_g, score) {
  const bits = [];
  bits.push(
    saturi_g <= SAT_BUDGET
      ? `saturated fat sits within a per-dish share of the daily budget (${saturi_g}g against ${SAT_BUDGET.toFixed(1)}g)`
      : `saturated fat runs over a per-dish share of the daily budget (${saturi_g}g against ${SAT_BUDGET.toFixed(1)}g)`
  );
  bits.push(
    fibra_g >= FIBRE_TARGET
      ? `fibre meets the reference target (${fibra_g}g against ${FIBRE_TARGET.toFixed(1)}g)`
      : `fibre falls short of the reference target (${fibra_g}g against ${FIBRE_TARGET.toFixed(1)}g)`
  );
  bits.push(
    sale_g <= SALT_BUDGET
      ? `salt stays under the reference share (${sale_g}g against ${SALT_BUDGET.toFixed(1)}g)`
      : `salt goes over the reference share (${sale_g}g against ${SALT_BUDGET.toFixed(1)}g)`
  );
  return `Scores ${score.toFixed(1)} because ${bits.join(", ")}.`;
}

export function transformDay(giorno) {
  const main = giorno.pasti.find((p) => p.slot === "secondo") || giorno.pasti[0];
  const score = healthScore(main.saturi_g, main.fibra_g, main.sale_g);
  const tradotto = Boolean(main.piatto_en && main.passaggi_en);
  return {
    day: giorno.giorno,
    dish: tradotto ? main.piatto_en : main.piatto,
    slot: main.slot,
    kcal: main.kcal,
    saturi_g: main.saturi_g,
    fibra_g: main.fibra_g,
    sale_g: main.sale_g,
    time: main.prep_min,
    health: score,
    why: healthExplanation(main.saturi_g, main.fibra_g, main.sale_g, score),
    recipe: tradotto ? main.passaggi_en : main.passaggi || [],
    translated: tradotto,
  };
}