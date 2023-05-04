const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

const generateTemplate = async (req, res) => {
  const { graphImage, reportTitle } = req.body;

  // Read the logo image file and encode it as base64
  const logoImage = fs.readFileSync(
    path.join(__dirname, "../../public/assets/$zebrands-brand-logo.svg")
  );

  const logoImageEncoded = logoImage.toString("base64");

  // Generate the PDF
  const template = await ejs.renderFile(
    path.join(__dirname, "../views/static/reports/template.ejs"),
    {
      title: reportTitle,
      graphImage: graphImage,
      logoImage: `data:image/svg+xml;base64,${logoImageEncoded}`,
      pageNumber: 1,
      totalPages: 1,
    }
  );

  // Generate the PDF
  const browser = await puppeteer.launch({
    headless: 'new'
  });

  const page = await browser.newPage();
  await page.setContent(template, { waitUntil: "networkidle0" });
  await page.pdf({
    path: "public/reports/report.pdf",
    format: "A4",
    printBackground: true,
  });

  await browser.close();

  const fileName = "report";
  const domain = process.env.DOMAIN || "http://localhost:3000";

  return res.status(201).json({ success: true, fileName, domain });
};

module.exports = {
  generateTemplate,
};
