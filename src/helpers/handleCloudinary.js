// const uploadTheImage = require("../utils/cloudinary");

// async function handleCloudinaryUploads(files) {
//   let doc_details = {};

//   for (const key in files) {
//     const file = files[key][0];

//     const uploaded = await uploadTheImage(file.buffer);
//     doc_details[key] = uploaded.secure_url;
//   }

//   return doc_details;
// }

// module.exports = handleCloudinaryUploads





const uploadTheImage = require("../utils/cloudinary");

async function handleCloudinaryUploads(files) {
  let doc_details = {};

  for (const key in files) {
    const file = files[key][0];

    const isPdf = file.mimetype === "application/pdf";

    const uploaded = await uploadTheImage(
      file.buffer,
      isPdf ? "raw" : "image"
    );

    doc_details[key] = uploaded.secure_url;
  }

  return doc_details;
}

module.exports = handleCloudinaryUploads;
