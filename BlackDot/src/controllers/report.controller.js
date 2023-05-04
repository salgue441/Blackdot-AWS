const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const Xvfb = require("xvfb");
const xvfb = new Xvfb({
  silent: true,
  xvfb_args: ["-screen", "0", "1280x800x24", "-ac"],
});

const generateTemplate = async (req, res) => {
  try {
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

    // Start the virtual display
    xvfb.startSync();

    // Generate the PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setContent(template, { waitUntil: "networkidle0" });
    await page.pdf({
      path: "public/reports/report.pdf",
      format: "A4",
      printBackground: true,
    });

    // Close the browser and stop the virtual display
    await browser.close();
    xvfb.stopSync();

    const fileName = "report";
    const domain = process.env.DOMAIN || "http://localhost:3000";

    return res.status(201).json({ success: true, fileName, domain });
  }
  catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
}

module.exports = {
  generateTemplate
}