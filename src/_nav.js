export default {
  items: [{
    title: true, name: "User", wrapper: {
      // optional wrapper object
      element: "", // required valid HTML5 element tag
      attributes: {} // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
    },
    class: "" // optional class names space delimited list for title item ex: "text-center"
  }, {
    name: "User", url: "/user", icon: "icon-user", badge: { variant: "info", text: "" }
  }, {
    title: true, name: "Provider", wrapper: { element: "", attributes: {} }, class: ""
  }, {
    name: "Providers", url: "/provider", icon: "icon-grid", badge: { variant: "info", text: "" }
  }, {
    name: "Repair", url: "/repair", icon: "icon-graph", badge: { variant: "info", text: "" }
  }, {
    name: "Map", url: "/map", icon: "icon-map", badge: { variant: "info", text: "" }
  }]
};
