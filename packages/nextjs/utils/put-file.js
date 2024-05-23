import multiparty from "multiparty";
import nextConnect from "next-connect";
import { File, Web3Storage, getFilesFromPath } from "web3.storage";
import { promises as fsPromises } from "fs";
import { resolve, join, dirname } from "path";

const handler = nextConnect();

handler.use((req, res, next) => {
  const form = new multiparty.Form();

  form.parse(req, (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ error: 'Error parsing form' });
    }
    req.body = fields;
    req.files = files;
    next();
  });
});

handler.post(async (req, res) => {
  try {
    const files = await makeFileObjects(req.body, req.files);
    const cid = await storeFiles(files);

    return res.status(200).json({ success: true, cid });
  } catch (err) {
    console.error('Error storing files:', err);
    return res.status(500).json({ error: 'Error storing the file', success: false });
  }
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;

async function storeFiles(files) {
  const client = makeStorageClient();
  try {
    const cid = await client.put(files);
    return cid;
  } catch (error) {
    console.error('Error putting files to IPFS:', error);
    throw error;
  }
}

async function getNewPath(item) {
  if (item[0].originalFilename && item[0].originalFilename !== "") {
    const filePath = resolve(process.cwd(), item[0].path);
    const newPath = join(dirname(filePath), item[0].originalFilename);
    await fsPromises.rename(filePath, newPath);
    return newPath;
  }
  return item[0].path;
}

async function makeFileObjects(text, myFiles) {
  const files = [];
  const buffer = Buffer.from(JSON.stringify(text));
  
  for (const item of Object.values(myFiles)) {
    const newPath = await getNewPath(item);
    const newFiles = await getFilesFromPath(newPath);
    files.push(...newFiles);
  }

  files.push(new File([buffer], "data.json"));
  return files;
}

function makeStorageClient() {
  return new Web3Storage({ token: process.env.WEB3STORAGE_TOKEN });
}
