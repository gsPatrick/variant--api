const sequelize = require('../../config/database');
const { User, Farm, Plot } = require('../../models');
const AppError = require('../../utils/app-error');
const { hashPassword } = require('../../utils/password');
const { USER_ROLES } = require('../../config/constants');
const { validateOnboardingPayload } = require('./onboarding.validator');

// Valida + normaliza o payload. Lanca 400 com a lista de campos invalidos.
function assemblePlan(payload) {
  const { valid, errors, normalized } = validateOnboardingPayload(payload);
  if (!valid) {
    const error = new AppError('Dados do cadastro invalidos.', 400, 'VALIDATION_ERROR');
    error.details = errors;
    throw error;
  }
  return normalized;
}

// Resumo do que sera criado (sem expor a senha) — usado pelo preview.
function summarizePlan(plan) {
  return {
    mode: plan.mode,
    cliente: plan.cliente.isExisting
      ? { tipo: 'existente', id: plan.cliente.id }
      : {
          tipo: 'novo',
          name: plan.cliente.name,
          email: plan.cliente.email,
          document: plan.cliente.document,
          phone: plan.cliente.phone,
        },
    projeto: {
      name: plan.projeto.name,
      city: plan.projeto.city,
      state: plan.projeto.state,
      totalAreaHa: plan.projeto.totalAreaHa,
    },
    informacoes: {
      totalTalhoes: plan.informacoes.plots.length,
      talhoes: plan.informacoes.plots.map((p) => ({ name: p.name, areaHa: p.areaHa })),
    },
  };
}

// Verifica conflitos que dependem do banco SEM lancar — usado pelo preview
// para alimentar o modal passo-a-passo com pendencias resolviveis.
async function collectConflicts(plan) {
  const issues = [];

  if (plan.cliente.isExisting) {
    const existing = await User.findByPk(plan.cliente.id);
    if (!existing) {
      issues.push({ code: 'CLIENT_NOT_FOUND', field: 'cliente.id', message: 'Cliente informado nao existe.' });
    } else if (existing.role !== USER_ROLES.PRODUCER) {
      issues.push({ code: 'CLIENT_NOT_PRODUCER', field: 'cliente.id', message: 'O usuario informado nao e um produtor.' });
    }
  } else {
    const taken = await User.findOne({ where: { email: plan.cliente.email } });
    if (taken) {
      issues.push({ code: 'EMAIL_ALREADY_USED', field: 'cliente.email', message: 'Ja existe um usuario com este email.' });
    }
  }

  return issues;
}

// Modo confirmacao: valida tudo e devolve o resumo + pendencias, SEM gravar.
async function preview(payload) {
  const plan = assemblePlan(payload);
  const issues = await collectConflicts(plan);
  return {
    canCreate: issues.length === 0,
    issues,
    resumo: summarizePlan(plan),
  };
}

// Resolve o produtor dentro da transacao (existente ou novo), aplicando as
// mesmas regras de conflito de forma estrita (lancando erro).
async function resolveProducer(plan, transaction) {
  if (plan.cliente.isExisting) {
    const existing = await User.findByPk(plan.cliente.id, { transaction });
    if (!existing) {
      throw new AppError('Cliente informado nao existe.', 404, 'CLIENT_NOT_FOUND');
    }
    if (existing.role !== USER_ROLES.PRODUCER) {
      throw new AppError('O usuario informado nao e um produtor.', 422, 'CLIENT_NOT_PRODUCER');
    }
    return { producer: existing, created: false };
  }

  // Pre-checa o email para devolver 409 amigavel (a constraint unica do banco
  // continua sendo a garantia final contra corrida).
  const taken = await User.findOne({ where: { email: plan.cliente.email }, transaction });
  if (taken) {
    throw new AppError('Ja existe um usuario com este email.', 409, 'EMAIL_ALREADY_USED');
  }

  const passwordHash = await hashPassword(plan.cliente.password);
  const producer = await User.create(
    {
      name: plan.cliente.name,
      email: plan.cliente.email,
      passwordHash,
      role: USER_ROLES.PRODUCER,
      document: plan.cliente.document,
      phone: plan.cliente.phone,
    },
    { transaction }
  );
  return { producer, created: true };
}

// Projeta o produtor sem campos sensiveis.
function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// Modo automatico / confirmacao final: cria cliente (se novo) + projeto +
// talhoes de forma atomica. Se qualquer passo falhar, nada e persistido.
async function execute(payload) {
  const plan = assemblePlan(payload);

  return sequelize.transaction(async (transaction) => {
    const { producer, created } = await resolveProducer(plan, transaction);

    const farm = await Farm.create(
      {
        producerId: producer.id,
        name: plan.projeto.name,
        city: plan.projeto.city,
        state: plan.projeto.state,
        totalAreaHa: plan.projeto.totalAreaHa,
        centroidLat: plan.projeto.centroidLat,
        centroidLng: plan.projeto.centroidLng,
      },
      { transaction }
    );

    const plots = [];
    for (const plotData of plan.informacoes.plots) {
      // Criado sequencialmente para preservar a ordem informada no payload.
      // eslint-disable-next-line no-await-in-loop
      const plot = await Plot.create(
        {
          farmId: farm.id,
          name: plotData.name,
          areaHa: plotData.areaHa,
          geometry: plotData.geometry,
          kmlFilename: plotData.kmlFilename,
          centroidLat: plotData.centroidLat,
          centroidLng: plotData.centroidLng,
        },
        { transaction }
      );
      plots.push(plot);
    }

    return {
      mode: plan.mode,
      clienteCriado: created,
      cliente: toPublicUser(producer),
      projeto: farm,
      talhoes: plots,
    };
  });
}

module.exports = { preview, execute };
