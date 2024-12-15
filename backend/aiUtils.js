const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const { z } = require("zod");
const { zodResponseFormat } = require("openai/helpers/zod");
const crypto = require('crypto');
const axios = require('axios');
const API_URL = 'http://127.0.0.1:5000/api';
const { removeStopwords, eng } = require('stopword')

let openai;
try
{
  openai = new OpenAI();
}
catch(e)
{
  console.log("OPENAI_API_KEY environment variable is missing or empty, if you are running tests, this is okay");
}

//Key for securing /analyze requests so they only happen by authorized parties (mainly just the backend)
const SECRET_ANALYSIS_FILE_PATH = path.join(__dirname, "analysis_secret.key");

//=========== Javin Kenta ===========
//Task 19, format of response from AI
const resume_analysis = z.object({
  fitScore: z.number({description: "Must be a number between 0 and 100"}),
  improvementSuggestions: z.array(z.object({
    category: z.string({description: "Must be one of 'skills', 'experience', or 'formatting'"}),
    text: z.string()
  }), {description: "Preferably at least 5 suggestions"}),
  keywordsInJobDescription: z.array(z.string()),
  matchedKeywordsInResume: z.array(z.string()),
});

//=========== Japjot Bedi and James Goode ===========
//Function called by /api/fitscore to get analysis results
async function analyze(job_description, resume_text, mock)
{
  job_description = removeStopwords(job_description.split(/[\s\.,;]+/), eng).join(" ");
  resume_text = removeStopwords(resume_text.split(/[\s\.,;]+/), eng).join(" ");
  let metrics = await getMetrics(job_description, resume_text, mock);
  metrics.fitScore = await calculateFitScore(metrics.fitScore, metrics.keywordsInJobDescription, metrics.matchedKeywordsInResume);
  return metrics;
}

//=========== Oscar Cotto ===========
//Task 22, Fit score calculations, that prioritizes specific words over others
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
    matchScore += getKeywordWeight(keyword);
  });

  let maxScore = 0;
  keywordsInJobDescription.forEach(keyword => {
    maxScore += getKeywordWeight(keyword);
  });

  // Normalize the match score based on the total number of job keywords
  const normalizedMatchScore = Math.min((matchScore / maxScore) * 100, 100);

  // Calculate the final fit score by averaging the current fit score and the normalized match score
  const weightedFitScore = Math.round(fitScore * 0.5 + normalizedMatchScore * 0.5);

  return weightedFitScore;
}

//=========== James Goode ===========
//Checks correctness of data returned from calling /api/analyze
async function getMetrics(job_description, resume_text, mock)
{
  try {
    if (!job_description || !resume_text) {
        throw new Error("Invalid input: Job description or resume text is empty.");
    }
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
      analysis_secret,
      mock
    });
    if (!metrics || !metrics?.data) {
        throw new Error("Invalid API Response: Missing metrics data.");
    }
    if (!metrics.data.keywordsInJobDescription || !metrics.data.matchedKeywordsInResume || !metrics.data.improvementSuggestions || metrics.data.fitScore < 0 || metrics.data.fitScore > 100) {
        throw new Error("API response is invalid.");
    }
    return metrics.data;
   } catch (error) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status || "unknown";
            console.error(`API Error: HTTP Status ${status}. Message: ${error.message}`);
            if (status === 400) {
                throw new Error("Bad Request: Please check your inputs.");
            } else if (status === 401) {
                throw new Error("Unauthorized: Invalid API key or credentials.");
            } else if (status === 500) {
                throw new Error("Internal Server Error: The API failed to process the request.");
            }
            throw new Error(`Unexpected API error: ${error.message}`);
        } else {
            console.error("Error in getMetrics:", error.message);
            throw new Error(`Unexpected error in getMetrics: ${error.message}`);
        }
    }
}

//=========== James Goode and Javin Kenta (for format of response and request) ===========
//Sends request to OpenAI, and makes sure parameters and response is valid
async function getRawMetrics(job_description, resume_text, mock)
{
   try {
     if (
                typeof job_description !== "string" ||
                typeof resume_text !== "string" ||
                job_description.length === 0 ||
                resume_text.length === 0 ||
                job_description.length > 5000 ||
                resume_text.length > 5000
            ) {
                throw new Error("Invalid input: Job description or resume text is empty or exceeds allowed length.");
            }
            const completion = await doAIRequest(job_description, resume_text, mock);
            if (!completion || !completion.choices || completion.choices.length === 0) {
              throw new Error("API returned an empty response or invalid format.");
            }
            const parsed = completion.choices[0].message?.parsed;
            if (!parsed || !parsed.keywordsInJobDescription || !parsed.matchedKeywordsInResume || !parsed.improvementSuggestions) {
              throw new Error("Invalid API response: Missing fitScore, feedback, or keywords.");
            }
            if(parsed.fitScore < 0 || parsed.fitScore > 100)
            {
              throw new Error("Invalid API response: Invalid fitscore.");
            }
            return completion.choices[0].message.parsed;
   } catch (error) {
            if (axios.isAxiosError(error)) {
                const status = error.response?.status || "unknown";
                console.error(`API Error: HTTP Status ${status}. Message: ${error.message}`);
                if (status === 404) {
                    throw new Error("API endpoint not found (404).");
                } else if (status === 500) {
                    throw new Error("Internal server error (500).");
                }
                throw new Error(`Unexpected API error: ${error.message}`);
            } else {
                throw new Error("Failed to generate analysis results. Please try again later. Error in getRawMetrics: " + error.message);
            }
        }
}

//=========== James Goode and Javin Kenta (for format of response and request) ===========
//Put together the request, and also handle potential mocking of a real request
async function doAIRequest(job_description, resume_text, mock)
{
  if(mock === "mock correct")
  {
    return {
        choices: [
          {
            message: {
              parsed: {"fitScore":85,"improvementSuggestions":[{"category":"skills","text":"Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS."},{"category":"experience","text":"Include specific metrics or accomplishments related to working in an agile development environment."},{"category":"skills","text":"Add more details about problem-solving skills and any examples of complex challenges you've tackled."},{"category":"experience","text":"Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description."},{"category":"formatting","text":"Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'."}],"keywordsInJobDescription":["Software Developer","Java","Python","backend systems","APIs","Spring Boot","Django","Flask","SQL","NoSQL","AWS","Azure","GCP","Docker","Kubernetes","problem-solving","object-oriented programming","agile"],"matchedKeywordsInResume":["Java","Python","Spring Boot","Django","Flask","Docker","Kubernetes","AWS","MySQL","PostgreSQL","MongoDB","Agile","Object-Oriented Design","API Integration"]}
            }
          }
        ]
    }
  }
  else if(mock === "mock bad fit score")
  {
    return {
        choices: [
          {
            message: {
              parsed: {"fitScore":105,"improvementSuggestions":[{"category":"skills","text":"Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS."},{"category":"experience","text":"Include specific metrics or accomplishments related to working in an agile development environment."},{"category":"skills","text":"Add more details about problem-solving skills and any examples of complex challenges you've tackled."},{"category":"experience","text":"Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description."},{"category":"formatting","text":"Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'."}],"keywordsInJobDescription":["Software Developer","Java","Python","backend systems","APIs","Spring Boot","Django","Flask","SQL","NoSQL","AWS","Azure","GCP","Docker","Kubernetes","problem-solving","object-oriented programming","agile"],"matchedKeywordsInResume":["Java","Python","Spring Boot","Django","Flask","Docker","Kubernetes","AWS","MySQL","PostgreSQL","MongoDB","Agile","Object-Oriented Design","API Integration"]}
            }
          }
        ]
    }
  }
  else if(mock === "mock missing suggestions")
  {
    return {
        choices: [
          {
            message: {
              parsed: {"fitScore":85,"keywordsInJobDescription":["Software Developer","Java","Python","backend systems","APIs","Spring Boot","Django","Flask","SQL","NoSQL","AWS","Azure","GCP","Docker","Kubernetes","problem-solving","object-oriented programming","agile"],"matchedKeywordsInResume":["Java","Python","Spring Boot","Django","Flask","Docker","Kubernetes","AWS","MySQL","PostgreSQL","MongoDB","Agile","Object-Oriented Design","API Integration"]}
            }
          }
        ]
    }
  }
  else if(mock === "mock missing keywords in job description")
  {
    return {
        choices: [
          {
            message: {
              parsed: {"fitScore":85,"improvementSuggestions":[{"category":"skills","text":"Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS."},{"category":"experience","text":"Include specific metrics or accomplishments related to working in an agile development environment."},{"category":"skills","text":"Add more details about problem-solving skills and any examples of complex challenges you've tackled."},{"category":"experience","text":"Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description."},{"category":"formatting","text":"Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'."}],"matchedKeywordsInResume":["Java","Python","Spring Boot","Django","Flask","Docker","Kubernetes","AWS","MySQL","PostgreSQL","MongoDB","Agile","Object-Oriented Design","API Integration"]}
            }
          }
        ]
    }
  }
  else if(mock === "mock missing keywords in resume")
  {
    return {
        choices: [
          {
            message: {
              parsed: {"fitScore":85,"improvementSuggestions":[{"category":"skills","text":"Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS."},{"category":"experience","text":"Include specific metrics or accomplishments related to working in an agile development environment."},{"category":"skills","text":"Add more details about problem-solving skills and any examples of complex challenges you've tackled."},{"category":"experience","text":"Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description."},{"category":"formatting","text":"Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'."}],"keywordsInJobDescription":["Software Developer","Java","Python","backend systems","APIs","Spring Boot","Django","Flask","SQL","NoSQL","AWS","Azure","GCP","Docker","Kubernetes","problem-solving","object-oriented programming","agile"]}
            }
          }
        ]
    }
  }
  else if(!openai) //Mock AI response used if not setup
  {
    return {
        choices: [
          {
            message: {
              parsed: {"fitScore":85,"improvementSuggestions":[{"category":"skills","text":"Highlight specific experience with cloud platforms, mentioning familiarity with Azure and GCP, as well as AWS."},{"category":"experience","text":"Include specific metrics or accomplishments related to working in an agile development environment."},{"category":"skills","text":"Add more details about problem-solving skills and any examples of complex challenges you've tackled."},{"category":"experience","text":"Explicitly mention any experience with NoSQL databases in the resume, as it is highlighted in the job description."},{"category":"formatting","text":"Consider separating skills into categories more clearly to improve readability, such as 'Programming Languages', 'Frameworks', 'Tools', and 'Databases'."}],"keywordsInJobDescription":["Software Developer","Java","Python","backend systems","APIs","Spring Boot","Django","Flask","SQL","NoSQL","AWS","Azure","GCP","Docker","Kubernetes","problem-solving","object-oriented programming","agile"],"matchedKeywordsInResume":["Java","Python","Spring Boot","Django","Flask","Docker","Kubernetes","AWS","MySQL","PostgreSQL","MongoDB","Agile","Object-Oriented Design","API Integration"]}
            }
          }
        ]
    }
  }
  return await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "You are a helpful resume analysis tool. Give guidance to a user about how there resume can be improved based on the given job description and resume. The fitScore is a number between 0-100." },
      { role: "user", content: "Job description with stopwords removed:\n" + job_description + "\n\n" + "Resume with stopwords removed:\n==Resume Start==\n" + resume_text + "\n==Resume End=="},
    ],
    response_format: zodResponseFormat(resume_analysis, "resume_analysis"),
  });
}

//=========== James Goode ===========
//Sample code for checking if OpenAI request works correctly
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

module.exports = { getRawMetrics, analyze, calculateFitScore };
