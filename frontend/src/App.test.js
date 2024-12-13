/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import App from './App';
import { setMocking, getUploadedData} from './utils/networkmanager.js';
import userEvent from '@testing-library/user-event'
import * as fs from 'fs';
import exp from 'constants';
import { fail } from 'assert';

//=========== Japjot Bedi amd James Goode ===========
//The below is for mocking the local storage as if in a browser (this is the only way to reliably test it)
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

//The below sets up the mock localStorage
Object.defineProperty(window, "localStorage", { value: new MockLocalStorage() });

//The below sets up some fake credentials to be used for testing
const TEST_EMAIL = "testEmail@test.com";
const TEST_PASS = "testPass123#";
const TEST_USERNAME = "Test User";

//=========== Japjot Bedi amd James Goode ===========
//Tests signing up for a new account, while also testing error checks
test('Sign up page (registering and also checking if proper messages are shown (ex. Insecure password))', async () => {
  setMocking(true);
  render(<App />);
  userEvent.click(screen.getAllByText("Go to Sign Up")[0]);
  await new Promise((res) => {
    setTimeout(() => {
      res()
    }, 500);
  });
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  const confirmPasswordInput = screen.getByPlaceholderText("Confirm password");
  const signUpButton = screen.getAllByText("Sign Up")[1];
  userEvent.type(emailInput, "mock@mock.com");
  userEvent.type(screen.getByPlaceholderText("Username"), TEST_USERNAME);
  userEvent.type(passwordInput, TEST_PASS);
  userEvent.type(confirmPasswordInput, TEST_PASS + "x");
  screen.getByText("Passwords do not match");
  userEvent.clear(confirmPasswordInput);
  userEvent.type(confirmPasswordInput, TEST_PASS);
  try
  {
    screen.getByText("Passwords do not match");
    fail("Should not have got a: \"Passwords do not match\"");
  }
  catch(e) {}
  await new Promise((res) => {
    setTimeout(() => {
      res()
    }, 500);
  });
  userEvent.click(signUpButton);
  await new Promise((res) => {
    setTimeout(() => {
      res()
    }, 500);
  });
  screen.getByText("Email or username already exists");
  userEvent.clear(emailInput);
  userEvent.type(emailInput, TEST_EMAIL);
  userEvent.click(signUpButton);
  await new Promise((res) => {
    setTimeout(() => {
      res()
    }, 500);
  });
  screen.getByText("Sign up successful! Please log in with your new credentials.");
});

//=========== Japjot Bedi amd James Goode ===========
//Tests logging in, while also testing error checks
test('Login page (logging in to an existing account, as well as checking messages)', async () => {
  //localStorage.clear();
  render(<App />);
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  userEvent.type(emailInput, "mock@mock.com");
  userEvent.type(passwordInput, "mockPass");
  const loginButton = screen.getAllByText("Login");
  userEvent.click(loginButton[1])
  await new Promise((res) => {
    setTimeout(() => {
      res()
    }, 500);
  });
  screen.getByText("Invalid email or password");
  userEvent.clear(emailInput);
  userEvent.clear(passwordInput);
  userEvent.type(emailInput, "mmock@mock.com");
  userEvent.type(passwordInput, "mockPass#");
  userEvent.click(loginButton[1]);
  await new Promise((res) => {
    setTimeout(() => {
      res()
    }, 500);
  });
  screen.getByText("Invalid email or password");
  userEvent.clear(emailInput);
  userEvent.type(emailInput, "mock@mock.com");
  userEvent.click(loginButton[1]);
  await new Promise((res) => {
    setTimeout(() => {
      expect(!!localStorage.getItem("jwt")).toEqual(true)
      res()
    }, 1000);
  });
});

jest.setTimeout(10000);

//=========== Japjot Bedi amd James Goode ===========
//Tests uploading a resume and browsing the dashboard after
test('Uploading valid resume (after trying invalid files) and uploading job description (after trying invalid descriptions (ex. too long))', async () => {
  render(<App />);
  const fileInput = screen.getByLabelText("Select Resume (PDF/DOCX):");
  const jobDescriptionInput = screen.getByLabelText("Job Description:");
  userEvent.upload(fileInput, new File([fs.readFileSync("../tests/test-files/invalid-file.txt")], "mypdf.pdf", { type: "text/plain" })); //Meaning a fake pdf
  userEvent.type(jobDescriptionInput, "Some job description");
  expect(document.getElementsByClassName("character-count")[0].innerHTML.trim()==="20 characters").toEqual(true);
  screen.getByText("Invalid file type. Only PDF or DOCX files are allowed.");
  userEvent.upload(fileInput, new File([fs.readFileSync("../tests/test-files/large-file.pdf")], "mypdf2.pdf", { type: "application/pdf" }));
  screen.getByText("File size exceeds the limit of 2MB.");
  userEvent.upload(fileInput, new File([fs.readFileSync("../tests/test-files/large-docx.docx")], "resume.docx", { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }));
  screen.getByText("File size exceeds the limit of 2MB.");
  userEvent.upload(fileInput, new File([fs.readFileSync("../tests/test-files/valid-pdf.pdf")], "mypdf3.pdf", { type: "application/pdf" }));
  try
  {
    screen.getByText("File size exceeds the limit of 2MB.");
    fail("Should not have got a: \"File size exceeds the limit of 2MB.\"");
  }
  catch(e) {}
  try
  {
    screen.getByText("Invalid file type. Only PDF or DOCX files are allowed.");
    fail("Should not have got a: \"Invalid file type. Only PDF or DOCX files are allowed.\"");
  }
  catch(e) {}
  userEvent.click(screen.getByText("Upload"));
  await new Promise((res, err) => {
    setTimeout(() => {
      res();
    }, 500)
  });
  screen.getByText("Loading...");
  await new Promise((res, err) => {
    setTimeout(async () => {
      let data = await getUploadedData();
      expect(data.data.resumeText).toEqual("Mock resume text")
      expect(data.data.jobDescription).toEqual("Some job description")
      screen.getByText("Resume Fit Score");
      let viewUploadedData = screen.getByText("View uploaded data");
      userEvent.click(viewUploadedData);
      await new Promise((res2) => {
        setTimeout(async () => {
          screen.getByText("Mock resume text");
          screen.getByText("Some job description");
          res2();
        }, 1000);
      });
      try
      {
        let viewKeywords = screen.getByText("Keywords");
        userEvent.click(viewKeywords);
        await new Promise((res2) => {
          setTimeout(async () => {
            screen.getByText("Matched Skills and Keywords");
            screen.getByText("Java");
            screen.getByText("Python");
            screen.getByText("Spring Boot");
            res2()
          },500);
        });
      }
      catch(e)
      {
        err(e);
      }
      try
      {
        let viewSuggestions = screen.getByText("Suggestions");
        userEvent.click(viewSuggestions);
        await new Promise((res2) => {
          setTimeout(async () => {
            screen.getByText("Improvement Suggestions");
            screen.getByText("Add more emphasis on familiarity with NoSQL databases, as it is mentioned in the job description.");
            screen.getByText("Highlight any experience with cloud platforms other than AWS, such as Azure or GCP, to align with the job requirements.");
            let dropdown = document.getElementsByClassName("filter-dropdown")[0];
            userEvent.selectOptions(dropdown, "Skills");
            try
            {
              screen.getByText("Highlight any experience with cloud platforms other than AWS, such as Azure or GCP, to align with the job requirements.");
              fail();
            }
            catch(e){}
            screen.getByText("Include specific mentions of problem-solving skills or examples that demonstrate these abilities.");
            res2()
          },500);
        });
        let viewFitScore = screen.getByText("Fit Score");
        userEvent.click(viewFitScore);
        await new Promise((res2) => {
          setTimeout(async () => {
            screen.getByText("85%");
            screen.getByText("Download PDF Report");
            res2()
          },500);
        });
      }
      catch(e)
      {
        err(e);
      }
      res()
    }, 2100);
  });
});

//=========== Japjot Bedi amd James Goode ===========
//Tests signing out
test('Signing out', async () => {
  render(<App />);
  await new Promise((res, err) => {
    setTimeout(async () => {
      try
      {
        userEvent.click(screen.getByText("Sign Out"));
      }
      catch(e)
      {
        err(e)
        return;
      }
      res();
    },500);
  });
  render(<App />); //Basically refresh the page
  await new Promise((res, err) => {
    setTimeout(async () => {
      try
      {
        expect(screen.getAllByText("Login").length).toEqual(2);
      }
      catch(e)
      {
        err(e)
        return;
      }
      res();
    },500);
  });
});

//=========== Japjot Bedi amd James Goode ===========
//Tests logging in with the account created in the first test
test('Login with different account', async () => {
  render(<App />);
  const emailInput = screen.getByPlaceholderText("Email");
  const passwordInput = screen.getByPlaceholderText("Password");
  userEvent.type(emailInput, TEST_EMAIL);
  userEvent.type(passwordInput, TEST_PASS);
  const loginButton = screen.getAllByText("Login");
  userEvent.click(loginButton[1])
  await new Promise((res) => {
    setTimeout(() => {
      expect(!!localStorage.getItem("jwt")).toEqual(true)
      res()
    }, 1000);
  });
  expect(document.body.getElementsByClassName("username-placeholder")[0].innerHTML).toEqual(TEST_USERNAME)
});

console.error = () => {}; //For supressing warnings