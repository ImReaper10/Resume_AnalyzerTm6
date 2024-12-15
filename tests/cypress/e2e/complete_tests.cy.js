/// <reference types="cypress" />

const path = require("path");

function generateRandomCredentials() {
  const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const randomString = (length) => Array.from({ length }, () => characters[Math.floor(Math.random() * characters.length)]).join('');
  
  const domains = ['example.com', 'test.com', 'domain.com'];
  const randomEmail = `${randomString(8)}@${domains[Math.floor(Math.random() * domains.length)]}`;
  const randomUsername = randomString(10);
  const randomPassword = randomString(12) + "aA123";

  return {
      email: randomEmail,
      username: randomUsername,
      password: randomPassword
  };
}

let testCreds = generateRandomCredentials();

//========= James Goode =========
//The complete end to end testing of our web app (needs both the frontend and backend to work properly)
describe('End-to-end tests', () => {
  beforeEach(() => {
    cy.deleteDownloadsFolder();
    localStorage.setItem("useMockAI", "yes");
    cy.restoreLocalStorage();
    cy.visit('http://localhost:3000')
  })

  it('Sign up', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.contains("Go to Sign Up").click();
    cy.get("input[placeholder=\"Email\"]").type("not an email");
    cy.get("input[placeholder=\"Username\"]").type(testCreds.username);
    cy.get("input[placeholder=\"Password\"]").type(testCreds.password);
    cy.get("input[placeholder=\"Confirm password\"]").type(testCreds.password);

    cy.contains("Password must include at least one special character.").should('be.visible');

    testCreds.password += "#";
    cy.get("input[placeholder=\"Password\"]").clear().type(testCreds.password);
    cy.contains("Passwords do not match").should('be.visible');
    cy.get("input[placeholder=\"Confirm password\"]").clear().type(testCreds.password);

    cy.get("button").contains("Sign Up").wait(500).click();
    cy.get('input:invalid').should('have.length', 1);
    cy.get("input[placeholder=\"Email\"]").clear().type(testCreds.email);

    cy.get('input:invalid').should('have.length', 0);
    cy.get("button").contains("Sign Up").wait(500).click();

    cy.contains("Sign up successful! Please log in with your new credentials.").should('be.visible');
  })

  it('Login', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.get("input[placeholder=\"Email\"]").type(testCreds.email);
    cy.get("input[placeholder=\"Password\"]").type(testCreds.password + "not the right password");
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains("Invalid email or password").should('be.visible');
    cy.get("input[placeholder=\"Email\"]").clear().type("notcorrect" + testCreds.email);
    cy.get("input[placeholder=\"Password\"]").clear().type(testCreds.password);
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains("Invalid email or password").should('be.visible');
    cy.get("input[placeholder=\"Email\"]").clear().type(testCreds.email);
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains(testCreds.username).should('be.visible');
    cy.saveLocalStorage();
  })

  it('Resume and Job Description upload', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.contains("Upload Your Resume and Job Description").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/large-file.pdf');
    cy.contains("File size exceeds the limit of 2MB.").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/large-docx.docx');
    cy.contains("File size exceeds the limit of 2MB.").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/invalid-file.txt');
    cy.contains("Invalid file type. Only PDF or DOCX files are allowed.").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/fakeresume.docx');
    cy.get("textarea").invoke("val", "A".repeat(5000)).type("A");

    cy.contains("5001 characters").should('have.css', 'color').and('eq', 'rgb(255, 0, 0)');

    cy.get("textarea").clear().type("Test");
    cy.contains("4 characters").should('be.visible');

    cy.get("textarea").clear().type("sample text...");

    cy.wait(500);

    cy.get("button").contains("Upload").click();
    cy.contains("Loading...").should('be.visible');

    cy.contains("Resume Fit Score").should('be.visible');
    cy.contains("Download PDF Report").should('be.visible');
    cy.saveLocalStorage();
  })

  it('Check Analysis Results', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.wait(5000);
    
    cy.contains("83%"); //We know since we are using mock AI (to preserve free tier use) it should always be this number
    cy.contains("Download PDF Report").click();

    const downloadsFolder = Cypress.config("downloadsFolder");
    let reportPath = path.join(downloadsFolder, "Resume_Analysis_Report.pdf");
    cy.readFile(reportPath).should("exist");
    
    cy.get('a[href*="/dashboard/keywords"]').click();
    cy.get('a[href*="/dashboard/keywords"]').click();
    cy.wait(1000);
    cy.contains("Matched Skills and Keywords").should('be.visible');

    cy.get('a[href*="/dashboard/suggestions"]').click();
    cy.wait(1000);
    cy.contains("Improvement Suggestions").should('be.visible');
    cy.contains("Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS.").should('be.visible');
    cy.contains("Add more details about problem-solving skills and any examples of complex challenges you've tackled.").should('be.visible');
    cy.contains("Include specific metrics or accomplishments related to working in an agile development environment.").should('be.visible');
    cy.contains("Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description.").should('be.visible');
    cy.contains("Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'.").should('be.visible');

    cy.get("select").select("skills");
    cy.contains("Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS.").should('be.visible');
    cy.contains("Add more details about problem-solving skills and any examples of complex challenges you've tackled.").should('be.visible');
    cy.contains("Include specific metrics or accomplishments related to working in an agile development environment.").should('not.exist');
    cy.contains("Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description.").should('not.exist');
    cy.contains("Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'.").should('not.exist');

    cy.get("select").select("experience");
    cy.contains("Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS.").should('not.exist');
    cy.contains("Add more details about problem-solving skills and any examples of complex challenges you've tackled.").should('not.exist');
    cy.contains("Include specific metrics or accomplishments related to working in an agile development environment.").should('be.visible');
    cy.contains("Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description.").should('be.visible');
    cy.contains("Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'.").should('not.exist');

    cy.get("select").select("formatting");
    cy.contains("Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS.").should('not.exist');
    cy.contains("Add more details about problem-solving skills and any examples of complex challenges you've tackled.").should('not.exist');
    cy.contains("Include specific metrics or accomplishments related to working in an agile development environment.").should('not.exist');
    cy.contains("Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description.").should('not.exist');
    cy.contains("Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'.").should('be.visible');

    cy.get("select").select("all");
    cy.contains("Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS.").should('be.visible');
    cy.contains("Add more details about problem-solving skills and any examples of complex challenges you've tackled.").should('be.visible');
    cy.contains("Include specific metrics or accomplishments related to working in an agile development environment.").should('be.visible');
    cy.contains("Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description.").should('be.visible');
    cy.contains("Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'.").should('be.visible');

    cy.get('a[href*="/dashboard/view"]').click();
    cy.contains("Loading...").should('be.visible');
    cy.contains("Loading...").should('not.exist');

    cy.contains("Upload another").click();

    cy.contains("Upload Your Resume and Job Description").should('be.visible');
    cy.saveLocalStorage();
  });

  it('Upload another', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.contains("Upload Your Resume and Job Description").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/large-file.pdf');
    cy.contains("File size exceeds the limit of 2MB.").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/large-docx.docx');
    cy.contains("File size exceeds the limit of 2MB.").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/invalid-file.txt');
    cy.contains("Invalid file type. Only PDF or DOCX files are allowed.").should('be.visible');

    cy.get('input[type=file]').selectFile('../tests/test-files/realistic.docx');
    cy.get("textarea").invoke("val", "A".repeat(5000)).type("A");

    cy.contains("5001 characters").should('have.css', 'color').and('eq', 'rgb(255, 0, 0)');

    cy.get("textarea").clear().type("Test");
    cy.contains("4 characters").should('be.visible');

    cy.get("textarea").clear().type("sample text...");

    cy.wait(500);

    cy.get("button").contains("Upload").click();
    cy.contains("Loading...").should('be.visible');

    cy.contains("Resume Fit Score").should('be.visible');
    cy.contains("Download PDF Report").should('be.visible');

    cy.saveLocalStorage();
  });

  it('Signing out and signing back in', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.contains("Upload Your Resume and Job Description").should('be.visible');

    cy.contains("Sign Out").click();

    cy.contains("Login").should('be.visible');

    cy.get("input[placeholder=\"Email\"]").type(testCreds.email);
    cy.get("input[placeholder=\"Password\"]").type(testCreds.password + "not the right password");
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains("Invalid email or password").should('be.visible');
    cy.get("input[placeholder=\"Email\"]").clear().type("notcorrect" + testCreds.email);
    cy.get("input[placeholder=\"Password\"]").clear().type(testCreds.password);
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains("Invalid email or password").should('be.visible');
    cy.get("input[placeholder=\"Email\"]").clear().type(testCreds.email);
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains(testCreds.username).should('be.visible');
    cy.saveLocalStorage();
  });
  
  it('Signing out and signing up for a new account', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.contains("Upload Your Resume and Job Description").should('be.visible');

    cy.contains("Sign Out").click();

    cy.contains("Login").should('be.visible');


    testCreds = generateRandomCredentials();

    cy.contains("Go to Sign Up").click();
    cy.get("input[placeholder=\"Email\"]").type("not an email");
    cy.get("input[placeholder=\"Username\"]").type(testCreds.username);
    cy.get("input[placeholder=\"Password\"]").type(testCreds.password);
    cy.get("input[placeholder=\"Confirm password\"]").type(testCreds.password);

    cy.contains("Password must include at least one special character.").should('be.visible');

    testCreds.password += "#";
    cy.get("input[placeholder=\"Password\"]").clear().type(testCreds.password);
    cy.contains("Passwords do not match").should('be.visible');
    cy.get("input[placeholder=\"Confirm password\"]").clear().type(testCreds.password);

    cy.get("button").contains("Sign Up").wait(500).click();
    cy.get('input:invalid').should('have.length', 1);
    cy.get("input[placeholder=\"Email\"]").clear().type(testCreds.email);

    cy.get('input:invalid').should('have.length', 0);
    cy.get("button").contains("Sign Up").wait(500).click();

    cy.contains("Sign up successful! Please log in with your new credentials.").should('be.visible');
    cy.saveLocalStorage();
  });

  it('Try logging in to new account, after previously signing in to an old one', () => {
    Cypress.config('defaultCommandTimeout', 30000);
    cy.get("input[placeholder=\"Email\"]").type(testCreds.email);
    cy.get("input[placeholder=\"Password\"]").type(testCreds.password + "not the right password");
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains("Invalid email or password").should('be.visible');
    cy.get("input[placeholder=\"Email\"]").clear().type("notcorrect" + testCreds.email);
    cy.get("input[placeholder=\"Password\"]").clear().type(testCreds.password);
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains("Invalid email or password").should('be.visible');
    cy.get("input[placeholder=\"Email\"]").clear().type(testCreds.email);
    cy.get("button").contains("Login").click();
    cy.contains("Loading...").should('be.visible');
    cy.contains(testCreds.username).should('be.visible');
    cy.saveLocalStorage();
  });
})
