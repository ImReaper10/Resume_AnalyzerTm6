/* eslint-disable testing-library/no-node-access */
import { render, screen } from '@testing-library/react';
import App from './App';
import { setMocking, getUploadedData} from './utils/networkmanager.js';
import userEvent from '@testing-library/user-event'
import * as fs from 'fs';
import exp from 'constants';
import { fail } from 'assert';

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

test('Uploading valid pdf resume (after trying invalid files)', async () => {
  render(<App />);
  const fileInput = screen.getByLabelText("Select Resume (PDF/DOCX):");
  const jobDescriptionInput = screen.getByLabelText("Job Description:");
  console.log(fs.readFileSync("../tests/test-files/invalid-file.txt"));
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
            res2()
          },500);
        });
      }
      catch(e)
      {
        err(e);
      }
      res()
    }, 1000);
  });
});

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