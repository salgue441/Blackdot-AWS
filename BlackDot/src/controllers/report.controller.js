const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

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
      args: ["--no-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(template);
    await page.emulateMediaType("screen");

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        bottom: "40px",
        left: "20px",
        right: "20px",
      },
    });

    await browser.close();

    res.contentType("application/pdf");
    res.send(pdf);

    return res.status(200).json({
      success: true,
      message: "Report generated successfully",
    });
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
};
