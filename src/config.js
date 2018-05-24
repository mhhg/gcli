
// export const clientConfiguration = {
//   server: {
//     // domain: "app.reglazh.com",
//     domain: "localhost",
//     port: "8000"
//   },
//   routes: {
//     main: "/admin",
//     login: "/api/login"
//   }
// };

// const HTTPMethods = {
//   post: "POST",
//   get: "GET",
//   put: "PUT",
//   patch: "PATCH",
//   delete: "DELETE"
// };

// export class AdminConfig {
//   static serverURL() {
//     if (clientConfiguration.server.port !== "80") {
//       return `http://${clientConfiguration.server.domain}:${clientConfiguration.server.port}`
//     }
//     return `http://${clientConfiguration.server.domain}`
//   }

//   static groupedPATH(path) {
//     return `${this.serverURL()}${clientConfiguration.routes.main}${path}`
//   }

//   static loginPATH() {
//     return `${this.serverURL()}${clientConfiguration.routes.login}?admin=true`
//   }
// };



const Addr = "http://0.0.0.0";

module.exports = {
  Addr: Addr
}