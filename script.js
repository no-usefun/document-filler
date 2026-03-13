const upload = document.getElementById("signatureUpload");
const preview = document.getElementById("signaturePreview");
const text = document.getElementById("signatureText");
const box = document.querySelector(".signature-box");

let isDragging = false;
let offsetX = 0;
let offsetY = 0;

/* Upload signature */

upload.addEventListener("change", function () {
  const file = this.files[0];

  if (!file) return;

  preview.src = URL.createObjectURL(file);
  preview.style.display = "block";
  text.style.display = "none";

  preview.style.left = "0px";
  preview.style.top = "0px";
});

/* Start dragging */

preview.addEventListener("mousedown", function (e) {
  isDragging = true;

  offsetX = e.clientX - preview.offsetLeft;
  offsetY = e.clientY - preview.offsetTop;

  preview.style.cursor = "grabbing";
});

/* Drag move */

document.addEventListener("mousemove", function (e) {
  if (!isDragging) return;

  const boxRect = box.getBoundingClientRect();

  let x = e.clientX - offsetX;
  let y = e.clientY - offsetY;

  /* keep inside signature box */

  const maxX = box.clientWidth - preview.clientWidth;
  const maxY = box.clientHeight - preview.clientHeight;

  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));

  preview.style.left = x + "px";
  preview.style.top = y + "px";
});

/* Stop dragging */

document.addEventListener("mouseup", function () {
  isDragging = false;
  preview.style.cursor = "grab";
});

/* ---------- PDF GENERATION ---------- */

const { jsPDF } = window.jspdf;

document
  .getElementById("downloadPDF")
  .addEventListener("click", async function () {
    const page = document.querySelector(".printable-page");

    const canvas = await html2canvas(page, {
      scale: 1.5,
      useCORS: true,
    });

    const img = canvas.toDataURL("image/jpeg"); // compression

    const pdf = new jsPDF("p", "mm", "a4");

    const width = 210;
    const height = 297;

    pdf.addImage(img, "JPEG", 0, 0, width, height);

    pdf.save("gst-declaration.pdf");
  });

/* ---------- XML PARSING ---------- */
document.getElementById("xmlUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();

  reader.onload = function () {
    const parser = new DOMParser();
    const xml = parser.parseFromString(reader.result, "text/xml");

    const voucher = xml.getElementsByTagName("VOUCHER")[0];

    const inventory = voucher.getElementsByTagName("INVENTORYENTRIES.LIST")[0];

    const data = {
      serialNo: getValue(voucher, "VOUCHERNUMBER"),

      consignorDetails: getValue(voucher, "CMPNAME"),

      consigneeDetails: getValue(voucher, "PARTYNAME"),

      placeOfDespatch: getValue(voucher, "CMPNAME"),

      destination: getValue(voucher, "DESTINATION"),

      descriptionOfGoods: getValue(inventory, "STOCKITEMNAME"),

      quantity: getValue(voucher, "TOTALQTY"),

      valueRate1: getValue(inventory, "RATE"),

      weight: "",

      valueRate2: getValue(voucher, "TOTALAMOUNT"),

      consignmentNoteDetails: getValue(voucher, "VOUCHERNUMBER"),

      gstCertificateNumber: "",

      gstNumber: "",

      declarationDate: formatDate(getValue(voucher, "DATE")),
    };

    fillForm(data);
  };

  reader.readAsText(file);
});

function getValue(parent, tag) {
  const el = parent.getElementsByTagName(tag)[0];

  return el ? el.textContent.trim() : "";
}

function formatDate(date) {
  if (!date) return "";

  return (
    date.substring(6, 8) +
    "-" +
    date.substring(4, 6) +
    "-" +
    date.substring(0, 4)
  );
}

function fillForm(data) {
  Object.keys(data).forEach((key) => {
    const element = document.getElementById(key);

    if (!element) return;

    if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
      element.value = data[key];
    }

    autoFitText(element);
  });
}

function autoFitText(element) {
  if (!element) return;

  let fontSize = 14;

  element.style.fontSize = fontSize + "px";

  while (fontSize > 6 && element.scrollHeight > element.clientHeight) {
    fontSize--;

    element.style.fontSize = fontSize + "px";
  }
}

/* apply to all table inputs */

document
  .querySelectorAll(".input-col input, .input-col textarea")
  .forEach((el) => {
    el.addEventListener("input", () => autoFitText(el));
  });
