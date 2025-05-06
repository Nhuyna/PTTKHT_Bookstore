import puppeteer from "puppeteer";
import fs from "fs-extra";
import path from "path";
import hbs from "handlebars";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

hbs.registerHelper("eq", (a, b) => a === b);

hbs.registerHelper("inc", function (value) {
  return parseInt(value) + 1;
});

hbs.registerHelper("formatDate", (value) => {
  if (!value) {
    return "Invalid date";
  }

  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return "Invalid date";
  }

  const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return dateFormatter.format(date) + " " + timeFormatter.format(date);
});

hbs.registerHelper("formatCurrency", (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
});

const compile = async (templateName, data) => {
  const pathFile = path.join(
    process.cwd(),
    "src",
    "resources/views/sales",
    "orders",
    `${templateName}.hbs`
  );
  const html = await fs.readFile(pathFile, "utf-8");
  return hbs.compile(html)(data);
};

async function generateOrderPdf(orderDetails, res = null) {
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    console.log("orderDetails", orderDetails);
    const page = await browser.newPage();
    const content = await compile("orderDetail", { orderDetails });
    const order = orderDetails.order;

    // Nếu có response, gửi PDF trực tiếp đến response
    if (res) {
      await page.setContent(content);
      await page.emulateMediaType("screen");
      const pdfBuffer = await page.pdf({
        format: "A5",
        printBackground: true,
        margin: {
          top: "10px",
          right: "10px",
          bottom: "10px",
          left: "10px",
        },
      });

      await browser.close();
      res.send(pdfBuffer);
      return;
    }

    // Nếu không có response, lưu file vào thư mục exports (hành vi cũ)
    const fileName = `order_${order.IDHoaDonXuat}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "..", "public", "exports", fileName);
    console.log("filePath", filePath);

    // Ensure exports directory exists
    await fs.ensureDir(path.join(__dirname, "..", "public", "exports"));

    await page.setContent(content);
    await page.emulateMediaType("screen");
    await page.pdf({
      path: filePath,
      format: "A5",
      printBackground: true,
      margin: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px",
      },
    });
    console.log("PDF generated successfully:", fileName);
    await browser.close();

    return {
      success: true,
      message: "PDF generated successfully",
      fileName,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    if (res) {
      res.status(500).json({
        success: false,
        message: "Error generating PDF",
        error: error.message,
      });
      return;
    }

    return {
      success: false,
      message: "Error generating PDF",
      error: error.message,
    };
  }
}

export default generateOrderPdf;
