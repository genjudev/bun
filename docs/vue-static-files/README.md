# serve static and wildcard files example

### bun vue
```js
const bun = require("bunserver");
const fs = require("fs");
const path = require("path");

const ext = [
  "ase",
  "art",
  "bmp",
  "blp",
  "cd5",
  "cit",
  "cpt",
  "cr2",
  "cut",
  "dds",
  "dib",
  "djvu",
  "egt",
  "exif",
  "gif",
  "gpl",
  "grf",
  "icns",
  "ico",
  "iff",
  "jng",
  "jpeg",
  "jpg",
  "jfif",
  "jp2",
  "jps",
  "lbm",
  "max",
  "miff",
  "mng",
  "msp",
  "nitf",
  "ota",
  "pbm",
  "pc1",
  "pc2",
  "pc3",
  "pcf",
  "pcx",
  "pdn",
  "pgm",
  "PI1",
  "PI2",
  "PI3",
  "pict",
  "pct",
  "pnm",
  "pns",
  "ppm",
  "psb",
  "psd",
  "pdd",
  "psp",
  "px",
  "pxm",
  "pxr",
  "qfx",
  "raw",
  "rle",
  "sct",
  "sgi",
  "rgb",
  "int",
  "bw",
  "tga",
  "tiff",
  "tif",
  "vtf",
  "xbm",
  "xcf",
  "xpm",
  "3dv",
  "amf",
  "ai",
  "awg",
  "cgm",
  "cdr",
  "cmx",
  "dxf",
  "e2d",
  "egt",
  "eps",
  "fs",
  "gbr",
  "odg",
  "svg",
  "stl",
  "vrml",
  "x3d",
  "sxd",
  "v2d",
  "vnd",
  "wmf",
  "emf",
  "art",
  "xar",
  "png",
  "webp",
  "jxr",
  "hdp",
  "wdp",
  "cur",
  "ecw",
  "iff",
  "lbm",
  "liff",
  "nrrd",
  "pam",
  "pcx",
  "pgf",
  "sgi",
  "rgb",
  "rgba",
  "bw",
  "int",
  "inta",
  "sid",
  "ras",
  "sun",
  "tga",
];

bun.routes = [
  {
    path: "/",
    method: "GET,POST",
    fun: async (req, res) => {
      req.url = "/index.html";

      try {
        const result = await new Promise((resolve, reject) => {
          fs.readFile("./static/dist" + req.url, "utf8", (err, data) => {
            if (err) {
              console.error(err);
              reject({ status: 404, body: "" });
            }
            resolve({ status: 200, body: data });
          });
        });

        res.status(result.status).send(result.body);
      } catch (e) {
        console.error(e);
        res.status(404).send("");
      }
    },
  },
  {
    path: "/users/*",
    method: "GET",
    fun: async (req, res) => {
      return res.status(200).send('body');
    }
  },
  {
    path: "/.*",
    method: "GET",
    fun: async (req, res) => {
      try {
        const result = await new Promise((resolve, reject) => {
          let encode = "utf8";
          if (ext.includes(path.extname(req.url).substring(1))) encode = "";
          fs.readFile("./static/dist" + req.url, encode, (err, data) => {
            if (err) {
              console.error(err);
              reject({ status: 404, body: "" });
            }
            resolve({ status: 200, body: data });
          });
        });

        res.status(result.status).send(result.body);
      } catch (e) {
        res.status(404).send("");
      }
    },
  },
];

bun.start();
```