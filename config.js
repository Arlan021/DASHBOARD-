// ==========================================
// LISTA DE TOKENS VÁLIDOS (EDITE AQUI)
// ==========================================
const TOKENS_VALIDOS = [
    "arlan",
    "TOKEN-CLIENTE-01",
    "TOKEN-CLIENTE-02",
    "123456"
];

// Função para verificar se o token inserido é válido
function verificarTokenValido(token) {
    return TOKENS_VALIDOS.includes(token);
}