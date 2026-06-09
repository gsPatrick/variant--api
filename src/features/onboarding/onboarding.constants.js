// Modos do cadastro guiado.
// - automatico: cria assim que os dados sao validados (front aplica direto).
// - confirmacao (padrao): front mostra o passo-a-passo e usa /preview antes
//   de confirmar; a criacao so acontece quando o usuario confirma no final.
const ONBOARDING_MODES = Object.freeze({
  AUTO: 'automatico',
  CONFIRMATION: 'confirmacao',
});

// Tamanho minimo da senha definida para o cliente novo.
const MIN_PASSWORD_LENGTH = 6;

module.exports = {
  ONBOARDING_MODES,
  ONBOARDING_MODE_VALUES: Object.values(ONBOARDING_MODES),
  MIN_PASSWORD_LENGTH,
};
