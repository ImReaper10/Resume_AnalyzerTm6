const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const crypto = require('crypto');
const axios = require('axios');
const API_URL = 'http://localhost:5000/api';

const openai = new OpenAI();
const SECRET_ANALYSIS_FILE_PATH = path.join(__dirname, "analysis_secret.key");

//Temporary Task 19
const resume_analysis = z.object({
  fitScore: z.number(),
  improvementSuggestions: z.array(z.string()),
  keywordsInJobDescription: z.array(z.string()),
  matchedKeywordsInResume: z.array(z.string()),
});

//Temporary task 24, look at https://github.com/njit-prof-bill/resume_analyzer_documentation/blob/main/API%20descriptions.md
//Ignore the example response he gives, it doesn't actually fit the other requirements
//You can add error checking, or change format if you want
async function analyze(job_description, resume_text)
{
  let metrics = await getMetrics(job_description, resume_text);
  metrics.fitScore = await calculateFitScore(metrics.fitScore, metrics.keywordsInJobDescription, metrics.matchedKeywordsInResume);
  return metrics;
}

//I would suggest if you want to give more weight to certain words like "Java", "Python", etc. currently all words are treated the same
//Note that what it says in sprint2.md, is outdated and the professor elaborated on what is required more here https://github.com/njit-prof-bill/resume_analyzer_documentation/blob/main/API%20descriptions.md
async function calculateFitScore(fitScore, keywordsInJobDescription, matchedKeywordsInResume) {
  // Define a list of high-priority keywords (e.g., key skills, certifications, etc.)
  const highPriorityKeywords = ["java", "python", "aws", "docker", "kubernetes", "sql", "spring boot", "cloud"];
  
  // Function to calculate the weight of a keyword
  function getKeywordWeight(keyword) {
    return highPriorityKeywords.includes(keyword.toLowerCase()) ? 2 : 1; // High-priority keywords get double weight
  }

  // Count the number of matched keywords (simple version)
  const totalKeywordsInJob = keywordsInJobDescription.length;
  const matchedKeywordsInResumeCount = matchedKeywordsInResume.length;

  // Calculate the total match score with weightings
  let matchScore = 0;
  matchedKeywordsInResume.forEach(keyword => {
    if (keywordsInJobDescription.includes(keyword)) {
      // Increase match score based on keyword weight
      matchScore += getKeywordWeight(keyword);
    }
  });

  // Normalize the match score based on the total number of job keywords
  const normalizedMatchScore = (matchScore / totalKeywordsInJob) * 100;

  // Calculate the final fit score by averaging the current fit score and the normalized match score
  const weightedFitScore = Math.round(fitScore * 0.5 + normalizedMatchScore * 0.5);

  return weightedFitScore;
}



async function getMetrics(job_description, resume_text)
{
  const publicKeyResponse = await axios.get(`${API_URL}/public-key`);
  const publicKey = publicKeyResponse.data.key;
  const keypairId = publicKeyResponse.data.keypairId;
  const analysis_secret = crypto.publicEncrypt(
      {
          key: publicKey,
          padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      },
      Buffer.from(fs.readFileSync(SECRET_ANALYSIS_FILE_PATH))
  );
  let metrics = await axios.post(`${API_URL}/analyze`, {
    keypairId,
    job_description,
    resume_text,
    analysis_secret
  });
  //TODO check if failed
  return metrics.data;
}

//Task 18
async function getRawMetrics(job_description, resume_text)
{
  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful resume analysis tool. Give guidance to a user about how there resume can be improved based on the given job description and resume. The fitScore is a number between 0-100." },
      { role: "user", content: "Job description:\n" + job_description + "\n\n" + "Resume:\n==Resume Start==\n" + resume_text + "\n==Resume End=="},
    ],
    response_format: zodResponseFormat(resume_analysis, "resume_analysis"),
  });
  //TODO: Add error checking (ie. API request failed)
  return completion.choices[0].message.parsed;
}

if (require.main === module) {
  (async () => {
    let analysis = await analyze("We are seeking a skilled Software Developer proficient in Java and Python to join our dynamic development team. The ideal candidate will design, develop, and maintain scalable backend systems and applications, leveraging the strengths of both programming languages. Responsibilities include building efficient APIs, integrating third-party libraries, implementing robust data-processing pipelines, and ensuring optimal application performance. Candidates should have experience with frameworks such as Spring Boot for Java and Django or Flask for Python, as well as familiarity with databases (SQL and NoSQL), cloud platforms (AWS, Azure, or GCP), and containerization tools like Docker and Kubernetes. Strong problem-solving skills, a solid understanding of object-oriented programming, and the ability to work in an agile development environment are essential.", `
  John Doe
  123 Tech Drive | Software City, Techland 54321
  Phone: (123) 456-7890 | Email: john.doe@example.com | LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

  Objective
  Dynamic and results-driven Software Engineer with over 5 years of experience in Java and Python development. Passionate about designing, developing, and deploying scalable software solutions that solve complex challenges. Seeking to leverage expertise in full-stack development and software optimization for [Company Name].

  Skills
  Programming Languages: Java, Python, JavaScript
  Frameworks & Libraries: Spring Boot, Django, Flask
  Tools & Platforms: Docker, Kubernetes, Jenkins, Git, AWS
  Database Management: MySQL, PostgreSQL, MongoDB
  Development Methodologies: Agile, Scrum
  Key Strengths: Object-Oriented Design, API Integration, Code Optimization

  Professional Experience
  Software Engineer
  Tech Solutions Inc., Software City, Techland
  July 2019 – Present
  Designed and implemented backend APIs using Java Spring Boot, improving system performance by 35%.
  Developed and maintained RESTful APIs for real-time data processing in Python.
  Automated CI/CD pipelines using Jenkins and integrated testing frameworks to enhance deployment speed by 50%.
  Collaborated with front-end teams to integrate Python-based backend services with React.js applications.
  Mentored junior developers, reducing onboarding time by 20%.

  Junior Software Developer
  Innovatech Corp., Codeville, Techland
  June 2017 – June 2019
  Created efficient and reusable code modules in Python for internal analytics tools.
  Built microservices using Java, reducing application downtime during updates.
  Debugged and resolved critical issues in both Python and Java codebases, leading to a 25% reduction in client-reported bugs.
  Contributed to database optimization efforts, enhancing query performance by 40%.

  Education
  Bachelor of Science in Computer Science
  Techland University, Software City, Techland
  Graduated: May 2017
  Relevant Coursework:
  Data Structures and Algorithms
  Object-Oriented Programming in Java
  Advanced Python Development
  Database Systems

  Certifications
  Oracle Certified Professional, Java SE Programmer
  Python for Data Science and AI (Coursera)
  AWS Certified Developer – Associate

  Projects
  E-Commerce Analytics Dashboard
  Developed a Python-based analytics dashboard to visualize sales trends, integrated with a Java Spring Boot backend for data handling.
  Implemented caching mechanisms to reduce API response time by 50%.
  Cloud-Based Inventory Management System
  Built a scalable microservices architecture using Java and Docker, integrated with AWS Lambda functions.
  Utilized Python for real-time data analysis and reporting.

  Interests
  Open-source contributions
  Machine learning and AI applications
  Participating in hackathons and coding competitions
  `)
      console.log(analysis)
  })();
}

module.exports = { getRawMetrics, analyze};