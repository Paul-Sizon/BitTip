'use client';

import { useState } from "react";

export default function UploadForm() {
  const [filesName, setFilesName] = useState("");
  const [filesDescription, setFilesDescription] = useState("");
  const [files, setFiles] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (files) {
      let filesArray = Array.from(files);
      await uploadFiles(filesArray);
    } else {
      console.error('No files selected');
    }
  }

  async function uploadFiles(filesArray) {
    let formData = new FormData();
    filesArray.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    formData.append("name", filesName);
    formData.append("description", filesDescription);
    await uploadToIPFS(formData);
  }

  async function uploadToIPFS(formData) {
    try {
      const response = await fetch("/api/put-file", {
        method: "POST",
        body: formData,
      });
      if (response.status !== 200) {
        console.error("Error response from API:", response);
      } else {
        console.log("Form successfully submitted!");
        const responseJSON = await response.json();
        console.log("CID:", responseJSON.cid);
        return responseJSON.cid;
      }
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      alert(`Oops! Something went wrong. Please refresh and try again. Error: ${error.message}`);
    }
  }

  return (
    <div>
      <section>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="files-name">Files Name</label>
            <div>
              <input
                id="files-name"
                name="files-name"
                type="text"
                required
                value={filesName}
                onChange={(e) => setFilesName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="files-description">Files Description</label>
            <div>
              <input
                id="files-description"
                name="files-description"
                type="text"
                required
                value={filesDescription}
                onChange={(e) => setFilesDescription(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="files">Project Files</label>
            <div>
              <input
                type="file"
                id="files"
                multiple
                required
                onChange={(e) => {
                  setFiles(e.target.files);
                }}
              />
            </div>
          </div>

          <div>
            <button type="submit">Upload Files</button>
          </div>
        </form>
      </section>
    </div>
  );
}
