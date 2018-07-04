export default {
    items: [
        {
            title: true,
            name: "User",
            wrapper: {
                // optional wrapper object
                element: "", // required valid HTML5 element tag
                attributes: {} // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
            },
            class: "" // optional class names space delimited list for title item ex: "text-center"
        },
        {
            name: "User",
            url: "/user",
            icon: "icon-user",
            badge: {
                variant: "info",
                text: ""
            }
        },
        {
            name: "Client",
            url: "/client",
            icon: "icon-user",
            badge: {
                variant: "info",
                text: ""
            }
        },
        {
            title: true,
            name: "Provider",
            wrapper: {
                // optional wrapper object
                element: "", // required valid HTML5 element tag
                attributes: {} // optional valid JS object with JS API naming ex: { className: "my-class", style: { fontFamily: "Verdana" }, id: "my-id"}
            },
            class: "" // optional class names space delimited list for title item ex: "text-center"
        },
        {
            name: "Providers",
            url: "/provider",
            icon: "icon-grid",
            badge: {
                variant: "info",
                text: ""
            }
        },
        {
            name: "Repair",
            url: "/repair",
            icon: "icon-graph",
            badge: {
                variant: "info",
                text: ""
            }
        },
        // {
        //     name: "mozhgan",
        //     url: "/mozhgan",
        //     icon: "icon-grid",
        //     badge: {
        //         variant: "info",
        //         text: ""
        //     }
        // },
        {
            name: "Map",
            url: "/map",
            icon: "icon-map",
            badge: {
                variant: "info",
                text: ""
            }
        }
        // {
        //   name: 'Typography',
        //   url: '/theme/typography',
        //   icon: 'icon-pencil',
        // },
        // {
        //   title: true,
        //   name: 'Components',
        //   wrapper: {
        //     element: '',
        //     attributes: {},
        //   },
        // },
    ]
};
