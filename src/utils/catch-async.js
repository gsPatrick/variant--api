// Wrapper para handlers async: captura rejeicoes de Promise e encaminha
// ao middleware de erro via next(), evitando try/catch repetido nos controllers.
module.exports = function catchAsync(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
