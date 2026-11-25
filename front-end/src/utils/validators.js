const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/[^\s.]+\.[^\s]+$/i;
const MIN_PASSWORD_LENGTH = 6;

export const ROLES = ['BUYER', 'SELLER'];

export function parsePrice(text) {
  const normalized = String(text).trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return NaN;
  return Number(normalized);
}

function onlyErrors(messages) {
  return Object.fromEntries(Object.entries(messages).filter(([, message]) => message));
}

const required = (value, message) => (value.trim() ? '' : message);

function emailError(email) {
  if (!email.trim()) return 'Informe o e-mail.';
  return EMAIL_PATTERN.test(email.trim()) ? '' : 'E-mail inválido.';
}

function newPasswordError(password) {
  if (!password) return 'Informe a senha.';
  return password.length < MIN_PASSWORD_LENGTH
    ? `A senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres.`
    : '';
}

function confirmPasswordError(confirmPassword, password) {
  if (!confirmPassword) return 'Confirme a senha.';
  return confirmPassword === password ? '' : 'As senhas não coincidem.';
}

function priceError(price) {
  if (!price.trim()) return 'Informe o preço.';
  const value = parsePrice(price);
  return Number.isNaN(value) || value <= 0 ? 'Preço inválido. Use um valor como 19,90.' : '';
}

function linkError(link) {
  if (!link.trim()) return '';
  return URL_PATTERN.test(link.trim()) ? '' : 'Link inválido. Use um endereço como https://meusite.com.';
}

export function validateLogin({ email, password }) {
  return onlyErrors({
    email: required(email, 'Informe o e-mail.'),
    password: password ? '' : 'Informe a senha.',
  });
}

export function validateRegister({ username, email, password, confirmPassword, role }) {
  return onlyErrors({
    username: required(username, 'Informe o nome de usuário.'),
    role: ROLES.includes(role) ? '' : 'Escolha o tipo de conta.',
    email: emailError(email),
    password: newPasswordError(password),
    confirmPassword: confirmPasswordError(confirmPassword, password),
  });
}

export function validateProduct({ title, description, price, image, categoryId }) {
  return onlyErrors({
    categoryId: categoryId ? '' : 'Escolha a categoria.',
    title: required(title, 'Informe o título.'),
    image: image ? '' : 'Escolha a imagem do produto.',
    description: required(description, 'Informe a descrição.'),
    price: priceError(price),
  });
}

export function validateProfile({ username, email, link }) {
  return onlyErrors({
    username: required(username, 'Informe o nome de usuário.'),
    email: emailError(email),
    link: linkError(link),
  });
}
