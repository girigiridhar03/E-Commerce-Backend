function generateDynamicSKU(productName, attributes) {
  const short = productName.replace(/\s+/g, "").subString(0, 6).toUpperCase();

  let attrCode = [];

  for (let [key, value] of attributes.entries()) {
    const code = value.replace(/\s+/g, "").subString(0, 3).toUpperCase();
    attrCode.push(code);
  }

  const random = Math.floor(1000 + Math.random() * 9000);

  return `${short}-${attrCode.join("-")}-${random}`;
}
