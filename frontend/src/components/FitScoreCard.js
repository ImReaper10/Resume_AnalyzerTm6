import React from 'react';
import '../styling/FitScoreCard.css'; 
import LoadingWheel from './LoadingWheel';

//===========================Husain Awan===========================
import jsPDF from 'jspdf';

function generatePDF() {
  const analysisResults = JSON.parse(localStorage.getItem("analysisResults")) || {};
  const fitScore = parseInt(analysisResults.fitScore) || 0;

  // Use the correct keys for matched keywords and feedback
  const matchedKeywords = analysisResults.matchedKeywordsInResume || [];
  const feedback = (analysisResults.improvementSuggestions || []).map(
      (item) => `${item.category[0].toUpperCase() + item.category.substring(1)}: ${item.text || "No suggestion provided"}`
  );

  const doc = new jsPDF();

  // Header with bold text
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("Resume Analysis Report", 10, 10);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text(`Analysis Date: ${new Date().toLocaleDateString()}`, 10, 20);

  // Circular Progress Bar for Fit Score
  const centerX = 105; 
  const centerY = 60; 
  const radius = 20; 
  const startAngle = -0.5 * Math.PI; 
  const endAngle = startAngle + (2 * Math.PI * fitScore) / 100; // Calculate progress based on fitScore

  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Fit Score:", 50, 60); 

  // Draw full gray circle (background)
  drawArc(doc, centerX, centerY, radius, 0, 2 * Math.PI, '#ccc', 5);

  // call drawArc function for progress arc
  drawArc(doc, centerX, centerY, radius, startAngle, endAngle, '#4caf50', 5);

  // the number for the fitscore
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  const textX = centerX - (fitScore >= 100 ? 8 : 5); // Adjust text centering for 2- or 3-digit numbers
  doc.text(`${fitScore}%`, textX, centerY+2);

  // Matched Keywords Section 
  let yPosition = centerY + 40; 
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Matched Keywords:", 10, yPosition);

  doc.setFontSize(12);
  doc.setFont("helvetica", "italic");
  matchedKeywords.forEach((keyword, index) => {
      yPosition += 6;
      if (yPosition > 280) { // Check if yPosition exceeds page height
          doc.addPage();
          yPosition = 10;
      }
      doc.text(`- ${keyword}`, 10, yPosition);
  });

  // Feedback Section 
  yPosition += 20;
  if (yPosition > 280) { // Check if yPosition exceeds page height
      doc.addPage();
      yPosition = 10;
  }
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Feedback:", 10, yPosition);

  yPosition += 3;
  feedback.forEach((item, index) => {
    
      const wrappedText = doc.splitTextToSize(item, 190);
      wrappedText.forEach((line) => {
          yPosition += 6; // Adjust line height
          if (yPosition > 280) { // Check if yPosition exceeds page height
              doc.addPage();
              yPosition = 10;
          }
          doc.setFont("helvetica", "normal");
          doc.text(line, 10, yPosition);
      });
      yPosition += 6;
  });

  // Save PDF
  doc.save("Resume_Analysis_Report.pdf");
}

// drawing an arc for fitscore
function drawArc(doc, centerX, centerY, radius, startAngle, endAngle, color, lineWidth) {
    const steps = 150; 
    const angleStep = (endAngle - startAngle) / steps;

    doc.setDrawColor(color);
    doc.setLineWidth(lineWidth);

    for (let i = 0; i < steps; i++) {
        const angle1 = startAngle + i * angleStep;
        const angle2 = startAngle + (i + 1) * angleStep;

        const x1 = centerX + radius * Math.cos(angle1);
        const y1 = centerY + radius * Math.sin(angle1);
        const x2 = centerX + radius * Math.cos(angle2);
        const y2 = centerY + radius * Math.sin(angle2);

        doc.line(x1, y1, x2, y2); 
    }
}




//=========== Japjot Bedi ===========
//The overall layout for the fit score page
//================================Task 25 Diego Velasquez ====================================
//Some changes
function FitScoreCard() {

  function getFitScore()
  {
    return localStorage.getItem("analysisResults")?JSON.parse(localStorage.getItem("analysisResults")).fitScore:"100";
  }
//=================Husain Awan===================
  return (
    <div className="card">
      <h2>Resume Fit Score</h2>
      <div className="progress-container" style={{background: `conic-gradient(#4caf50 ${getFitScore()}%, #ccc ${getFitScore()}%)`}}>
        <div className="progress">
          {localStorage.getItem("analysisResults") ? 
          <span className="score">{getFitScore()}%</span> :
          <span className="score"><LoadingWheel></LoadingWheel></span>
          }
        </div>
      </div>
          { !localStorage.getItem("analysisResults")? "" : 
                  <button 
                    onClick={generatePDF} 
                    className="download-button" 
                    style={{ marginTop: "20px", padding: "10px 20px", cursor: "pointer" }}
                >
                    Download PDF Report
                </button>
            }
    </div>
  );
}

export default FitScoreCard;