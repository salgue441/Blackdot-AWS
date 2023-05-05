/**
 * @file report.front.js
 * @brief Frontend for report page
 * @author Yuna Chung
 * @date 2023-04-27
 * @version 1.0
 *
 * @copyright Copyright 2023 (c) - MIT License
 */

/**
 * @brief
 * Fetches the template from the server
 * @param {Object} data - Data to be sent to the server
 * @returns {String} - HTML template
 */
const fetchTemplate = async (data) => {
  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  }

  const response = await fetch('/report/renderTemplate', options)
  const template = await response.text()

  return template
}

/**
 * @brief
 * Generates a PDF file from the chart
 * @param {String} canvasID - ID of the chart canvas
 * @param {String} pageTitle - Title of the page
 * @returns {void} - Nothing
 */
const generatePDF = async (canvasID, pageTitle) => {
  const chartCanvas = document.getElementById(canvasID)
  const chartImage = chartCanvas.toDataURL('image/png', 1.0)
  const template = await fetchTemplate({ chartImage, reportTitle: pageTitle })

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [16, 9],
  })

  // Zebrands logo
  pdf.text("Zëbrands",
    pdf.internal.pageSize.getWidth() - 1.5, 0.5, 1, 1);
  pdf.text(new Date().toLocaleDateString(), 0.5, 0.5);

  // PAGE TITLE (center the text)
  pdf.setFontSize(20)
  pdf.text(pageTitle, 8, 0.5, { align: 'center' })

  // Graph
  pdf.addImage(chartImage, 'PNG', 0.5, 1.5, 15, 7)

  pdf.save(`${pageTitle}.pdf`)
}
