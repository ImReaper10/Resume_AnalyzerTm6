import { render, screen } from '@testing-library/react';
import App from './App';
import { setMocking } from './utils/networkmanager.js';
import userEvent from '@testing-library/user-event'

class MockLocalStorage {
  constructor() {
      this.store = {};
  }

  getItem(key) {
      return this.store[key] || null;
  }

  setItem(key, value) {
      this.store[key] = value.toString();
  }

  removeItem(key) {
      delete this.store[key];
  }

  clear() {
      this.store = {};
  }

  key(index) {
      const keys = Object.keys(this.store);
      return keys[index] || null;
  }

  get length() {
      return Object.keys(this.store).length;
  }
}

Object.defineProperty(window, "localStorage", { value: new MockLocalStorage() });

test('Logging in', async () => {
  //localStorage.clear();
  setMocking(true);
  render(<App />);
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  userEvent.type(emailInput, "mock@mock.com");
  userEvent.type(passwordInput, "mockPass#");
  const loginButton = screen.getAllByText("Login");
  userEvent.click(loginButton[1])
  await new Promise((res) => {
    setTimeout(() => {
      expect(!!localStorage.getItem("jwt")).toEqual(true)
      res()
    }, 1000);
  });
});
