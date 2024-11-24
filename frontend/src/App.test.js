import { render, screen } from '@testing-library/react';
import App from './App';
import { setMocking } from './utils/networkmanager.js';

test('Logging in', () => {
  localStorage.clear();
  setMocking(true);
  render(<App />);
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  emailInput.value = "mock@mock.com";
  passwordInput.value = "mockPass#";
  const loginButton = screen.getByAltText("login button");
  loginButton.click();
});
