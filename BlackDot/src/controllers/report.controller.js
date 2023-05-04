const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const puppeteer = require("chrome-aws-lambda");

const generateTemplate = async (req, res) => {
  try {
    const { graphImage, reportTitle } = req.body;

    const logoImage = fs.readFileSync(
      path.join(__dirname, "../../public/assets/$zebrands-brand-logo.svg")
    );

    const logoImageEncoded = logoImage.toString("base64");

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

    const browser = await puppeteer.launch({
      args: puppeteer.defaultArgs(),
      defaultViewport: puppeteer.defaultViewport,
      executablePath: await puppeteer.executablePath(),
      headless: puppeteer.headless,
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
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  generateTemplate,
}